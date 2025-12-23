from django.core.management.base import BaseCommand
from courses.models import Course, Module, Lesson, CourseClass
from django.utils import timezone
import datetime

class Command(BaseCommand):
    help = 'Đổ dữ liệu mẫu số lượng lớn để test giao diện React'

    def handle(self, *args, **kwargs):
        courses_data = [
            # --- CATEGORY: PHOTOGRAPHY ---
            {
                "title": "Mastering Digital Photography 2025",
                "instructor_name": "John Doe",
                "price": 0, # Free
                "category": "Photography",
                "duration": "10h 30m",
                "total_lessons": 45,
                "rating": 4.9,
                "image": "https://images.unsplash.com/photo-1542038783-0ad13aa9d45a?w=800",
                "description": "Học mọi thứ về máy ảnh và bố cục.",
                "classes": [{"name": "Lớp Photography 01", "max_capacity": 50}]
            },
            {
                "title": "Professional Portrait Photography",
                "instructor_name": "David Lee",
                "price": 49.99,
                "category": "Photography",
                "duration": "5h 20m",
                "total_lessons": 15,
                "rating": 4.7,
                "image": "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800",
                "description": "Cách chụp ảnh chân dung có hồn và chuyên nghiệp.",
                "classes": [{"name": "Lớp Studio Tối", "max_capacity": 20}]
            },

            # --- CATEGORY: IT & SOFTWARE ---
            {
                "title": "Docker & Kubernetes Thực Chiến",
                "instructor_name": "Kenny White",
                "price": 89.00,
                "category": "IT & Software",
                "duration": "25h 00m",
                "total_lessons": 120,
                "rating": 4.8,
                "image": "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800",
                "description": "Triển khai hệ thống Microservices quy mô lớn.",
                "classes": [{"name": "Lớp Devops K1", "max_capacity": 30}]
            },
            {
                "title": "React Native for Mobile Apps",
                "instructor_name": "Sarah Johnson",
                "price": 0, # Free
                "category": "IT & Software",
                "duration": "12h 45m",
                "total_lessons": 60,
                "rating": 4.6,
                "image": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
                "description": "Xây dựng ứng dụng iOS/Android chỉ với Javascript.",
                "classes": [{"name": "Lớp Mobile 01", "max_capacity": 40}]
            },

            # --- CATEGORY: BACKEND ---
            {
                "title": "Python Django Masterclass",
                "instructor_name": "Harry Potter",
                "price": 75.50,
                "category": "Backend",
                "duration": "40h 00m",
                "total_lessons": 150,
                "rating": 4.9,
                "image": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
                "description": "Xây dựng Website mạnh mẽ với Django Framework.",
                "classes": [{"name": "Lớp Python Backend", "max_capacity": 25}]
            },
            {
                "title": "Node.js Express & MongoDB",
                "instructor_name": "Emily Brown",
                "price": 65.00,
                "category": "Backend",
                "duration": "18h 30m",
                "total_lessons": 85,
                "rating": 4.5,
                "image": "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800",
                "description": "Xây dựng API hiệu năng cao cho ứng dụng Real-time.",
                "classes": [{"name": "Lớp Node.js", "max_capacity": 30}]
            },

            # --- CATEGORY: ART ---
            {
                "title": "UI/UX Design Fundamentals",
                "instructor_name": "Mike Smith",
                "price": 35.00,
                "category": "Art",
                "duration": "8h 15m",
                "total_lessons": 22,
                "rating": 4.7,
                "image": "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=800",
                "description": "Thiết kế giao diện người dùng hiện đại với Figma.",
                "classes": [{"name": "Lớp Design sáng", "max_capacity": 15}]
            },
            {
                "title": "Digital Painting for Beginners",
                "instructor_name": "Alice Green",
                "price": 0, # Free
                "category": "Art",
                "duration": "15h 00m",
                "total_lessons": 40,
                "rating": 4.8,
                "image": "https://images.unsplash.com/photo-1547826039-adc35c73019d?w=800",
                "description": "Bắt đầu vẽ kỹ thuật số từ con số không.",
                "classes": [{"name": "Lớp Mỹ thuật số", "max_capacity": 20}]
            }
        ]

        for c_data in courses_data:
            course, _ = Course.objects.update_or_create(
                title=c_data['title'],
                defaults={
                    'instructor_name': c_data['instructor_name'],
                    'price': c_data['price'],
                    'category': c_data['category'],
                    'duration': c_data['duration'],
                    'total_lessons': c_data['total_lessons'],
                    'rating': c_data['rating'],
                    'description': c_data['description'],
                    'image': c_data['image']
                }
            )

            # Tự động tạo ít nhất 1 Module mặc định
            Module.objects.get_or_create(course=course, title="Nội dung chính")

            # Tạo Lớp học
            for cls_data in c_data.get('classes', []):
                CourseClass.objects.get_or_create(
                    course=course,
                    name=cls_data['name'],
                    defaults={
                        'start_date': timezone.now().date() + datetime.timedelta(days=10),
                        'end_date': timezone.now().date() + datetime.timedelta(days=40),
                        'max_capacity': cls_data['max_capacity']
                    }
                )

        self.stdout.write(self.style.SUCCESS(f'Đã nạp thành công {len(courses_data)} khóa học!'))