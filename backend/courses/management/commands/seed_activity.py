import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courses.models import Course, CourseClass, Enrollment, Quiz, QuizResult, UserLessonProgress, Lesson
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Tạo dữ liệu giả: Học viên, Đăng ký học, Kết quả thi (Để test Thống kê Admin)'

    def handle(self, *args, **kwargs):
        self.stdout.write("Tạo dữ liệu hành vi người dùng")

        # 1. Tạo 20 sinh viên giả
        students = []
        for i in range(1, 21):
            email = f"student{i}@example.com"
            user, created = User.objects.get_or_create(
                username=email, 
                email=email,
                defaults={'role': 'student'}
            )
            if created:
                user.set_password("21012005") # mk
                user.save()
            students.append(user)
        
        self.stdout.write(self.style.SUCCESS(f" + Đã có {len(students)} học viên."))

        # 2. Cho học viên đăng ký khóa học ngẫu nhiên cần chạy lệnh 'seed_courses' trước để có khóa học
        courses = Course.objects.all()
        if not courses.exists():
            self.stdout.write(self.style.WARNING("Cảnh báo: Chưa có khóa học nào. Hãy chạy lệnh 'python manage.py seed_courses' trước."))
            return

        for student in students:
            # Mỗi học viên đăng ký ngẫu nhiên 1-3 khóa
            random_courses = random.sample(list(courses), k=random.randint(1, min(3, len(courses))))
            
            for course in random_courses:
                # Tìm lớp học đầu tiên của khóa này
                c_class = CourseClass.objects.filter(course=course).first()
                if not c_class:
                    continue
                
                # Đăng ký học
                Enrollment.objects.get_or_create(student=student, course_class=c_class)

                # 3. Giả lập tiến độ học (UserLessonProgress) random học từ 20% đến 80% số bài
                lessons = Lesson.objects.filter(module__course=course)
                if lessons.exists():
                    num_lessons_done = int(len(lessons) * random.uniform(0.2, 0.8))
                    for lesson in lessons[:num_lessons_done]:
                        UserLessonProgress.objects.get_or_create(
                            student=student,
                            lesson=lesson,
                            defaults={'is_completed': True, 'completed_at': timezone.now()}
                        )

        self.stdout.write(self.style.SUCCESS(" + Đã giả lập đăng ký và học bài."))

        # 4. Giả lập thi Quiz (Quan trọng AI Recommendation)
        quizzes = Quiz.objects.all()
        if not quizzes.exists():
             self.stdout.write(self.style.WARNING("Cảnh báo: Chưa có Quiz. Hãy chạy 'import_quiz' trước."))
        else:
            for student in students:
                for quiz in quizzes:
                    # Random điểm số từ 30 đến 100
                    score = random.randint(30, 100)
                    
                    # Logic xác định trình độ dựa trên điểm
                    level = "Beginner"
                    if score > 80: level = "Advanced"
                    elif score > 50: level = "Intermediate"

                    # Tạo kết quả thi
                    QuizResult.objects.create(
                        student=student,
                        quiz=quiz,
                        score=score,
                        total_questions=20, # Giả định bộ PCEP có 20 câu
                        recommended_level=level,
                        details={"note": "Dữ liệu giả lập cho Admin Dashboard"}
                    )
            
            self.stdout.write(self.style.SUCCESS(" + Đã giả lập kết quả thi năng lực."))

        self.stdout.write(self.style.SUCCESS('--------------------------------------------------'))
        self.stdout.write(self.style.SUCCESS('Dashboard Thống Kê của bạn giờ đã có đầy đủ dữ liệu.'))