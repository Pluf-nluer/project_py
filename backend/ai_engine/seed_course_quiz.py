import os
import sys
import django
import random

# -----------------------------
# DJANGO SETUP
# -----------------------------
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend_lms.settings")
django.setup()

from courses.models import Course, CourseQuiz, CourseQuizQuestion, CourseQuizChoice

# -----------------------------
# BLOOM QUESTION BANK
# -----------------------------
BLOOM_QUESTIONS = {
    "remember": {
        "question": "Khái niệm nào sau đây được giới thiệu trong khóa học {course}?",
        "correct": "Khái niệm cốt lõi của {topic}",
        "wrong": [
            "Khái niệm không liên quan đến nội dung khóa học",
            "Thuật ngữ ngoài phạm vi môn học",
            "Khái niệm của lĩnh vực khác"
        ]
    },
    "understand": {
        "question": "Mục đích chính của {topic} trong {course} là gì?",
        "correct": "Giúp giải quyết bài toán chính của khóa học",
        "wrong": [
            "Chỉ dùng cho mục đích trang trí",
            "Không có vai trò cụ thể",
            "Chỉ dùng trong dự án nâng cao"
        ]
    },
    "apply": {
        "question": "Trong thực tế, {topic} được áp dụng để làm gì?",
        "correct": "Áp dụng để xây dựng chức năng trong dự án thực tế",
        "wrong": [
            "Chỉ dùng trong lý thuyết",
            "Không thể áp dụng trong dự án",
            "Chỉ dùng để học thuộc"
        ]
    },
    "analyze": {
        "question": "Điểm khác biệt chính của {topic} so với cách tiếp cận khác là gì?",
        "correct": "Tối ưu hơn về cấu trúc và khả năng mở rộng",
        "wrong": [
            "Không có sự khác biệt",
            "Phức tạp hơn nhưng kém hiệu quả",
            "Không ảnh hưởng đến hệ thống"
        ]
    },
    "evaluate": {
        "question": "Khi nào nên sử dụng {topic} trong dự án?",
        "correct": "Khi cần giải pháp phù hợp với yêu cầu bài toán",
        "wrong": [
            "Luôn luôn sử dụng trong mọi trường hợp",
            "Chỉ khi không có lựa chọn khác",
            "Không nên sử dụng trong dự án thực tế"
        ]
    }
}

# -----------------------------
# HELPER: XÁC ĐỊNH TOPIC
# -----------------------------
def detect_topic(course_title: str) -> str:
    title = course_title.lower()
    if "python" in title:
        return "Python"
    if "django" in title:
        return "Django"
    if "web" in title:
        return "phát triển web"
    if "data" in title:
        return "xử lý dữ liệu"
    return "nội dung chính của khóa học"

# -----------------------------
# SEED QUIZ
# -----------------------------
def seed_quiz_for_courses():
    courses = Course.objects.all()

    for course in courses:
        topic = detect_topic(course.title)

        quiz, created = CourseQuiz.objects.get_or_create(
            course=course,
            title=f"Quiz đánh giá – {course.title}",
            defaults={
                "description": f"Quiz đánh giá kiến thức theo Bloom Taxonomy cho {course.title}",
                "time_limit": random.randint(10,30),   # ✅ 30 phút
                "passing_score": 60,
                "max_attempts": 3,
                "shuffle_questions": True,
                "shuffle_choices": True,
                "is_active": True,
            }
        )

        if not created:
            print(f"⏭ Quiz đã tồn tại: {course.title}")
            continue

        print(f"✅ Tạo quiz cho: {course.title}")

        order = 1
        for level, tpl in BLOOM_QUESTIONS.items():
            question_text = tpl["question"].format(
                course=course.title,
                topic=topic
            )

            question = CourseQuizQuestion.objects.create(
                quiz=quiz,
                question_text=question_text,
                points=1,
                order=order
            )

            choices = []

            # Correct answer
            choices.append(
                CourseQuizChoice(
                    question=question,
                    choice_text=tpl["correct"].format(
                        course=course.title,
                        topic=topic
                    ),
                    is_correct=True
                )
            )

            # Wrong answers
            for wrong in tpl["wrong"]:
                choices.append(
                    CourseQuizChoice(
                        question=question,
                        choice_text=wrong,
                        is_correct=False
                    )
                )

            random.shuffle(choices)

            for idx, c in enumerate(choices, start=1):
                c.order = idx
                c.save()

            order += 1

        print(f"🎯 Đã tạo quiz Bloom ({order-1} câu) cho {course.title}")

    print("\n=== HOÀN TẤT SEED QUIZ ===")


if __name__ == "__main__":
    seed_quiz_for_courses()
