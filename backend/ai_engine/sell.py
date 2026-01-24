import random
from django.contrib.auth import get_user_model
from courses.models import UserInterest

User = get_user_model()

# Danh sách các tag phổ biến để lấy ngẫu nhiên
all_tags = [
    'python', 'django', 'react', 'javascript', 'node.js',
    'ai', 'machine learning', 'data science', 'html', 'css',
    'sql', 'git', 'java', 'frontend', 'backend', 'fullstack',
    'web design', 'algorithms', 'c++', 'mobile dev'
]


def generate_test_data(n=30):
    print(f"--- Bắt đầu tạo {n} users mẫu ---")

    for i in range(n):
        email = f'tester_{i + 1}@gmail.com'
        username = f'tester_{i + 1}'

        # 1. Tạo User
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username,
                'role': 'student',
                'bio': f'Tôi là người dùng test số {i + 1}'
            }
        )

        if created:
            user.set_password('password123')
            user.save()
            print(f"  + Đã tạo User: {email}")

        # 2. Chọn ngẫu nhiên từ 3-6 sở thích
        random_tags = random.sample(all_tags, k=random.randint(3, 6))

        # 3. Tạo hoặc cập nhật UserInterest
        UserInterest.objects.update_or_create(
            user=user,
            defaults={
                'tags': random_tags,
                'is_surveyed': True
            }
        )

    print(f"--- Hoàn thành! Đã tạo/cập nhật {n} bản ghi sở thích. ---")


# Gọi hàm thực thi
generate_test_data(30)