import os
import django
import pandas as pd
import random
import sys

# 1. Thiết lập môi trường Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_lms.settings')
django.setup()

from courses.models import Course
from ai_engine.models import UserInteraction
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()


def clean_data():
    """Xóa dữ liệu cũ để đồng bộ hóa dataset mới"""
    print("--- Đang làm sạch dữ liệu cũ để chuẩn bị dataset mới ---")
    UserInteraction.objects.all().delete()
    Course.objects.all().delete()  # Xóa để tránh trùng lặp khi bạn cập nhật lại Model


def import_from_csv(file_path, platform):
    """Ánh xạ linh hoạt dữ liệu từ 4 nguồn: Udemy, Coursera, edX, Skillshare"""
    if not os.path.exists(file_path):
        print(f"Bỏ qua: Không tìm thấy file {platform} tại {file_path}")
        return

    df = pd.read_csv(file_path)
    print(f"Đang xử lý dữ liệu từ {platform} ({len(df)} dòng)...")

    for _, row in df.head(150).iterrows():  # Tăng lên 150 khóa mỗi nguồn để đa dạng hóa
        # Tên khóa học (Title)
        title = row.get('Title') or row.get('course_title') or row.get('course_name') or row.get('title')

        if not title:
            continue

        # Xử lý Mô tả & Yêu cầu (edX cung cấp Prerequisites dạng Text)
        desc_text = row.get('description') or row.get('summary') or f"Khóa học chuyên sâu từ {platform}"
        pre_text = row.get('Prerequisites') or "Không yêu cầu kiến thức trước."

        # Trích xuất Kỹ năng (edX: Associated Skills)
        skills = row.get('Associated Skills') or []
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(',')]

        # Tạo hoặc cập nhật khóa học vào Database
        course, created = Course.objects.get_or_create(
            title=str(title)[:255],
            defaults={
                'description': str(desc_text),
                'category': row.get('subject') or row.get('category') or "General IT",
                'instructor_name': row.get('Instructor') or row.get('instructor') or "Chuyên gia chuyên môn",
                'institution': row.get('Institution') or "NLU Learning Partner",  # edX
                'level': row.get('Level') or "All Levels",  # edX
                'language': row.get('Language') or "English",  # edX
                'duration': row.get('Duration') or "10h 45m",  # Skillshare
                'imported_enrollments': int(row.get('Students', 0)),  # Skillshare
                'external_link': row.get('Link') or "",  # edX/Skillshare
                'prerequisites_text': str(pre_text),
                'skills_vector': skills,
                'rating': random.uniform(3.8, 5.0)
            }
        )


def create_smart_interactions(num_users=60):
    """Tạo tương tác thông minh cho AI học (Smart Bias)"""
    print(f"Đang giả lập {num_users} học viên và hành vi học tập...")

    courses = Course.objects.all()
    if not courses.exists():
        return

    # Tạo học viên mẫu
    for i in range(num_users):
        email = f"student{i}@nlu.edu.vn"
        user, _ = User.objects.get_or_create(username=email, email=email, defaults={'password': 'password123'})

        # Mỗi học viên có 1-2 danh mục yêu thích để tạo "quy luật" cho AI
        categories = list(Course.objects.values_list('category', flat=True).distinct())
        fav_cats = random.sample(categories, k=min(2, len(categories)))

        # Chọn ngẫu nhiên 20 khóa học để tạo tương tác
        sampled_courses = random.sample(list(courses), min(len(courses), 20))

        for course in sampled_courses:
            # Nếu khóa học thuộc sở thích -> Rating cao (4-5), hành động ENROLL
            if course.category in fav_cats:
                rating = random.uniform(4.0, 5.0)
                itype = 'ENROLL'
            else:
                rating = random.uniform(1.0, 3.5)
                itype = 'VIEW'

            UserInteraction.objects.create(
                user=user,
                course=course,
                interaction_type=itype,
                rating=rating
            )


if __name__ == "__main__":
    # Lưu ý: Bạn cần chạy 'python manage.py migrate' trước nếu đã sửa Model Course
    clean_data()

    # Đường dẫn đến 4 file dataset chính
    csv_files = [
        ('Udemy.csv', 'Udemy'),
        ('Coursera.csv', 'Coursera'),
        ('edx.csv', 'edX'),
        ('skillshare.csv', 'Skillshare')
    ]

    for filename, platform in csv_files:
        path = os.path.join(settings.BASE_DIR, filename)
        import_from_csv(path, platform)

    create_smart_interactions()
    print("\n=== HOÀN TẤT: DATABASE ĐÃ ĐẦY ĐỦ THÔNG TIN TỪ 4 NGUỒN ===")