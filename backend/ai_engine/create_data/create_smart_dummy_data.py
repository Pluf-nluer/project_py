import os
import sys
import django
import random
from django.utils import timezone

# --- BƯỚC 1: CẤU HÌNH ĐƯỜNG DẪN ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_lms.settings')
django.setup()

from django.contrib.auth import get_user_model
from courses.models import Course, CourseQuiz, CourseQuizAttempt
from ai_engine.models import UserInteraction

User = get_user_model()

def create_smart_dummy_data():
    print("--- 1. Đang quét danh sách Khóa học và Bài kiểm tra thật ---")
    courses = Course.objects.all()
    if not courses.exists():
        print("Lỗi: Không tìm thấy khóa học nào trong DB. Hãy thêm khóa học trước!")
        return

    # 2. ĐẢM BẢO MỖI KHÓA HỌC CÓ ÍT NHẤT 1 BÀI KIỂM TRA
    # Thay vì get_or_create, ta kiểm tra exists() để tránh lỗi MultipleObjectsReturned
    for course in courses:
        if not course.quizzes.exists():
            CourseQuiz.objects.create(
                course=course,
                title=f"Kiểm tra năng lực: {course.title}",
                description="Bài kiểm tra mẫu phục vụ AI Training",
                passing_score=70
            )
            print(f"➕ Đã tạo Quiz mới cho: {course.title}")
        else:
            print(f"ℹ️ Khóa học '{course.title}' đã có quiz, bỏ qua bước tạo.")

    # 3. TẠO PERSONAS (NHÓM SINH VIÊN)
    personas = [
        {'name': 'web_dev', 'pref': 'Web', 'count': 10},
        {'name': 'ai_eng', 'pref': 'AI', 'count': 10},
        {'name': 'newbie', 'pref': 'General', 'count': 5}
    ]

    print("--- 2. Đang tạo Sinh viên và Lịch sử làm bài ---")
    for persona in personas:
        for i in range(persona['count']):
            username = f"{persona['name']}_{i}"
            email = f"{username}@example.com"

            # Tạo User (Phù hợp với AbstractUser của bạn)
            user, created = User.objects.get_or_create(
                username=username,
                email=email,
                defaults={'role': 'student'}
            )
            if created:
                user.set_password('password123')
                user.save()

            # Tạo tương tác cho từng khóa học
            for course in courses:
                # Lấy bài quiz đầu tiên (tránh lỗi nếu có nhiều quiz)
                quiz = course.quizzes.first()
                if not quiz: continue

                # Quyết định điểm số dựa trên Persona và Category
                # Chuyển category về string để tránh lỗi None
                category_str = str(course.category or "").lower()
                is_preferred = persona['pref'].lower() in category_str

                if is_preferred:
                    score_percent = random.uniform(85, 100)  # Giỏi mảng sở thích
                elif persona['pref'] == 'General':
                    score_percent = random.uniform(50, 80)   # Trung bình mọi thứ
                else:
                    score_percent = random.uniform(10, 40)   # Yếu mảng không thích

                total_p = 10
                actual_score = round((score_percent / 100) * total_p, 1)

                # 4. TẠO LỊCH SỬ LÀM BÀI (CourseQuizAttempt)
                CourseQuizAttempt.objects.create(
                    student=user,
                    quiz=quiz,
                    status='SUBMITTED', # Sử dụng đúng enum 'SUBMITTED'
                    score=actual_score,
                    total_points=total_p,
                    submitted_at=timezone.now()
                )

                # 5. ĐỒNG BỘ SANG USERINTERACTION (AI DATA)
                # Chuyển đổi sang thang điểm 5 cho model SVD
                ai_rating = max(1.0, round((score_percent / 100) * 5, 2))

                UserInteraction.objects.update_or_create(
                    user=user,
                    course=course,
                    interaction_type='QUIZ',
                    defaults={'rating': ai_rating}
                )

    print(f"✅ THÀNH CÔNG: Đã tạo dữ liệu dựa trên {courses.count()} khóa học thật!")


if __name__ == "__main__":
    create_smart_dummy_data()