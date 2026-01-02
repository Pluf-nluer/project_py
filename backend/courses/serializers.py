from rest_framework import serializers
from courses.models import Course, CourseClass, Enrollment, WaitingList, Module, Lesson
from django.contrib.auth import get_user_model

User = get_user_model()

class CourseClassSerializer(serializers.ModelSerializer):
    course_name = serializers.ReadOnlyField(source='course.title')
    is_full = serializers.ReadOnlyField() # Sử dụng @property từ model

    class Meta:
        model = CourseClass
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    # Hiển thị thông tin chi tiết thay vì chỉ ID
    student_email = serializers.ReadOnlyField(source='student.email')
    class_name = serializers.ReadOnlyField(source='course_class.name')

    class Meta:
        model = Enrollment
        fields = '__all__'


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'duration', 'is_preview', 'order']


class ModuleSerializer(serializers.ModelSerializer):
    # 'lessons' phải khớp với related_name trong model Lesson
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'lessons']


class CourseSerializer(serializers.ModelSerializer):
    # Hiển thị danh sách Module (sections) và các lớp học (classes) kèm theo
    sections = ModuleSerializer(source='modules', many=True, read_only=True)

    class Meta:
        model = Course
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        # Thêm đầy đủ các trường profile vào đây
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'phone', 'avatar', 'role', 'bio')
        read_only_fields = ('role',) # Thường không cho phép user tự đổi role qua API đăng ký

    def create(self, validated_data):
        # Loại bỏ các trường profile khỏi data để dùng create_user cho các trường cơ bản
        # sau đó cập nhật các trường còn lại
        password = validated_data.pop('password')
        user = User.objects.create_user(
            username=validated_data['email'], # Sync username với email
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user
    def update(self, instance, validated_data):
        # Xử lý password nếu có (không bắt buộc)
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)

        # Cập nhật các trường khác
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance