from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated

from courses.models import CourseClass, Enrollment, WaitingList, Course
from courses.services import check_prerequisites, check_schedule_conflict
from courses.serializers import CourseClassSerializer, CourseSerializer, UserSerializer

User = get_user_model()

class CourseDetailView(RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class CourseListView(ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

# 1. API Xem danh sách các lớp đang mở
class CourseClassListView(ListAPIView):
    queryset = CourseClass.objects.all()
    serializer_class = CourseClassSerializer


# 2. API Đăng ký (Logic cũ)
class EnrollClassView(APIView):
    def post(self, request):
        # Giả lập User ID=1 (Nếu chưa có Auth Token)
        # Trong thực tế: user = request.user
        try:
            user = User.objects.get(pk=1)
        except User.DoesNotExist:
            return Response({"error": "Vui lòng tạo Superuser hoặc User trước"}, status=400)

        class_id = request.data.get('class_id')
        course_class = get_object_or_404(CourseClass, id=class_id)

        # Service Checks
        ok, msg = check_prerequisites(user, course_class.course)
        if not ok: return Response({"error": msg}, status=400)

        is_conflict, conflict_msg = check_schedule_conflict(user, course_class.schedule)
        if is_conflict: return Response({"error": conflict_msg}, status=409)

        if course_class.is_full:
            WaitingList.objects.get_or_create(student=user, course_class=course_class)
            return Response({"message": "Lớp đầy, đã vào Waiting List"}, status=202)

        Enrollment.objects.create(student=user, course_class=course_class)
        return Response({"message": "Đăng ký thành công!"}, status=201)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
    
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated] # Chỉ cho phép người đã đăng nhập (có token)

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "avatar": user.avatar.url if hasattr(user, 'avatar') and user.avatar else None
        })