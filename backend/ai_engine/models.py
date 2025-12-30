from django.db import models
from django.contrib.auth.models import User
from courses.models import Course
from django.conf import settings

class UserInteraction(models.Model):
    INTERACTION_TYPES = (
        ('VIEW', 'Xem khóa học'),
        ('CLICK', 'Click vào chi tiết'),
        ('RATING', 'Đánh giá sao'),
        ('ENROLL', 'Đăng ký học'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='interactions'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='interactions'
    )
    interaction_type = models.CharField(
        max_length=10,
        choices=INTERACTION_TYPES,
        default='VIEW'
    )
    # Trọng số điểm cho AI (Ví dụ: VIEW=1, CLICK=2, ENROLL=5)
    rating = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Tương tác người dùng"
        verbose_name_plural = "5. Nhật ký tương tác (AI Data)"

    def __str__(self):
        return f"{self.user.email} - {self.interaction_type} - {self.course.title}"