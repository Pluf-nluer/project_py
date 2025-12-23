from courses.models import Enrollment


def check_prerequisites(user, course_target):
    # Lấy ID các Course (gốc) mà user đã học xong
    completed_ids = Enrollment.objects.filter(
        student=user,
        status='COMPLETED'
    ).values_list('course_class__course__id', flat=True)

    required_courses = course_target.prerequisites.all()
    missing = [req.title for req in required_courses if req.id not in completed_ids]

    if missing:
        return False, f"Thiếu khóa học nền tảng: {', '.join(missing)}"
    return True, "OK"


def check_schedule_conflict(user, new_schedule):
    active_schedules = Enrollment.objects.filter(
        student=user,
        status='ACTIVE'
    ).values_list('course_class__schedule', flat=True)

    for old_sch in active_schedules:
        for sA in old_sch:
            for sB in new_schedule:
                if sA['day'] == sB['day']:
                    # Check giao nhau khoảng thời gian
                    if max(sA['start'], sB['start']) < min(sA['end'], sB['end']):
                        return True, f"Trùng lịch Thứ {sA['day']} ({sA['start']}h-{sA['end']}h)"
    return False, "OK"