from courses.models import Enrollment
import logging

logger = logging.getLogger(__name__)

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

