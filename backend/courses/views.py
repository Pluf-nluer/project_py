from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404

from courses.models import CourseClass, Enrollment, WaitingList, Course
from courses.services import check_prerequisites, check_schedule_conflict
from courses.serializers import (
    CourseClassSerializer,
    CourseSerializer,
    UserSerializer
)

from courses.models import CourseClass
from courses.serializers import CourseClassSerializer

User = get_user_model()

# 1. Chi tiết & Danh sách khóa học (Giữ nguyên - Đã tốt)
class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class CourseListView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

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