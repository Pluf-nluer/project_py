import os
import sys
import django
import random
from datetime import date, timedelta

# --- BƯỚC 1: CẤU HÌNH MÔI TRƯỜNG DJANGO ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_lms.settings')
django.setup()

from courses.models import Course, CourseClass


def get_random_schedule():
    """Tạo ra một tổ hợp lịch học ngẫu nhiên và chuyên nghiệp"""

    # Các tổ hợp ngày phổ biến
    day_groups = [
        ["Thứ 2", "Thứ 4", "Thứ 6"],
        ["Thứ 3", "Thứ 5", "Thứ 7"],
        ["Thứ 2", "Thứ 6"],
        ["Thứ 3", "Thứ 5"],
        ["Thứ 7", "Chủ Nhật"]
    ]

    # Các khung giờ phổ biến
    time_slots = [
        "08:00 - 10:00",
        "10:00 - 12:00",
        "14:00 - 16:00",
        "16:00 - 18:00",
        "18:30 - 20:30",
        "19:00 - 21:00"
    ]

    selected_days = random.choice(day_groups)
    selected_time = random.choice(time_slots)

    # Chuyển đổi sang cấu trúc JSON để lưu vào Database
    schedule_json = []
    for day in selected_days:
        schedule_json.append({
            "day": day,
            "time": selected_time
        })

    return schedule_json


def auto_generate_diverse_classes():
    print("--- Đang khởi tạo lớp học với lịch trình đa dạng ---")

    courses = Course.objects.all()
    count_created = 0

    for course in courses:
        # Kiểm tra nếu chưa có lớp học nào cho khóa này
        if not CourseClass.objects.filter(course=course).exists():

            # Ngẫu nhiên ngày bắt đầu trong khoảng 30 ngày tới
            start_dt = date.today() + timedelta(days=random.randint(1, 30))
            # Thời gian học ngẫu nhiên từ 2 đến 4 tháng
            end_dt = start_dt + timedelta(days=random.randint(60, 120))

            # Lấy lịch học ngẫu nhiên
            schedule = get_random_schedule()

            # Sĩ số ngẫu nhiên từ 20 đến 50
            capacity = random.choice([20, 25, 30, 40, 50])

            try:
                new_class = CourseClass.objects.create(
                    course=course,
                    name=f"Lớp {random.randint(101, 999)} - {course.title[:15]}",
                    start_date=start_dt,
                    end_date=end_dt,
                    max_capacity=capacity,
                    schedule=schedule
                )

                # In ra để theo dõi tiến độ
                days_str = ", ".join([s['day'] for s in schedule])
                time_str = schedule[0]['time']
                print(f"[OK] {course.title[:30]}... -> {days_str} ({time_str})")

                count_created += 1
            except Exception as e:
                print(f"[Lỗi] {course.title}: {e}")

    print(f"\n--- Hoàn tất! Đã tạo mới {count_created} lớp học với lịch trình khác nhau ---")


if __name__ == "__main__":
    auto_generate_diverse_classes()