import os
import sys
import django
import random

# --- BƯỚC 1: CẤU HÌNH MÔI TRƯỜNG DJANGO ---
# Đoạn này giúp script tìm thấy file settings.py dù bạn đứng ở đâu để chạy
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_lms.settings')
django.setup()

# Import các model cần thiết
from courses.models import Course, Module, Lesson


def auto_generate_curriculum():
    print("--- Đang bắt đầu tạo Phần học và Bài học tự động ---")

    courses = Course.objects.all()
    if not courses.exists():
        print("Thông báo: Không tìm thấy khóa học nào.")
        return

    # Danh sách tên phần học mẫu để đa dạng hóa
    module_titles = [
        "Giới thiệu tổng quan",
        "Kiến thức nền tảng",
        "Kỹ thuật chuyên sâu",
        "Thực hành thực tế",
        "Phân tích tình huống",
        "Mẹo và thủ thuật",
        "Xử lý lỗi thường gặp",
        "Tối ưu hóa quy trình",
        "Dự án cuối khóa",
        "Tổng kết và Định hướng"
    ]

    for course in courses:
        # Kiểm tra nếu khóa học đã có module rồi thì bỏ qua để tránh trùng
        if Module.objects.filter(course=course).exists():
            print(f"Bỏ qua: '{course.title}' đã có dữ liệu học tập.")
            continue

        print(f"Đang xử lý: {course.title}...")

        for i in range(1, 11):  # Tạo đúng 10 phần
            # Lấy tên từ danh sách mẫu, nếu hết thì dùng "Phần X"
            title_suffix = module_titles[i - 1] if i - 1 < len(module_titles) else f"Nội dung bổ sung {i}"

            module = Module.objects.create(
                course=course,
                title=f"Phần {i}: {title_suffix}",
                order=i
            )

            # Tạo thêm 2 bài học (Lessons) mẫu cho mỗi Module cho "xôm"
            for j in range(1, 3):
                Lesson.objects.create(
                    module=module,
                    title=f"Bài {i}.{j}: Hướng dẫn chi tiết bước {j}",
                    duration=f"{random.randint(5, 15)}:00",
                    is_preview=(i == 1 and j == 1),  # Chỉ cho xem trước bài đầu tiên của phần 1
                    order=j
                )

        print(f"  => Đã tạo xong 10 phần và 20 bài học cho '{course.title}'")

    print("\n--- HOÀN TẤT: Toàn bộ khóa học đã có chương trình giảng dạy! ---")


if __name__ == "__main__":
    auto_generate_curriculum()