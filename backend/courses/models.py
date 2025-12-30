from django.db import models
from django.contrib.auth.models import AbstractUser, User
from django.conf import settings

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
