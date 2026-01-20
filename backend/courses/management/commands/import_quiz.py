import json
import os
from django.core.management.base import BaseCommand
from courses.models import Quiz, Question, Choice
from django.conf import settings

class Command(BaseCommand):
    help = 'Import câu hỏi từ file JSON vào Database'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Đường dẫn đến file JSON')

    def handle(self, *args, **kwargs):
        json_file = kwargs['json_file']
        
        if not os.path.isabs(json_file):
            json_file = os.path.join(settings.BASE_DIR, json_file)

        if not os.path.exists(json_file):
            self.stdout.write(self.style.ERROR(f'Không tìm thấy file: {json_file}'))
            return

        with open(json_file, 'r', encoding='utf-8') as file:
            data = json.load(file)

        self.stdout.write(f'Đang xử lý {len(data)} bài kiểm tra...')

        for quiz_data in data:
            # 1. Tạo Quiz
            quiz, created = Quiz.objects.get_or_create(
                title=quiz_data['quiz_title'],
                defaults={'description': 'Import chuẩn PCEP', 'is_active': True}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f' + Đã tạo mới Quiz: "{quiz.title}"'))
            else:
                self.stdout.write(f' - Cập nhật Quiz: "{quiz.title}"')
            
            # 2. Duyệt câu hỏi
            for idx, q_data in enumerate(quiz_data['questions']):
                question, q_created = Question.objects.get_or_create(
                    quiz=quiz,
                    text=q_data['text'],
                    defaults={'order': idx + 1}
                )

                # 3. Duyệt đáp án
                for c_data in q_data['choices']:
                    Choice.objects.get_or_create(
                        question=question,
                        text=c_data['text'],
                        defaults={'is_correct': c_data['is_correct']}
                    )

        self.stdout.write(self.style.SUCCESS('--------------------------------------------------'))
        self.stdout.write(self.style.SUCCESS('Dữ liệu câu hỏi chuẩn đã được đưa vào Database.'))