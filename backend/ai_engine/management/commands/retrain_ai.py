
from django.core.management.base import BaseCommand
from ai_engine.training_logic import train_and_visualize # Gọi hàm chuẩn bạn đã viết

class Command(BaseCommand):
    help = 'Huấn luyện lại mô hình AI SVD dựa trên dữ liệu mới nhất'

    def handle(self, *args, **options):
        self.stdout.write("--- Bắt đầu tiến trình tự động huấn luyện ---")
        success = train_and_visualize()
        if success:
            self.stdout.write(self.style.SUCCESS("--- Cập nhật mô hình .pkl thành công! ---"))
        else:
            self.stdout.write(self.style.ERROR("--- Huấn luyện thất bại ---"))