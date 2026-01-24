import os
import sys
import django
import random

# --- CẤU HÌNH MÔI TRƯỜNG ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_lms.settings')
django.setup()

from courses.models import CourseClass


def get_new_format_schedule():
    """Tạo lịch học theo định dạng JSON mới với tiếng Anh để khớp với TKB React"""
    day_groups = [
        ["Monday", "Wednesday", "Friday"],
        ["Tuesday", "Thursday", "Saturday"],
        ["Monday", "Friday"],
        ["Saturday", "Sunday"]
    ]

    # Các khung giờ (Bắt đầu, Kết thúc)
    time_slots = [
        ("08:00", "10:00"),
        ("10:00", "12:00"),
        ("14:00", "16:00"),
        ("18:00", "20:00"),
        ("19:00", "21:00")
    ]

    selected_days = random.choice(day_groups)
    start_t, end_t = random.choice(time_slots)

    schedule_json = []
    for day in selected_days:
        schedule_json.append({
            "day": day,
            "start_time": start_t,
            "end_time": end_t,
            "room": random.choice(["Phòng 101", "Phòng 202", "Online"]),
            "note": random.choice(["Học lý thuyết", "Thực hành", "Thảo luận"])
        })
    return schedule_json


def update_all_existing_schedules():
    print("--- Đang cập nhật lại lịch học cho tất cả các lớp hiện có ---")

    # Lấy tất cả các lớp học đang có trong DB
    all_classes = CourseClass.objects.all()
    count = 0

    for cls in all_classes:
        # Tạo lịch mới
        new_sched = get_new_format_schedule()

        # Ghi đè lịch cũ bằng lịch mới
        cls.schedule = new_sched
        cls.save()

        print(f"[OK] Đã cập nhật lịch cho: {cls.name}")
        count += 1

    print(f"\n--- Hoàn tất! Đã sửa lại {count} lớp học sang định dạng JSON mới ---")


if __name__ == "__main__":
    update_all_existing_schedules()