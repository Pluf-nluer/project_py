from rest_framework import serializers
from courses.models import Course, CourseClass, Enrollment, WaitingList, Module, Lesson
from django.contrib.auth import get_user_model

User = get_user_model()


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'


class CourseClassSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')

    class CourseSerializer(serializers.ModelSerializer):
        class Meta:
            model = Course
            # fields = ['id', 'title', 'image', 'category', 'rating', 'price', 'instructor_name', 'total_lessons', 'duration']
            fields = '__all__'


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'
        
class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['title', 'duration']

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True) # Lấy danh sách bài học của phần này

    class Meta:
        model = Module
        fields = ['title', 'lessons']

class CourseSerializer(serializers.ModelSerializer):
    sections = ModuleSerializer(source='modules', many=True, read_only=True) # 'modules' là related_name trong model

    class Meta:
        model = Course
        fields = '__all__'
        
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name')

    def create(self, validated_data):
        # Tự động gán email vào trường username của Django
        user = User.objects.create_user(
            username=validated_data['email'], 
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', '')
        )
        return user