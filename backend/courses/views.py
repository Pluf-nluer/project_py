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
from courses.models import CourseClass, Enrollment, WaitingList, Course, UserLessonProgress
from courses.services import check_prerequisites, check_schedule_conflict
from courses.serializers import (
    CourseClassSerializer,
    CourseSerializer,
    UserSerializer
)

from courses.models import CourseClass
from courses.serializers import CourseClassSerializer
from courses.models import Quiz, Question, Choice, QuizResult
from courses.serializers import QuizSerializer, QuizSubmitSerializer
from courses.models import (
    Course, CourseQuiz, CourseQuizAttempt, 
    CourseQuizAnswer, CourseQuizQuestion
)
from courses.serializers import (
    CourseQuizListSerializer, CourseQuizAttemptSerializer,SubmitQuizSerializer
)

from django.utils import timezone

User = get_user_model()

# 1. Chi tiết & Danh sách khóa học (Giữ nguyên - Đã tốt)
class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

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
        enrollments = Enrollment.objects.filter(student=request.user, status='ACTIVE')  # hoặc tất cả
        courses = [enrollment.course_class.course for enrollment in enrollments]
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)
    

# 7. Bài kiểm tra đánh giá năng lực đầu vào
class PlacementQuizView(APIView):
    permission_classes = [AllowAny]  # Ai cũng làm được

    def get(self, request):
        quiz = Quiz.objects.filter(is_active=True).first()
        if not quiz:
            return Response({"error": "Chưa có bài kiểm tra"}, status=404)
        serializer = QuizSerializer(quiz)
        return Response(serializer.data)

class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = QuizSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        answers = serializer.validated_data['answers']
        quiz = Quiz.objects.filter(is_active=True).first()
        if not quiz:
            return Response({"error": "Không tìm thấy bài kiểm tra"}, status=404)

        questions = quiz.questions.all()
        correct_count = 0

        for question in questions:
            selected_choice_id = answers.get(str(question.id))
            if selected_choice_id:
                choice = question.choices.filter(id=selected_choice_id, is_correct=True).exists()
                if choice:
                    correct_count += 1

        score = int((correct_count / questions.count()) * 100) if questions.count() > 0 else 0

        # Xác định trình độ
        if score < 40:
            level = "Beginner"
        elif score < 70:
            level = "Intermediate"
        else:
            level = "Advanced"

        # Lưu kết quả
        QuizResult.objects.update_or_create(
            student=request.user,
            quiz=quiz,
            defaults={
                'score': score,
                'total_questions': questions.count(),
                'recommended_level': level
            }
        )

        # Gợi ý khóa học theo level (bạn có thể thêm field level vào Course)
        recommended_courses = Course.objects.filter(category__icontains=level.lower())[:6]
        course_serializer = CourseSerializer(recommended_courses, many=True)

        return Response({
            "score": score,
            "total": questions.count(),
            "level": level,
            "recommended_courses": course_serializer.data
        })
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


class StartQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, quiz_id):
        user = request.user
        quiz = get_object_or_404(CourseQuiz, id=quiz_id, is_active=True)

        # Kiểm tra lượt còn lại
        attempts_count = CourseQuizAttempt.objects.filter(
            student=user, quiz=quiz, status='SUBMITTED'
        ).count()

        if attempts_count >= quiz.max_attempts:
            return Response({"error": f"Hết lượt làm bài (tối đa {quiz.max_attempts} lần)."}, status=400)

        # Tìm attempt đang làm dở
        ongoing = CourseQuizAttempt.objects.filter(
            student=user, quiz=quiz, status='IN_PROGRESS'
        ).first()

        if ongoing:
            # Kiểm tra hết giờ
            time_limit_seconds = quiz.time_limit * 60
            elapsed = (timezone.now() - ongoing.started_at).total_seconds()

            if elapsed >= time_limit_seconds:
                # Tự động nộp
                ongoing.status = 'TIME_UP'
                ongoing.submitted_at = timezone.now()
                ongoing.time_spent = int(elapsed)
                # Tính điểm...
                ongoing.save()
                return Response({"error": "Bài trước đã hết giờ và được tự động nộp.", "attempt_id": ongoing.id}, status=400)

            # Trả về attempt đang làm
            serializer = CourseQuizAttemptSerializer(ongoing)
            return Response(serializer.data, status=200)

        # Tạo mới
        with transaction.atomic():
            attempt = CourseQuizAttempt.objects.create(
                student=user,
                quiz=quiz,
                total_questions=quiz.get_total_questions(),
                total_points=quiz.get_total_points()
            )
            attempt.initialize_question_order()
            serializer = CourseQuizAttemptSerializer(attempt)
            return Response(serializer.data, status=201)


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
class SubmitQuizView(APIView):
    """Nộp toàn bộ bài kiểm tra"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, attempt_id):
        """
        Nộp bài kiểm tra
        URL: POST /api/courses/quiz-attempts/{attempt_id}/submit/
        """
        print(f"\n{'='*50}")
        print(f"🔵 BẮT ĐẦU NỘP BÀI - Attempt ID: {attempt_id}")
        print(f"{'='*50}")
        
        try:
            # 1. Lấy attempt
            attempt = get_object_or_404(
                CourseQuizAttempt,
                id=attempt_id,
                student=request.user
            )
            
            print(f"✅ Tìm thấy attempt: {attempt.id}")
            print(f"   - Quiz: {attempt.quiz.title}")
            print(f"   - Status hiện tại: {attempt.status}")
            print(f"   - Thời gian bắt đầu: {attempt.started_at}")
            
            # 2. Kiểm tra trạng thái
            if attempt.status != 'IN_PROGRESS':
                error_msg = f"Bài kiểm tra đã được nộp trước đó (Trạng thái: {attempt.get_status_display()})"
                print(f"❌ LỖI: {error_msg}")
                return Response(
                    {
                        "error": error_msg,
                        "status": attempt.status,
                        "detail": "Bài kiểm tra này đã kết thúc. Vui lòng làm bài mới hoặc xem kết quả."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 3. Kiểm tra thời gian
            time_limit_seconds = attempt.quiz.time_limit * 60
            elapsed = (timezone.now() - attempt.started_at).total_seconds()
            
            print(f"⏱️  Thời gian:")
            print(f"   - Giới hạn: {time_limit_seconds}s ({attempt.quiz.time_limit} phút)")
            print(f"   - Đã trôi qua: {int(elapsed)}s")
            print(f"   - Còn lại: {int(time_limit_seconds - elapsed)}s")
            
            # Nếu hết giờ, đánh dấu TIME_UP
            if elapsed >= time_limit_seconds:
                print("⚠️  ĐÃ HẾT GIỜ - Chuyển sang TIME_UP")
                attempt.status = 'TIME_UP'
            else:
                attempt.status = 'SUBMITTED'
            
            # 4. Lưu thời gian nộp bài
            attempt.submitted_at = timezone.now()
            attempt.time_spent = int(elapsed)
            
            # 5. Tính điểm
            print(f"\n📊 TÍNH ĐIỂM:")
            answers = attempt.answers.all()
            print(f"   - Tổng số câu đã trả lời: {answers.count()}")
            
            total_score = 0
            correct_count = 0
            
            for answer in answers:
                if answer.is_correct:
                    total_score += answer.points_earned
                    correct_count += 1
                    print(f"   ✅ Câu {answer.question.id}: +{answer.points_earned} điểm")
                else:
                    print(f"   ❌ Câu {answer.question.id}: 0 điểm")
            
            attempt.score = total_score
            attempt.correct_answers = correct_count
            
            print(f"\n🎯 KẾT QUẢ CUỐI CÙNG:")
            print(f"   - Điểm: {attempt.score}/{attempt.total_points}")
            print(f"   - Số câu đúng: {attempt.correct_answers}/{attempt.total_questions}")
            print(f"   - Phần trăm: {attempt.get_percentage()}%")
            print(f"   - Kết quả: {'ĐẠT' if attempt.is_passed() else 'CHƯA ĐẠT'}")
            
            # 6. Lưu vào database
            attempt.save()
            print(f"\n💾 ĐÃ LƯU VÀO DATABASE")
            
            # 7. Trả về kết quả
            serializer = CourseQuizAttemptSerializer(attempt)
            
            response_data = {
                "success": True,
                "message": "✅ Nộp bài thành công!",
                "result": serializer.data,
                "summary": {
                    "score": attempt.score,
                    "total_points": attempt.total_points,
                    "percentage": attempt.get_percentage(),
                    "passed": attempt.is_passed(),
                    "correct_answers": attempt.correct_answers,
                    "total_questions": attempt.total_questions,
                    "time_spent_seconds": attempt.time_spent,
                    "status": attempt.status
                }
            }
            
            print(f"\n{'='*50}")
            print(f"✅ NỘP BÀI THÀNH CÔNG")
            print(f"{'='*50}\n")
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except CourseQuizAttempt.DoesNotExist:
            print(f"❌ KHÔNG TÌM THẤY ATTEMPT ID: {attempt_id}")
            return Response(
                {
                    "error": "Không tìm thấy bài kiểm tra",
                    "detail": "Bài kiểm tra này không tồn tại hoặc không thuộc về bạn."
                },
                status=status.HTTP_404_NOT_FOUND
            )
            
        except Exception as e:
            print(f"\n❌ LỖI KHÔNG MONG MUỐN:")
            print(f"   {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return Response(
                {
                    "error": "Có lỗi xảy ra khi nộp bài",
                    "detail": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )