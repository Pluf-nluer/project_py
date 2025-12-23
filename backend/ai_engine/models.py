from django.db import models
from django.contrib.auth.models import User
from courses.models import Course
from django.conf import settings

class UserInteraction(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    rating = models.FloatField(null=True, blank=True)
    action_type = models.CharField(max_length=50) # Ví dụ: 'view', 'enroll', 'click'
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.action_type}"