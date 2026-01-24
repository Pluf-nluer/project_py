from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import random

class Course(models.Model):
    title = models.CharField(max_length=255, verbose_name="Tên khóa học")
    description = models.TextField(verbose_name="Mô tả")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Học phí")
    skills_vector = models.JSONField(default=list, verbose_name="Vector kỹ năng (AI)")
    prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='required_for', verbose_name="Khóa học tiên quyết")
    image = models.ImageField(upload_to='courses/', null=True, blank=True)
    instructor_name = models.CharField(max_length=100, default="Chưa có giảng viên")
    rating = models.FloatField(default=5.0)
    total_lessons = models.IntegerField(default=0)
    duration = models.CharField(max_length=50, default="2h 30m")
    category = models.CharField(
        max_length=100, 
        default="Uncategorized", 
        null=True, 
        blank=True,
        verbose_name="Danh mục"
    )
    # Bổ sung các trường để khớp với edX và Skillshare
    institution = models.CharField(max_length=255, null=True, blank=True, verbose_name="Tổ chức cấp bằng")
    level = models.CharField(max_length=50, null=True, blank=True, verbose_name="Trình độ")
    language = models.CharField(max_length=50, default="English", verbose_name="Ngôn ngữ")
    external_link = models.URLField(null=True, blank=True, verbose_name="Link gốc khóa học")
    imported_enrollments = models.IntegerField(default=0, verbose_name="Số lượng học viên (từ dataset)")

    # Trường mô tả text cho tiên quyết (vì edX cung cấp dạng văn bản)
    prerequisites_text = models.TextField(null=True, blank=True, verbose_name="Yêu cầu đầu vào (Text)")

    class Meta:
        verbose_name = "Khóa học"
        verbose_name_plural = "1. Quản lý Khóa học"

    def __str__(self):
        return self.title

class CourseClass(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='classes', verbose_name="Thuộc khóa học")
    name = models.CharField(max_length=50, verbose_name="Tên lớp học")
    start_date = models.DateField(verbose_name="Ngày khai giảng")
    end_date = models.DateField(verbose_name="Ngày kết thúc")
    max_capacity = models.IntegerField(default=30, verbose_name="Sĩ số tối đa")
    schedule = models.JSONField(default=list, verbose_name="Lịch học (JSON)")
    ordering = ['id']

    class Meta:
        verbose_name = "Lớp học"
        verbose_name_plural = "2. Quản lý Lớp học"

    def __str__(self):
        return f"{self.course.title} - {self.name}"

    @property
    def is_full(self):
        # Đếm số người đang học (ACTIVE)
        return self.enrollments.filter(status='ACTIVE').count() >= self.max_capacity

class Enrollment(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Đang học'),
        ('COMPLETED', 'Đã hoàn thành'),
        ('DROPPED', 'Đã hủy'),
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        verbose_name="Sinh viên"
    )
    course_class = models.ForeignKey(CourseClass, on_delete=models.CASCADE, related_name='enrollments', verbose_name="Lớp học")
    enrolled_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày đăng ký")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE', verbose_name="Trạng thái")
    final_score = models.FloatField(null=True, blank=True, verbose_name="Điểm tổng kết")

    class Meta:
        unique_together = ('student', 'course_class')
        verbose_name = "Đăng ký"
        verbose_name_plural = "3. Danh sách Đăng ký"

class WaitingList(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        verbose_name="Sinh viên"
    )
    course_class = models.ForeignKey(CourseClass, on_delete=models.CASCADE, verbose_name="Lớp học hồ")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày vào danh sách")

    class Meta:
        verbose_name = "Danh sách chờ"
        verbose_name_plural = "4. Hàng chờ đăng ký"
        

class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules', verbose_name="Thuộc khóa học")
    title = models.CharField(max_length=255, verbose_name="Tiêu đề phần học")
    order = models.PositiveIntegerField(default=0, verbose_name="Thứ tự hiển thị")

    class Meta:
        ordering = ['order']
        verbose_name = "Phần học"
        verbose_name_plural = "Phần học (Modules)"

    def __str__(self):
        return f"{self.course.title} - {self.title}"

# Model Lesson (Bài học cụ thể)
class Lesson(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons', verbose_name="Thuộc phần học")
    title = models.CharField(max_length=255, verbose_name="Tên bài học")
    duration = models.CharField(max_length=20, default="10:00", verbose_name="Thời lượng (vd: 05:30)")
    is_preview = models.BooleanField(default=False, verbose_name="Cho phép xem trước?")
    order = models.PositiveIntegerField(default=0, verbose_name="Thứ tự bài học")

    class Meta:
        ordering = ['order']
        verbose_name = "Bài học"
        verbose_name_plural = "Bài học (Lessons)"

    def __str__(self):
        return self.title


class User(AbstractUser):
    # Dùng email để đăng nhập thay vì username
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    # --- THÊM CÁC TRƯỜNG PROFILE VÀO ĐÂY ---
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, verbose_name="Ảnh đại diện")
    bio = models.TextField(max_length=500, blank=True, verbose_name="Giới thiệu bản thân")
    birth_date = models.DateField(null=True, blank=True, verbose_name="Ngày sinh")

    ROLE_CHOICES = (
        ('student', 'Học viên'),
        ('teacher', 'Giáo viên'),
        ('admin', 'Quản trị viên'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student', verbose_name="Vai trò")
    # ---------------------------------------

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

# 6. Mô hình cho Bài kiểm tra đánh giá năng lực đầu vào
class Quiz(models.Model):
    CATEGORY_CHOICES = (
        ('A', 'Tư duy Lập trình & Cơ bản (Scratch/Basic)'),
        ('B', 'Phát triển Web Frontend (HTML/CSS/JS)'),
        ('C', 'Kỹ thuật Phần mềm & Hệ thống (Java/C#/.NET/SQL)'),
        ('D', 'Thuật toán & Công nghệ Cao (AI/Python/C++)'),
    )

    title = models.CharField(max_length=255, default="Kiểm tra năng lực đầu vào")

    category = models.CharField(
        max_length=1,
        choices=CATEGORY_CHOICES,
        null=True,
        blank=True,
        verbose_name="Hạng mục đánh giá"
    )
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Bộ đề đánh giá đầu vào"
        verbose_name_plural = "6.1. Bộ đề đánh giá đầu vào"
    def __str__(self):
        return self.title

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField("Câu hỏi")

    # Bổ sung tag để mapping với UserInterest (ví dụ: 'python', 'sql', 'react')
    tag = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name="Tag năng lực"
    )

    # Bổ sung level để đánh giá độ khó (1: Dễ, 2: Trung bình, 3: Khó)
    level = models.IntegerField(
        default=1,
        verbose_name="Độ khó (1-3)"
    )

    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Đáp án đánh giá"
        verbose_name_plural = "6.3. Đáp án đánh giá"

    def __str__(self):
        return self.text[:50]

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text

class QuizResult(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_results')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.IntegerField()  # Điểm số (ví dụ: 80)
    total_questions = models.IntegerField()  # Tổng số câu hỏi
    completed_at = models.DateTimeField(auto_now_add=True)

    # Lưu lại category của bài test đã làm để thống kê
    test_category = models.CharField(max_length=1, null=True, blank=True)

    recommended_level = models.CharField(max_length=20, blank=True)  # Beginner, Intermediate, Advanced
    details = models.JSONField(default=dict, verbose_name="Chi tiết làm bài (JSON)")

    class Meta:
        unique_together = ('student', 'quiz')
        verbose_name = "Kết quả đánh giá"
        verbose_name_plural = "6.4. Kết quả đánh giá"

    def __str__(self):
        return f"{self.student.email} - {self.quiz.title} - {self.score}%"

# Xác định tiến độ khóa học của một học viên để biết được học viên đó hoàn thành khóa học được bao nhiêu % hay nghỉ học cho khỏe thân
class UserLessonProgress(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete = models.CASCADE,related_name="lesson_progress")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False, verbose_name="Đã hoàn thành")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian hoàn thành")
    last_watched_position = models.IntegerField(default=0, verbose_name="Vị trí xem video (giây)")

    class Meta:
        unique_together = ('student', 'lesson')
        verbose_name = "Tiến độ bài học"
        verbose_name_plural = "Tiến độ bài học"

    def __str__(self):
        return f"{self.student.username} - {self.lesson.title}"

# 7. BÀI KIỂM TRA CHO TỪNG KHÓA HỌC
class CourseQuiz(models.Model):
    """Bài kiểm tra thuộc về một khóa học cụ thể"""
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='quizzes',
        verbose_name="Khóa học"
    )
    title = models.CharField(max_length=255, verbose_name="Tên bài kiểm tra")
    description = models.TextField(blank=True, verbose_name="Mô tả")

    # Cấu hình thời gian
    time_limit = models.IntegerField(
        default=30,
        verbose_name="Thời gian làm bài (phút)"
    )

    # Cấu hình điểm và đánh giá
    passing_score = models.IntegerField(
        default=70,
        verbose_name="Điểm đạt tối thiểu (%)"
    )
    max_attempts = models.IntegerField(
        default=3,
        verbose_name="Số lần làm tối đa"
    )

    # Cấu hình hiển thị
    shuffle_questions = models.BooleanField(
        default=True,
        verbose_name="Trộn câu hỏi"
    )
    shuffle_choices = models.BooleanField(
        default=True,
        verbose_name="Trộn đáp án"
    )
    show_correct_answers = models.BooleanField(
        default=True,
        verbose_name="Hiển thị đáp án đúng sau khi nộp"
    )

    is_active = models.BooleanField(default=True, verbose_name="Đang hoạt động")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Bài kiểm tra khóa học"
        verbose_name_plural = "Bài kiểm tra khóa học"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    def get_total_questions(self):
        """Tổng số câu hỏi"""
        return self.quiz_questions.count()

    def get_total_points(self):
        """Tổng điểm của bài kiểm tra"""
        return sum(q.points for q in self.quiz_questions.all())


class CourseQuizQuestion(models.Model):
    """Câu hỏi trong bài kiểm tra"""
    quiz = models.ForeignKey(
        CourseQuiz,
        on_delete=models.CASCADE,
        related_name='quiz_questions',
        verbose_name="Bài kiểm tra"
    )
    question_text = models.TextField(verbose_name="Nội dung câu hỏi")
    explanation = models.TextField(
        blank=True,
        verbose_name="Giải thích đáp án"
    )
    points = models.IntegerField(default=1, verbose_name="Điểm số")
    order = models.PositiveIntegerField(default=0, verbose_name="Thứ tự")

    class Meta:
        verbose_name = "Câu hỏi"
        verbose_name_plural = "Câu hỏi"
        ordering = ['order', 'id']

    def __str__(self):
        return self.question_text[:50]


class CourseQuizChoice(models.Model):
    """Lựa chọn cho mỗi câu hỏi"""
    question = models.ForeignKey(
        CourseQuizQuestion,
        on_delete=models.CASCADE,
        related_name='choices',
        verbose_name="Câu hỏi"
    )
    choice_text = models.CharField(max_length=500, verbose_name="Nội dung đáp án")
    is_correct = models.BooleanField(default=False, verbose_name="Đáp án đúng")
    order = models.PositiveIntegerField(default=0, verbose_name="Thứ tự")

    class Meta:
        verbose_name = "Đáp án"
        verbose_name_plural = "Đáp án"
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.choice_text[:30]} ({'✓' if self.is_correct else '✗'})"


class CourseQuizAttempt(models.Model):
    """Lưu trữ từng lần làm bài của học viên"""
    STATUS_CHOICES = (
        ('IN_PROGRESS', 'Đang làm'),
        ('SUBMITTED', 'Đã nộp'),
        ('TIME_UP', 'Hết giờ'),
    )

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quiz_attempts',
        verbose_name="Học viên"
    )
    quiz = models.ForeignKey(
        CourseQuiz,
        on_delete=models.CASCADE,
        related_name='attempts',
        verbose_name="Bài kiểm tra"
    )

    # Thông tin thời gian
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    time_spent = models.IntegerField(
        default=0,
        verbose_name="Thời gian làm (giây)"
    )

    # Kết quả
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='IN_PROGRESS'
    )
    score = models.FloatField(default=0, verbose_name="Điểm số")
    total_points = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)

    # Thứ tự câu hỏi đã được trộn (lưu dạng JSON)
    question_order = models.JSONField(
        default=list,
        verbose_name="Thứ tự câu hỏi đã trộn"
    )

    # Thứ tự đáp án đã trộn cho từng câu hỏi
    choice_orders = models.JSONField(
        default=dict,
        verbose_name="Thứ tự đáp án đã trộn"
    )

    class Meta:
        verbose_name = "Lần làm bài"
        verbose_name_plural = "Lịch sử làm bài"
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.student.email} - {self.quiz.title} - {self.started_at}"

    def is_passed(self):
        """Kiểm tra có đạt điểm tối thiểu không"""
        percentage = (self.score / self.total_points * 100) if self.total_points > 0 else 0
        return percentage >= self.quiz.passing_score

    def get_percentage(self):
        """Tính phần trăm điểm"""
        if self.total_points == 0:
            return 0
        return round((self.score / self.total_points) * 100, 1)

    def initialize_question_order(self):
        """Khởi tạo thứ tự câu hỏi ngẫu nhiên khi bắt đầu làm bài"""
        questions = list(self.quiz.quiz_questions.values_list('id', flat=True))

        if self.quiz.shuffle_questions:
            random.shuffle(questions)

        self.question_order = questions

        # Khởi tạo thứ tự đáp án cho từng câu hỏi
        if self.quiz.shuffle_choices:
            choice_orders = {}
            for q_id in questions:
                choices = list(
                    CourseQuizChoice.objects.filter(question_id=q_id)
                    .values_list('id', flat=True)
                )
                random.shuffle(choices)
                choice_orders[str(q_id)] = choices
            self.choice_orders = choice_orders

        self.save()


class CourseQuizAnswer(models.Model):
    """Lưu câu trả lời của học viên cho mỗi câu hỏi"""
    attempt = models.ForeignKey(
        CourseQuizAttempt,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name="Lần làm bài"
    )
    question = models.ForeignKey(
        CourseQuizQuestion,
        on_delete=models.CASCADE,
        verbose_name="Câu hỏi"
    )
    selected_choice = models.ForeignKey(
        CourseQuizChoice,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Đáp án đã chọn"
    )
    is_correct = models.BooleanField(default=False)
    points_earned = models.FloatField(default=0)
    answered_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Câu trả lời"
        verbose_name_plural = "Câu trả lời"
        unique_together = ('attempt', 'question')

    def __str__(self):
        return f"Q{self.question.id} - {'✓' if self.is_correct else '✗'}"

class UserInterest(models.Model):
    user = models.OneToOneField(User, related_name='interest', on_delete=models.CASCADE)
    tags = models.JSONField(default=list) # Lưu ['python', 'ai', 'algorithm']
    is_surveyed = models.BooleanField(default=False)
    is_quizzed = models.BooleanField(default=False)

    def __str__(self):
        return f"Sở thích của {self.user.email}"

class CourseStatistic(Course):
    class Meta:
        proxy = True
        verbose_name = 'Thống kê tổng quan'
        verbose_name_plural = 'Thống kê tổng quan'