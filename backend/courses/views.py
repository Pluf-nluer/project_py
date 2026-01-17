from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import generics, status, viewsets,filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated,IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from courses.models import CourseClass, Enrollment, WaitingList, Course
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

User = get_user_model()

# 1. Chi tiết & Danh sách khóa học (Giữ nguyên - Đã tốt)
class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# XEM DANH SÁCH KHÓA HỌC (Có Phân Trang) ---
class CourseListView(generics.ListAPIView):
    queryset = Course.objects.all().order_by('-id')
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    # Hỗ trợ tìm kiếm theo tiêu đề (Search)
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'category']

    # Trong settings.py bạn đã set 'PAGE_SIZE': 6

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