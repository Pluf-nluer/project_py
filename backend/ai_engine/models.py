from django.db import models
from django.contrib.auth.models import User
from courses.models import Course
from django.conf import settings

class UserInteraction(models.Model):
    INTERACTION_TYPES = (
        # ('VIEW', 'Xem khóa học'),
        # ('CLICK', 'Click vào chi tiết'),
        # ('RATING', 'Đánh giá sao'),
        # ('ENROLL', 'Đăng ký học'),
        ('QUIZ', 'Kết quả làm bài'),  # Phản ánh năng lực trực tiếp
        ('ENROLL', 'Đăng ký học'),  # Phản ánh sự cam kết
        ('RATING', 'Đánh giá thủ công'),  # Phản ánh sự hài lòng
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interactions')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='interactions')

    interaction_type = models.CharField(max_length=10, choices=INTERACTION_TYPES, default='QUIZ')

    # Rating này sẽ được chuẩn hóa về thang [1.0 - 5.0] để SVD học tốt nhất
    rating = models.FloatField(default=1.0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Tương tác người dùng"
        verbose_name_plural = "5. Nhật ký tương tác (AI Data)"
        # Một user chỉ nên có 1 điểm số 'tổng hợp' cho mỗi khóa học để tránh nhiễu
        unique_together = ('user', 'course', 'interaction_type')

    def __str__(self):
        return f"{self.user.email} - {self.interaction_type} - {self.rating}"