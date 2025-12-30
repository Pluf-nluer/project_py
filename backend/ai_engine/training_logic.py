import os
import sys
import joblib
import pandas as pd
from surprise import SVD, Dataset, Reader

# --- BƯỚC 1: CẤU HÌNH MÔI TRƯỜNG TRƯỚC ---
# Thêm đường dẫn gốc (backend) vào hệ thống
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

# Thiết lập file settings của dự án (Đảm bảo 'backend_lms' đúng là tên thư mục chứa settings.py)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_lms.settings')

# Khởi tạo Django
import django
django.setup()

# --- BƯỚC 2: IMPORT MODEL SAU KHI DJANGO ĐÃ SẴN SÀNG ---
from ai_engine.models import UserInteraction
from django.conf import settings

def train_recommendation_model():
    # 1. Lấy dữ liệu từ Database
    interactions = UserInteraction.objects.all().values('user_id', 'course_id', 'rating')
    if not interactions:
        print("Chưa có dữ liệu để train!")
        return False

    df = pd.DataFrame(list(interactions))

    # 2. Định nghĩa Reader và Load Dataset
    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(df[['user_id', 'course_id', 'rating']], reader)
    trainset = data.build_full_trainset()

    # 3. Train Model bằng thuật toán SVD của Surprise
    model = SVD(n_factors=50, n_epochs=20)
    model.fit(trainset)

    # 4. Lưu Model vào đúng đường dẫn mà logics.py sẽ đọc
    # Đảm bảo tên file thống nhất: nlu_recommendation_model.pkl
    model_path = os.path.join(settings.BASE_DIR, 'ai_engine', 'nlu_recommendation_model.pkl')
    joblib.dump(model, model_path)

    print(f"Đã huấn luyện và lưu model tại {model_path}")
    return True


if __name__ == "__main__":
    # Thiết lập môi trường Django nếu chạy độc lập
    import django

    os.environ.setdefault('DJANGO_SETTINGS_MODULE',
                          'backend_lms.settings')  # Đổi 'backend_lms' thành tên folder dự án của bạn
    django.setup()

    # Chạy hàm huấn luyện
    success = train_recommendation_model()
    if success:
        print("Model SVD đã sẵn sàng phục vụ!")