# Tạm thời dùng logic ngẫu nhiên hoặc logic đơn giản
from courses.models import Course
import random

def get_recommendations(user_profile):
    """
    Hàm gợi ý khóa học dựa trên Profile.
    Hiện tại trả về 3 khóa học ngẫu nhiên chưa học.
    """
    all_courses = list(Course.objects.all())
    if len(all_courses) < 3:
        return all_courses
    return random.sample(all_courses, 3)

def train_model():
    """
    Placeholder cho hàm train model sau này
    """
    print("Training process started... (Fake)")
    return True