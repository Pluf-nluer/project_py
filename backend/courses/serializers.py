from rest_framework import serializers
from courses.models import Course, CourseClass, Enrollment, WaitingList, Module, Lesson
from django.contrib.auth import get_user_model
from courses.models import Quiz, Question, Choice
from courses.models import (
    CourseQuiz, CourseQuizQuestion, CourseQuizChoice,
    CourseQuizAttempt, CourseQuizAnswer
)


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
        depth= 2


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
    # sections = ModuleSerializer(source='modules', many=True, read_only=True)
    #
    # class Meta:
    #     model = Course
    #     fields = '__all__'
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        # Liệt kê cụ thể hoặc dùng __all__ nhưng phải đảm bảo có modules
        fields = [
            'id', 'title', 'description', 'price', 'instructor_name',
            'category', 'level', 'rating', 'imported_enrollments',
             'modules'  # <--- Bắt buộc phải có modules ở đây
        ]

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

# 6. Quiz, Question, Choice Serializers
class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'choices']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'questions']

class QuizSubmitSerializer(serializers.Serializer):
    answers = serializers.DictField(
        child=serializers.IntegerField()  # {question_id: choice_id}
    )

# === SERIALIZERS CHO BÀI KIỂM TRA ===

class CourseQuizChoiceSerializer(serializers.ModelSerializer):
    """Serializer cho đáp án - ẩn thông tin is_correct khi lấy câu hỏi"""
    class Meta:
        model = CourseQuizChoice
        fields = ['id', 'choice_text']


class CourseQuizChoiceWithAnswerSerializer(serializers.ModelSerializer):
    """Serializer hiển thị đầy đủ (dùng sau khi nộp bài)"""
    class Meta:
        model = CourseQuizChoice
        fields = ['id', 'choice_text', 'is_correct']


class CourseQuizQuestionSerializer(serializers.ModelSerializer):
    """Serializer câu hỏi khi làm bài - không hiện đáp án đúng"""
    choices = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseQuizQuestion
        fields = ['id', 'question_text', 'points', 'choices']
    
    def get_choices(self, obj):
        # Lấy thứ tự đáp án đã trộn từ attempt
        attempt = self.context.get('attempt')
        if attempt and attempt.choice_orders:
            choice_order = attempt.choice_orders.get(str(obj.id), [])
            if choice_order:
                choices = CourseQuizChoice.objects.filter(
                    id__in=choice_order
                )
                # Sắp xếp theo thứ tự đã trộn
                choices_dict = {c.id: c for c in choices}
                sorted_choices = [choices_dict[cid] for cid in choice_order if cid in choices_dict]
                return CourseQuizChoiceSerializer(sorted_choices, many=True).data
        
        # Nếu không có thứ tự trộn, lấy theo thứ tự mặc định
        return CourseQuizChoiceSerializer(
            obj.choices.all().order_by('order'), 
            many=True
        ).data


class CourseQuizQuestionWithAnswerSerializer(serializers.ModelSerializer):
    """Serializer câu hỏi sau khi nộp bài - hiện đáp án đúng"""
    choices = CourseQuizChoiceWithAnswerSerializer(many=True, read_only=True)
    user_answer = serializers.SerializerMethodField()
    is_correct = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseQuizQuestion
        fields = [
            'id', 'question_text', 'points', 'choices', 
            'user_answer', 'is_correct', 'explanation'
        ]
    
    def get_user_answer(self, obj):
        attempt = self.context.get('attempt')
        if attempt:
            answer = CourseQuizAnswer.objects.filter(
                attempt=attempt, question=obj
            ).first()
            if answer and answer.selected_choice:
                return answer.selected_choice.id
        return None
    
    def get_is_correct(self, obj):
        attempt = self.context.get('attempt')
        if attempt:
            answer = CourseQuizAnswer.objects.filter(
                attempt=attempt, question=obj
            ).first()
            if answer:
                return answer.is_correct
        return False


class CourseQuizListSerializer(serializers.ModelSerializer):
    """Danh sách bài kiểm tra - thông tin tổng quan"""
    total_questions = serializers.IntegerField(source='get_total_questions')
    total_points = serializers.IntegerField(source='get_total_points')
    user_attempts_count = serializers.SerializerMethodField()
    user_best_score = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseQuiz
        fields = [
            'id', 'title', 'description', 'time_limit', 
            'passing_score', 'max_attempts', 'total_questions',
            'total_points', 'user_attempts_count', 'user_best_score'
        ]
    
    def get_user_attempts_count(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.attempts.filter(
                student=user, 
                status='SUBMITTED'
            ).count()
        return 0
    
    def get_user_best_score(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            best = obj.attempts.filter(
                student=user, 
                status='SUBMITTED'
            ).order_by('-score').first()
            if best:
                return best.get_percentage()
        return None


class CourseQuizAttemptSerializer(serializers.ModelSerializer):
    """Thông tin lần làm bài"""
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    percentage = serializers.FloatField(source='get_percentage', read_only=True)
    is_passed = serializers.SerializerMethodField(read_only=True)
    questions = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseQuizAttempt
        fields = [
            'id', 'quiz', 'quiz_title', 'status', 'started_at',
            'submitted_at', 'time_spent', 'score', 'total_points',
            'correct_answers', 'total_questions', 'percentage',
            'is_passed', 'questions', 'time_remaining'
        ]
        read_only_fields = [
            'started_at', 'submitted_at', 'score', 'total_points'
        ]
        
    def get_is_passed(self, obj):
        return obj.is_passed()
        
    def get_questions(self, obj):
        # Lấy câu hỏi theo thứ tự đã trộn
        if obj.question_order:
            questions = CourseQuizQuestion.objects.filter(
                id__in=obj.question_order
            )
            questions_dict = {q.id: q for q in questions}
            sorted_questions = [
                questions_dict[qid] 
                for qid in obj.question_order 
                if qid in questions_dict
            ]
        else:
            sorted_questions = obj.quiz.quiz_questions.all()
        
        # Nếu đã nộp bài và cho phép xem đáp án
        if obj.status == 'SUBMITTED' and obj.quiz.show_correct_answers:
            return CourseQuizQuestionWithAnswerSerializer(
                sorted_questions,
                many=True,
                context={'attempt': obj}
            ).data
        else:
            return CourseQuizQuestionSerializer(
                sorted_questions,
                many=True,
                context={'attempt': obj}
            ).data
    
    def get_time_remaining(self, obj):
        """Tính thời gian còn lại (giây)"""
        if obj.status != 'IN_PROGRESS':
            return 0
        
        from django.utils import timezone
        time_limit_seconds = obj.quiz.time_limit * 60
        elapsed = (timezone.now() - obj.started_at).total_seconds()
        remaining = max(0, time_limit_seconds - elapsed)
        return int(remaining)


class SubmitAnswerSerializer(serializers.Serializer):
    """Serializer để submit câu trả lời"""
    question_id = serializers.IntegerField()
    choice_id = serializers.IntegerField()


class SubmitQuizSerializer(serializers.Serializer):
    """Serializer để nộp toàn bộ bài kiểm tra"""
    answers = serializers.ListField(
        child=SubmitAnswerSerializer(),
        allow_empty=True
    )

class CourseDetailSerializer(serializers.ModelSerializer):
    # sections = ModuleSerializer(source='modules', many=True, read_only=True)
    # is_enrolled = serializers.SerializerMethodField()
    # enrolled_class = serializers.SerializerMethodField()
    #
    # class Meta:
    #     model = Course
    #     fields = '__all__'
    #
    # def get_is_enrolled(self, obj):
    #     request = self.context.get('request')
    #     if request and request.user.is_authenticated:
    #         return Enrollment.objects.filter(
    #             student=request.user,
    #             course_class__course=obj
    #         ).exists()
    #     return False
    modules = ModuleSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        # Phải đảm bảo có 'modules' trong danh sách fields
        fields = '__all__'

    def get_is_enrolled(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            # Sửa 'user=user' thành 'student=user' cho khớp với Model Enrollment của bạn
            return Enrollment.objects.filter(student=user, course_class__course=obj).exists()
        return False

    def get_enrolled_class(self, obj):
        """Trả về thông tin lớp mà user đã đăng ký (nếu có)"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(
                student=request.user,
                course_class__course=obj
            ).first()
            if enrollment:
                return {
                    'class_id': enrollment.course_class.id,
                    'class_name': enrollment.course_class.name,
                    'status': enrollment.status
                }
        return None