import os
import django
import random

# Setup môi trường
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_lms.settings')
django.setup()

from ai_engine.models import UserInteraction
from courses.models import CourseQuizAttempt  # Tên model lịch sử làm bài của bạn


def sync_data():
    attempts = CourseQuizAttempt.objects.all()
    print(f"🔄 Đang xử lý {attempts.count()} bản ghi lịch sử làm bài...")

    for att in attempts:
        # Giả sử điểm của bạn lưu ở att.score (0-10) và tổng là att.total_points (10)
        # Tính tỷ lệ phần trăm
        percentage = (att.score / att.total_points) * 100

        # Chuyển đổi sang thang điểm 5 cho AI
        # Ví dụ: 10 điểm -> 5.0 rating | 5 điểm -> 2.5 rating
        ai_rating = max(1.0, round((percentage / 100) * 5, 2))

        # Cập nhật vào bảng AI
        UserInteraction.objects.update_or_create(
            user=att.user,
            course=att.course,
            interaction_type='QUIZ',
            defaults={'rating': ai_rating}
        )

    print("✅ Đồng bộ năng lực người học thành công!")


if __name__ == "__main__":
    sync_data()