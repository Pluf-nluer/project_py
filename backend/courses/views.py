from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Avg
from rest_framework import generics, status, viewsets,filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated,IsAuthenticatedOrReadOnly
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from courses.models import CourseClass, Enrollment, WaitingList, Course, UserLessonProgress, UserInterest
from courses.services import check_prerequisites, check_schedule_conflict
from courses.serializers import (
    CourseClassSerializer,
    CourseDetailSerializer,
    CourseSerializer,
    UserSerializer
)

from courses.models import CourseClass
from courses.serializers import CourseClassSerializer
from courses.models import Quiz, Question, Choice, QuizResult
from courses.serializers import QuizSerializer, QuizSubmitSerializer
from courses.models import (
    Course, CourseQuiz, CourseQuizAttempt, 
    CourseQuizAnswer, CourseQuizQuestion,Lesson
)
from courses.serializers import (
    CourseQuizListSerializer, CourseQuizAttemptSerializer,SubmitQuizSerializer, CourseDetailSerializer

)

from django.utils import timezone


User = get_user_model()

# 1. Chi tiết & Danh sách khóa học (Giữ nguyên - Đã tốt)
class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class CourseListView(generics.ListAPIView):
    queryset = Course.objects.all().order_by('-id')
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    # Hỗ trợ tìm kiếm theo tiêu đề (Search)
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'category']

    # Trong settings.py bạn đã set 'PAGE_SIZE': 6

# 2. Đăng ký tài khoản mới
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

# 3. Xem và Sửa Profile (Dùng RetrieveUpdateAPIView cho chuyên nghiệp)
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Trả về chính user đang đăng nhập
        return self.request.user

    def patch(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
# 4. API Đăng ký lớp học (Logic quan trọng nhất)
class EnrollClassView(APIView):
    permission_classes = [IsAuthenticated] # Bắt buộc đăng nhập
    

    def post(self, request):
        user = request.user # Lấy user từ token thực tế
        class_id = request.data.get('class_id')
        course_class = get_object_or_404(CourseClass, id=class_id)

        # Sử dụng transaction để đảm bảo an toàn dữ liệu
        with transaction.atomic():
            # Kiểm tra xem đã đăng ký lớp này chưa
            if Enrollment.objects.filter(student=user, course_class=course_class).exists():
                return Response({"error": "Bạn đã đăng ký lớp này rồi"}, status=status.HTTP_400_BAD_REQUEST)

            # Kiểm tra điều kiện tiên quyết (Service)
            ok, msg = check_prerequisites(user, course_class.course)
            if not ok:
                return Response({"error": msg}, status=status.HTTP_400_BAD_REQUEST)

            # Kiểm tra trùng lịch học (Service)
            is_conflict, conflict_msg = check_schedule_conflict(user, course_class.schedule)
            if is_conflict:
                return Response({"error": conflict_msg}, status=status.HTTP_409_CONFLICT)

            # Xử lý khi lớp đầy
            if course_class.is_full:
                WaitingList.objects.get_or_create(student=user, course_class=course_class)
                return Response({"message": "Lớp đầy, bạn đã được thêm vào danh sách chờ"}, status=status.HTTP_202_ACCEPTED)

            # Tạo bản ghi đăng ký
            Enrollment.objects.create(student=user, course_class=course_class)
            return Response({"message": "Đăng ký khóa học thành công!"}, status=status.HTTP_201_CREATED)
        
        logger.debug(f"User: {user}, Class: {course_class.id}, Schedule: {course_class.schedule}")

class CourseClassListView(generics.ListAPIView):
    queryset = CourseClass.objects.all()
    serializer_class = CourseClassSerializer
    permission_classes = [AllowAny]
    
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course']
    
from rest_framework.decorators import api_view, permission_classes
@api_view(['GET'])
@permission_classes([AllowAny]) # Khóa học phổ biến nên cho phép mọi người xem
def get_popular_courses(request):
    # Lấy 4 khóa học có rating cao nhất và nhiều học viên nhất
    courses = Course.objects.order_by('-rating', '-imported_enrollments')[:4]
    serializer = CourseSerializer(courses, many=True)
    return Response({
        "status": "success",
        "data": serializer.data
    })

# 5. Đổi mật khẩu
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password1 = request.data.get("new_password1")
        new_password2 = request.data.get("new_password2")

        # Kiểm tra mật khẩu cũ
        if not user.check_password(old_password):
            return Response(
                {"old_password": ["Mật khẩu cũ không đúng."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra mật khẩu mới khớp nhau
        if new_password1 != new_password2:
            return Response(
                {"new_password2": ["Hai mật khẩu mới không khớp."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra độ dài mật khẩu (tùy chọn)
        if len(new_password1) < 4:
            return Response(
                {"new_password1": ["Mật khẩu mới phải ít nhất 4 ký tự."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Đổi mật khẩu
        user.set_password(new_password1)
        user.save()

        return Response({"message": "Đổi mật khẩu thành công!"}, status=status.HTTP_200_OK)
    
# 6. Xem các khóa học đã đăng ký

class MyEnrolledCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Lấy tất cả enrollment của user (bao gồm cả ACTIVE và COMPLETED)
        enrollments = Enrollment.objects.filter(
            student=request.user
        ).select_related('course_class__course')
        
        courses_data = []
        for enrollment in enrollments:
            course = enrollment.course_class.course
            
            # Tính % hoàn thành dựa trên UserLessonProgress
            total_lessons = Lesson.objects.filter(
                module__course=course
            ).count()
            
            completed_lessons = UserLessonProgress.objects.filter(
                student=request.user,
                lesson__module__course=course,
                is_completed=True
            ).count()
            
            progress = 0
            if total_lessons > 0:
                progress = int((completed_lessons / total_lessons) * 100)
            
            # Serialize course data
            course_serializer = CourseSerializer(course)
            course_dict = course_serializer.data
            
            # Thêm thông tin bổ sung
            course_dict['enrollment_status'] = enrollment.status
            course_dict['enrolled_at'] = enrollment.enrolled_at
            course_dict['progress'] = progress
            course_dict['class_name'] = enrollment.course_class.name
            course_dict['last_accessed'] = enrollment.enrolled_at.strftime('%d/%m/%Y')
            
            courses_data.append(course_dict)
        
        return Response({
            "count": len(courses_data),
            "results": courses_data
        })
    

# 7. Bài kiểm tra đánh giá năng lực đầu vào
class PlacementQuizView(APIView):
    # Cho phép truy cập công khai để không bị lỗi 401 khi test trình duyệt
    permission_classes = [AllowAny]

    def get(self, request):
        # 1. Xác định User mục tiêu
        target_user = None

        # Ưu tiên lấy user từ Token (nếu bạn đang chạy qua giao diện React đã Login)
        if request.user.is_authenticated:
            target_user = request.user
        else:
            # Nếu chưa Login (truy cập trình duyệt), lấy email từ URL: ?email=...
            email_param = request.query_params.get('email')
            if email_param:
                target_user = User.objects.filter(email=email_param).first()

        # 2. Nếu hoàn toàn không xác định được User, trả về bộ đề mặc định Nhóm A
        if not target_user:
            quiz = Quiz.objects.filter(category='A', is_active=True).first()
            if not quiz:
                return Response({"error": "Chưa có bài kiểm tra mặc định"}, status=404)
            return Response(QuizSerializer(quiz).data)

        # 3. Lấy thông tin tags từ UserInterest của target_user
        try:
            interest = UserInterest.objects.get(user=target_user)
            user_tags = interest.tags  # Ví dụ: ["java", "system"]
        except UserInterest.DoesNotExist:
            # Nếu User này chưa làm survey, trả về Nhóm A
            quiz = Quiz.objects.filter(category='A', is_active=True).first()
            return Response(QuizSerializer(quiz).data)

        # 4. Định nghĩa logic Mapping
        category_map = {
            'A': ["scratch", "primary", "secondary", "basic"],
            'B': ["html", "css", "javascript", "application"],
            'C': ["java", "c#", ".net", "sql", "database", "system"],
            'D': ["python", "ai", "algorithm", "datastructure", "c++", "cpp"]
        }

        # 5. Tính toán điểm cho từng Category
        scores = {'A': 0, 'B': 0, 'C': 0, 'D': 0}
        for tag in user_tags:
            for cat, tags_in_cat in category_map.items():
                if tag in tags_in_cat:
                    scores[cat] += 1

        # Lấy Category có điểm cao nhất
        best_category = max(scores, key=scores.get)

        # 6. Trả về bài Quiz khớp với Category đã tính toán
        quiz = Quiz.objects.filter(category=best_category, is_active=True).first()

        # Fallback nếu nhóm đó chưa có đề
        if not quiz:
            quiz = Quiz.objects.filter(is_active=True).first()

        serializer = QuizSerializer(quiz)
        return Response(serializer.data)

# 8. API THỐNG KÊ DASHBOARD (Dành cho Admin)
@api_view(['GET'])
@permission_classes([AllowAny]) # test (sau này sửa thành IsAdminUser)
def admin_dashboard_stats(request):
    """
    API trả về toàn bộ số liệu để vẽ biểu đồ Dashboard
    """
    # 1. Số liệu tổng quan
    total_students = User.objects.filter(role='student').count()
    total_courses = Course.objects.count()
    total_enrollments = Enrollment.objects.count()

    # Điểm trung bình tất cả bài thi
    avg_score_data = QuizResult.objects.aggregate(Avg('score'))
    avg_quiz_score = avg_score_data['score__avg'] or 0

    # 2. Top khóa học hot nhất (Biểu đồ cột)
    # Đếm số lượng học viên trong các lớp thuộc khóa học đó
    courses_stats = Course.objects.annotate(
        student_count=Count('classes__enrollments')
    ).values('title', 'student_count').order_by('-student_count')[:5]

    chart_labels = [item['title'] for item in courses_stats]
    chart_data = [item['student_count'] for item in courses_stats]

    # 3. Phân loại trình độ học viên (Biểu đồ tròn)
    level_stats = QuizResult.objects.values('recommended_level').annotate(
        count=Count('id')
    )

    return Response({
        "overview": {
            "total_students": total_students,
            "total_courses": total_courses,
            "total_enrollments": total_enrollments,
            "avg_quiz_score": round(avg_quiz_score, 1)
        },
        "top_courses": {
            "labels": chart_labels,
            "data": chart_data
        },
        "student_levels": list(level_stats)
    })

# 9. QUẢN LÝ BÀI KIỂM TRA KHÓA HỌC

class CourseQuizListView(generics.ListAPIView):
    """Lấy danh sách bài kiểm tra của một khóa học"""
    serializer_class = CourseQuizListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return CourseQuiz.objects.filter(
            course_id=course_id,
            is_active=True
        )


class StartQuizView(APIView):
    """Bắt đầu làm bài kiểm tra"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, quiz_id):
        user = request.user
        quiz = get_object_or_404(CourseQuiz, id=quiz_id, is_active=True)
        
        # Kiểm tra số lần làm bài
        attempts_count = CourseQuizAttempt.objects.filter(
            student=user,
            quiz=quiz,
            status='SUBMITTED'
        ).count()
        
        if attempts_count >= quiz.max_attempts:
            return Response(
                {
                    "error": f"Bạn đã hết lượt làm bài. Tối đa {quiz.max_attempts} lần."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Kiểm tra xem có bài đang làm dở không
        ongoing = CourseQuizAttempt.objects.filter(
            student=user,
            quiz=quiz,
            status='IN_PROGRESS'
        ).first()
        
        if ongoing:
            # Kiểm tra xem đã hết giờ chưa
            time_limit_seconds = quiz.time_limit * 60
            elapsed = (timezone.now() - ongoing.started_at).total_seconds()
            
            if elapsed >= time_limit_seconds:
                # Tự động nộp bài
                self._auto_submit_quiz(ongoing)
                return Response(
                    {
                        "error": "Bài kiểm tra trước đã hết giờ và được tự động nộp.",
                        "attempt_id": ongoing.id
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                # Trả về bài đang làm
                serializer = CourseQuizAttemptSerializer(ongoing)
                return Response(serializer.data)
        
        # Tạo attempt mới
        with transaction.atomic():
            attempt = CourseQuizAttempt.objects.create(
                student=user,
                quiz=quiz,
                total_questions=quiz.get_total_questions(),
                total_points=quiz.get_total_points()
            )
            
            # Khởi tạo thứ tự câu hỏi và đáp án ngẫu nhiên
            attempt.initialize_question_order()
        
        serializer = CourseQuizAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def _auto_submit_quiz(self, attempt):
        """Tự động nộp bài khi hết giờ"""
        attempt.status = 'TIME_UP'
        attempt.submitted_at = timezone.now()
        
        # Tính thời gian làm bài
        time_spent = (attempt.submitted_at - attempt.started_at).total_seconds()
        attempt.time_spent = int(time_spent)
        
        # Tính điểm
        self._calculate_score(attempt)
        attempt.save()
    
    def _calculate_score(self, attempt):
        """Tính điểm cho attempt"""
        answers = attempt.answers.all()
        total_score = 0
        correct_count = 0
        
        for answer in answers:
            if answer.is_correct:
                total_score += answer.points_earned
                correct_count += 1
        
        attempt.score = total_score
        attempt.correct_answers = correct_count


class SubmitAnswerView(APIView):
    """Submit câu trả lời cho từng câu hỏi (lưu từng câu)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, attempt_id):
        attempt = get_object_or_404(
            CourseQuizAttempt,
            id=attempt_id,
            student=request.user,
            status='IN_PROGRESS'
        )
        
        # Kiểm tra hết giờ
        if self._is_time_up(attempt):
            self._auto_submit_quiz(attempt)
            return Response(
                {"error": "Hết giờ làm bài!"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        question_id = request.data.get('question_id')
        choice_id = request.data.get('choice_id')
        
        question = get_object_or_404(
            CourseQuizQuestion,
            id=question_id,
            quiz=attempt.quiz
        )
        
        choice = get_object_or_404(
            question.choices,
            id=choice_id
        )
        
        # Lưu hoặc cập nhật câu trả lời
        answer, created = CourseQuizAnswer.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={
                'selected_choice': choice,
                'is_correct': choice.is_correct,
                'points_earned': question.points if choice.is_correct else 0
            }
        )
        
        return Response({
            "message": "Đã lưu câu trả lời",
            "question_id": question_id,
            "choice_id": choice_id
        })
    
    def _is_time_up(self, attempt):
        time_limit_seconds = attempt.quiz.time_limit * 60
        elapsed = (timezone.now() - attempt.started_at).total_seconds()
        return elapsed >= time_limit_seconds
    
    def _auto_submit_quiz(self, attempt):
        """Tự động nộp bài khi hết giờ"""
        attempt.status = 'TIME_UP'
        attempt.submitted_at = timezone.now()
        time_spent = (attempt.submitted_at - attempt.started_at).total_seconds()
        attempt.time_spent = int(time_spent)
        self._calculate_score(attempt)
        attempt.save()
    
    def _calculate_score(self, attempt):
        answers = attempt.answers.all()
        total_score = sum(a.points_earned for a in answers)
        correct_count = sum(1 for a in answers if a.is_correct)
        attempt.score = total_score
        attempt.correct_answers = correct_count


class QuizResultView(generics.RetrieveAPIView):
    """Xem kết quả bài kiểm tra"""
    serializer_class = CourseQuizAttemptSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CourseQuizAttempt.objects.filter(
            student=self.request.user
        )


class MyQuizAttemptsView(generics.ListAPIView):
    """Lịch sử làm bài của user"""
    serializer_class = CourseQuizAttemptSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        quiz_id = self.kwargs.get('quiz_id')
        return CourseQuizAttempt.objects.filter(
            student=self.request.user,
            quiz_id=quiz_id
        ).order_by('-started_at')


class CheckTimeView(APIView):
    """Kiểm tra thời gian còn lại của bài kiểm tra"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, attempt_id):
        attempt = get_object_or_404(
            CourseQuizAttempt,
            id=attempt_id,
            student=request.user
        )
        
        if attempt.status != 'IN_PROGRESS':
            return Response({
                "status": attempt.status,
                "time_remaining": 0
            })
        
        time_limit_seconds = attempt.quiz.time_limit * 60
        elapsed = (timezone.now() - attempt.started_at).total_seconds()
        remaining = max(0, time_limit_seconds - elapsed)
        
        # Tự động nộp nếu hết giờ
        if remaining == 0:
            attempt.status = 'TIME_UP'
            attempt.submitted_at = timezone.now()
            attempt.time_spent = int(elapsed)
            
            # Tính điểm
            answers = attempt.answers.all()
            attempt.score = sum(a.points_earned for a in answers)
            attempt.correct_answers = sum(1 for a in answers if a.is_correct)
            attempt.save()
        
        return Response({
            "status": attempt.status,
            "time_remaining": int(remaining),
            "time_spent": int(elapsed)
        })

# 10. Nộp bài kiểm tra
class SubmitPlacementQuizView(APIView):  
    """Submit bài kiểm tra placement (đánh giá đầu vào)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        answers = request.data.get('answers', {})  # Format: {question_id: choice_id}
        
        # Lấy quiz active
        quiz = Quiz.objects.filter(is_active=True).first()
        if not quiz:
            return Response({"error": "Không tìm thấy bài kiểm tra"}, status=404)

        # Tính điểm
        total_questions = quiz.questions.count()
        correct_count = 0
        
        for question_id, choice_id in answers.items():
            try:
                choice = Choice.objects.get(id=choice_id, question_id=question_id)
                if choice.is_correct:
                    correct_count += 1
            except Choice.DoesNotExist:
                continue

        score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0

        # Xác định level
        if score < 40:
            level = "Beginner"
        elif score < 75:
            level = "Intermediate"
        else:
            level = "Advanced"

        # Lưu kết quả
        result, created = QuizResult.objects.update_or_create(
            student=user,
            quiz=quiz,
            defaults={
                'score': score,
                'total_questions': total_questions,
                'recommended_level': level,
                'details': {
                    'correct_answers': correct_count,
                    'answers': answers
                }
            }
        )
        # Cập nhật trạng thái đã làm quiz trong UserInterest
        interest, _ = UserInterest.objects.get_or_create(user=user)
        interest.is_quizzed = True
        interest.save()

        # Gợi ý khóa học
        recommended_courses = Course.objects.filter(
            level__icontains=level
        )[:3]

        return Response({
            "score": score,
            "level": level,
            "total_questions": total_questions,
            "correct_answers": correct_count,
            "recommended_courses": CourseSerializer(recommended_courses, many=True).data
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_user_interests(request):
    tags = request.data.get('tags', [])
    # Cập nhật hoặc tạo mới sở thích của user
    interest, created = UserInterest.objects.get_or_create(user=request.user)
    interest.tags = tags
    interest.is_surveyed = True
    interest.save()

    return Response({"message": "Đã lưu sở thích thành công!"})

# 11. Nộp bài kiểm tra khóa học
class SubmitCourseQuizView(APIView):  
    """Submit bài kiểm tra khóa học (CourseQuizAttempt)"""
    permission_classes = [IsAuthenticated]

    def post(self, request, attempt_id):
        attempt = get_object_or_404(
            CourseQuizAttempt,
            id=attempt_id,
            student=request.user,
            status='IN_PROGRESS'
        )

        quiz = attempt.quiz

        # Tính toán thời gian
        elapsed = (timezone.now() - attempt.started_at).total_seconds()
        attempt.time_spent = int(elapsed)
        attempt.submitted_at = timezone.now()

        if elapsed > (quiz.time_limit * 60 + 30):
            attempt.status = 'TIME_UP'
        else:
            attempt.status = 'SUBMITTED'

        # Tính điểm
        answers = attempt.answers.all()
        total_score = sum(a.points_earned for a in answers)
        correct_count = sum(1 for a in answers if a.is_correct)

        attempt.score = total_score
        attempt.correct_answers = correct_count
        attempt.save()

        serializer = CourseQuizAttemptSerializer(attempt)
        return Response({
            "success": True,
            "result": serializer.data,
            "summary": {
                "score_percentage": attempt.get_percentage(),
                "is_passed": attempt.is_passed()
            }
        }, status=status.HTTP_200_OK)
    
# 12. Kiểm tra trạng thái survey sở thích người dùng
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_survey_status(request):
    """Kiểm tra xem user đã làm survey và quiz chưa"""
    try:
        interest = UserInterest.objects.get(user=request.user)
        return Response({
            "is_surveyed": interest.is_surveyed,
            "is_quizzed": interest.is_quizzed,  # Mới
            "tags": interest.tags
        })
    except UserInterest.DoesNotExist:
        return Response({
            "is_surveyed": False,
            "is_quizzed": False,  # Mới
            "tags": []
        })