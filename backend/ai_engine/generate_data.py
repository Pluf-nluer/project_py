import os
import django
import pandas as pd
import random

# 1. Thiết lập môi trường Django
import sys

# Thêm đường dẫn thư mục gốc của dự án vào sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE',
                      'backend_lms.settings')  # Đảm bảo tên này khớp với folder settings của bạn
django.setup()

from courses.models import Course
from ai_engine.models import UserInteraction
from django.contrib.auth import get_user_model

User = get_user_model()


def clean_data():
    """Xóa dữ liệu cũ để tránh trùng lặp khi test"""
    print("Đang làm sạch dữ liệu cũ...")
    UserInteraction.objects.all().delete()
    # Course.objects.all().delete() # Cẩn thận khi dùng lệnh này nếu đã có dữ liệu thật


def import_from_csv(file_path, platform):
    """Đọc và map các cột từ CSV vào Model Course"""
    if not os.path.exists(file_path):
        print(f"Không tìm thấy file: {file_path}")
        return

    df = pd.read_csv(file_path)
    print(f"Đang import dữ liệu từ {platform} ({len(df)} dòng)...")

    # Các danh mục dựa trên giao diện web của bạn
    categories = ['Photography', 'IT & Software', 'Art', 'Backend']

    for _, row in df.head(100).iterrows():  # Lấy mẫu 100 khóa mỗi file để tránh nặng máy
        # Map tên cột linh hoạt tùy theo file CSV
        title = row.get('course_title') or row.get('course_name') or row.get('title')
        description = row.get('description') or row.get('summary') or "Mô tả khóa học tuyệt vời"

        if title:
            Course.objects.get_or_create(
                title=title[:255],
                defaults={
                    'description': str(description),
                    'price': random.choice([0, 199000, 499000]),
                    'category': random.choice(categories),  # Gán category ngẫu nhiên từ list web
                    'instructor_name': row.get('instructor') or "Chuyên gia hệ thống",
                    'rating': random.uniform(3.5, 5.0)
                }
            )


def create_smart_interactions(num_users=50):
    """Tạo tương tác giả lập có quy luật để AI học"""
    print(f"Đang tạo tương tác cho {num_users} người dùng...")

    # Tạo người dùng mẫu nếu chưa có
    for i in range(num_users):
        email = f"student{i}@nlu.edu.vn"
        User.objects.get_or_create(username=email, email=email, defaults={'password': 'password123'})

    users = User.objects.all()
    courses = Course.objects.all()
    categories = list(set(courses.values_list('category', flat=True)))

    for user in users:
        # Mỗi user "thích" ngẫu nhiên 1-2 danh mục nhất định
        fav_categories = random.sample(categories, k=min(2, len(categories)))

        # Chọn ra 15 khóa học để tương tác
        sampled_courses = random.sample(list(courses), min(len(courses), 15))

        for course in sampled_courses:
            # Quy luật: Nếu khóa học thuộc danh mục yêu thích, chấm điểm cao (4-5 sao)
            # Nếu không, chấm điểm thấp (1-3 sao)
            if course.category in fav_categories:
                rating = random.uniform(4.0, 5.0)
                itype = 'ENROLL'
            else:
                rating = random.uniform(1.0, 3.0)
                itype = 'VIEW'

            UserInteraction.objects.create(
                user=user,
                course=course,
                interaction_type=itype,
                rating=rating
            )


if __name__ == "__main__":
    clean_data()

    from django.conf import settings

    udemy_path = os.path.join(settings.BASE_DIR, 'Udemy.csv')
    coursera_path = os.path.join(settings.BASE_DIR, 'Coursera.csv')

    # 2. Truyền đường dẫn đầy đủ vào hàm
    import_from_csv(udemy_path, 'Udemy')
    import_from_csv(coursera_path, 'Coursera')

    create_smart_interactions()
    print("=== HOÀN TẤT QUÁ TRÌNH CHUẨN BỊ DỮ LIỆU ===")