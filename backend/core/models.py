from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE
    )
    # Vector năng lực hiện tại: [Toán, Code, Logic, Tiếng Anh...]
    # Ví dụ: [0.5, 0.1, 0.8, 0.4]
    current_ability = models.JSONField(default=list)

    def __str__(self):
        return f"Profile of {self.user.username}"

# Tự động tạo Profile khi tạo User mới (Signal)
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        StudentProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()