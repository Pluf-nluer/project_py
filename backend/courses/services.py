from courses.models import Enrollment
import logging

logger = logging.getLogger(__name__)

def check_prerequisites(user, course_target):
    """Kiểm tra điều kiện tiên quyết"""
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
    """
    Safely check for schedule conflicts.
    Handles invalid/missing schedule data gracefully.
    """
    # Make sure new_schedule is always treated as list
    if not isinstance(new_schedule, (list, tuple)):
        logger.warning(f"Invalid new_schedule format for user {user}: {new_schedule}")
        return True, "Lịch học mới không hợp lệ (phải là danh sách)"

    active_schedules = Enrollment.objects.filter(
        student=user,
        status='ACTIVE'
    ).values_list('course_class__schedule', flat=True)

    for old_sch in active_schedules:
        # Skip invalid/old data instead of crashing
        if not isinstance(old_sch, (list, tuple)):
            logger.warning(f"Skipping invalid schedule data: {old_sch}")
            continue

        for sA in old_sch:
            # Extra safety: skip if not a dict with required keys
            if not isinstance(sA, dict):
                continue
            if not all(key in sA for key in ('day', 'start', 'end')):
                logger.warning(f"Invalid slot format: {sA}")
                continue

            for sB in new_schedule:
                if not isinstance(sB, dict):
                    continue
                if not all(key in sB for key in ('day', 'start', 'end')):
                    continue

                if sA['day'] == sB['day']:
                    try:
                        # Try to compare – add type conversion if needed
                        startA = float(sA['start'])
                        endA   = float(sA['end'])
                        startB = float(sB['start'])
                        endB   = float(sB['end'])

                        if max(startA, startB) < min(endA, endB):
                            return True, (
                                f"Trùng lịch Thứ {sA['day']} "
                                f"({sA['start']}h-{sA['end']}h)"
                            )
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Invalid time format in schedule: {sA} / {sB} → {e}")
                        continue  # skip this slot

    # Logging should be at the beginning or in debug mode only
    logger.debug(f"Active schedules for user {user}: {active_schedules}")
    logger.debug(f"New schedule: {new_schedule}")

    return False, "OK"

def parse_time_to_minutes(time_str):
    """
    Chuyển đổi thời gian từ string sang phút
    Hỗ trợ format: "HH:MM" hoặc số thập phân
    """
    try:
        if isinstance(time_str, (int, float)):
            return int(float(time_str) * 60)
        
        if ':' in str(time_str):
            parts = str(time_str).split(':')
            hours = int(parts[0])
            minutes = int(parts[1])
            return hours * 60 + minutes
        
        # Nếu là số thập phân dạng "8.5" = 8:30
        return int(float(time_str) * 60)
    except (ValueError, TypeError, IndexError) as e:
        logger.warning(f"Invalid time format: {time_str} → {e}")
        return None


def normalize_day(day_value):
    """
    Chuẩn hóa giá trị ngày về số (2-8)
    Hỗ trợ cả format số và string
    """
    day_map = {
        'Monday': 2, 'Tuesday': 3, 'Wednesday': 4,
        'Thursday': 5, 'Friday': 6, 'Saturday': 7, 'Sunday': 8,
        'Thứ 2': 2, 'Thứ 3': 3, 'Thứ 4': 4, 
        'Thứ 5': 5, 'Thứ 6': 6, 'Thứ 7': 7, 'Chủ nhật': 8
    }
    
    if isinstance(day_value, str):
        return day_map.get(day_value)
    elif isinstance(day_value, int):
        return day_value if 2 <= day_value <= 8 else None
    
    return None


def check_time_overlap(start1_min, end1_min, start2_min, end2_min):
    """
    Kiểm tra 2 khoảng thời gian có trùng nhau không
    Trả về True nếu trùng, False nếu không trùng
    """
    if None in [start1_min, end1_min, start2_min, end2_min]:
        return False
    
    # Hai khoảng trùng nhau khi: max(start) < min(end)
    return max(start1_min, start2_min) < min(end1_min, end2_min)


def format_time_from_minutes(minutes):
    """Chuyển phút về format HH:MM"""
    if minutes is None:
        return "N/A"
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"


def check_schedule_conflict(user, new_schedule):
    """
    Kiểm tra trùng lịch học
    Hỗ trợ nhiều format dữ liệu schedule khác nhau
    """
    # Validate input
    if not isinstance(new_schedule, (list, tuple)):
        logger.warning(f"Invalid new_schedule format for user {user}: {new_schedule}")
        return True, "Lịch học mới không hợp lệ (phải là danh sách)"

    if not new_schedule:
        return False, "OK"

    # Lấy tất cả lịch học hiện tại của user
    active_enrollments = Enrollment.objects.filter(
        student=user,
        status='ACTIVE'
    ).select_related('course_class__course')

    logger.debug(f"Checking schedule for user {user.email}")
    logger.debug(f"New schedule: {new_schedule}")
    logger.debug(f"Active enrollments: {active_enrollments.count()}")

    # Duyệt qua từng enrollment hiện tại
    for enrollment in active_enrollments:
        old_schedule = enrollment.course_class.schedule
        course_name = enrollment.course_class.course.title
        class_name = enrollment.course_class.name

        # Skip nếu schedule không hợp lệ
        if not isinstance(old_schedule, (list, tuple)):
            logger.warning(f"Skipping invalid schedule for {course_name}: {old_schedule}")
            continue

        # So sánh từng slot trong lịch cũ với lịch mới
        for old_slot in old_schedule:
            if not isinstance(old_slot, dict):
                continue

            # Chuẩn hóa ngày cho old_slot
            old_day = normalize_day(old_slot.get('day'))
            if old_day is None:
                logger.warning(f"Invalid day in old_slot: {old_slot.get('day')}")
                continue

            # Lấy thời gian (hỗ trợ nhiều key khác nhau)
            old_start_str = old_slot.get('start') or old_slot.get('start_time')
            old_end_str = old_slot.get('end') or old_slot.get('end_time')
            
            old_start_min = parse_time_to_minutes(old_start_str)
            old_end_min = parse_time_to_minutes(old_end_str)

            if old_start_min is None or old_end_min is None:
                logger.warning(f"Invalid time in old_slot: {old_start_str} - {old_end_str}")
                continue

            # So sánh với từng slot trong lịch mới
            for new_slot in new_schedule:
                if not isinstance(new_slot, dict):
                    continue

                # Chuẩn hóa ngày cho new_slot
                new_day = normalize_day(new_slot.get('day'))
                if new_day is None:
                    logger.warning(f"Invalid day in new_slot: {new_slot.get('day')}")
                    continue

                # Chỉ kiểm tra nếu cùng ngày
                if old_day != new_day:
                    continue

                # Lấy thời gian
                new_start_str = new_slot.get('start') or new_slot.get('start_time')
                new_end_str = new_slot.get('end') or new_slot.get('end_time')
                
                new_start_min = parse_time_to_minutes(new_start_str)
                new_end_min = parse_time_to_minutes(new_end_str)

                if new_start_min is None or new_end_min is None:
                    logger.warning(f"Invalid time in new_slot: {new_start_str} - {new_end_str}")
                    continue

                # Kiểm tra trùng lịch
                if check_time_overlap(old_start_min, old_end_min, new_start_min, new_end_min):
                    day_names = {
                        2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4',
                        5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7', 8: 'Chủ nhật'
                    }
                    
                    conflict_msg = (
                        f"Trùng lịch với lớp '{class_name}' ({course_name}) "
                        f"vào {day_names.get(old_day, f'Thứ {old_day}')} "
                        f"{format_time_from_minutes(old_start_min)}-{format_time_from_minutes(old_end_min)}. "
                        f"Lịch mới: {format_time_from_minutes(new_start_min)}-{format_time_from_minutes(new_end_min)}"
                    )
                    
                    logger.warning(f"Schedule conflict detected: {conflict_msg}")
                    return True, conflict_msg

    logger.debug("No schedule conflicts found")
    return False, "OK"