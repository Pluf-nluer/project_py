from django.db.models.signals import post_save
from django.dispatch import receiver
from courses.models import CourseQuizAttempt # Tên model lịch sử làm bài của bạn
from ai_engine.models import UserInteraction

@receiver(post_save, sender=CourseQuizAttempt)
def update_ai_interaction(sender, instance, created, **kwargs):
    # Nếu bài làm đã nộp (đã có điểm)
    if instance.status == 'đã nộp' or instance.score is not None:
        # Tính toán rating 1-5 dựa trên điểm số
        percentage = (instance.score / instance.total_points) * 100
        ai_rating = max(1.0, round((percentage / 100) * 5, 2))

        # Cập nhật hoặc tạo mới bản ghi tương tác cho AI
        UserInteraction.objects.update_or_create(
            user=instance.user,
            course=instance.course,
            interaction_type='QUIZ',
            defaults={'rating': ai_rating}
        )
        print(f"✅ AI Data Updated: User {instance.user.id} - Course {instance.course.id} - Rating {ai_rating}")