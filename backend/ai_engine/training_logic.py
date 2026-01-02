import os
import sys
import django
import joblib
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from surprise import SVD, Dataset, Reader
from surprise.model_selection import cross_validate
from sklearn.metrics.pairwise import cosine_similarity


# --- BƯỚC 1: CẤU HÌNH MÔI TRƯỜNG DJANGO ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_lms.settings')
django.setup()

# Import model sau khi setup django
from ai_engine.models import UserInteraction
from courses.models import Course
from django.conf import settings


def train_and_visualize():
    print("--- 1. Đang nạp dữ liệu từ Database ---")
    interactions = UserInteraction.objects.all().values('user_id', 'course_id', 'rating')
    if not interactions.exists():
        print("Lỗi: Không có dữ liệu để huấn luyện!")
        return

    df = pd.DataFrame(list(interactions))
    print(f"Đã nạp {len(df)} bản ghi tương tác.")

    # --- BƯỚC 2: ĐÁNH GIÁ MÔ HÌNH (THẤY QUÁ TRÌNH TRAIN) ---
    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(df[['user_id', 'course_id', 'rating']], reader)

    print("\n--- 2. Đang kiểm tra độ chính xác (Cross-Validation) ---")
    # Thuật toán SVD
    model = SVD(n_factors=50, n_epochs=20, lr_all=0.005)

    # Chạy CV để in ra bảng RMSE, MAE trong terminal
    cv_results = cross_validate(model, data, measures=['RMSE', 'MAE'], cv=5, verbose=True)

    # --- BƯỚC 3: HUẤN LUYỆN CHÍNH THỨC ---
    print("\n--- 3. Đang huấn luyện mô hình chính thức ---")
    trainset = data.build_full_trainset()
    model.fit(trainset)

    # --- BƯỚC 4: VẼ BIỂU ĐỒ TƯƠNG ĐỒNG (CẬP NHẬT TÊN THẬT) ---
    print("\n--- 4. Đang tạo biểu đồ tương đồng giữa các khóa học ---")

    # 1. Xác định số lượng khóa học hiển thị (nên lấy 10-12 để biểu đồ không bị rối)
    num_items = min(12, trainset.n_items)
    item_factors = model.qi[:num_items]  # Lấy các yếu tố ẩn (latent factors)

    # 2. Ánh xạ ID của AI về Tên khóa học trong Database
    course_labels = []
    for i in range(num_items):
        try:
            raw_id = trainset.to_raw_iid(i)  # Chuyển inner ID sang ID thật trong DB
            course = Course.objects.get(id=raw_id)  # Truy vấn thông tin từ DB
            # Lấy 25 ký tự đầu để nhãn gọn gàng
            course_labels.append(course.title[:25] + "...")
        except Exception:
            course_labels.append(f"Course {i}")

    # 3. Tính toán ma trận tương đồng Cosine
    sim_matrix = cosine_similarity(item_factors)

    # 4. Vẽ biểu đồ Heatmap chuyên nghiệp
    plt.figure(figsize=(12, 10))
    sns.heatmap(
        sim_matrix,
        annot=True,
        cmap='YlGnBu',
        fmt=".2f",
        xticklabels=course_labels,  # Gán tên khóa học vào trục X
        yticklabels=course_labels  # Gán tên khóa học vào trục Y
    )

    plt.xticks(rotation=45, ha='right')  # Xoay chữ 45 độ cho dễ đọc
    plt.yticks(rotation=0)
    plt.title("Ma trận tương đồng giữa các khóa học (Dựa trên hành vi người dùng)")
    plt.tight_layout()  # Căn chỉnh tự động để không bị mất nhãn

    # Lưu và hiển thị
    plt.savefig(os.path.join(BASE_DIR, 'ai_engine', 'similarity_chart.png'))
    print(f"Đã cập nhật biểu đồ tại: ai_engine/similarity_chart.png")
    plt.show()

    # --- BƯỚC 5: LƯU MÔ HÌNH .PKL ---
    model_path = os.path.join(BASE_DIR, 'ai_engine', 'nlu_recommendation_model.pkl')
    joblib.dump(model, model_path)
    print(f"\n--- THÀNH CÔNG: Đã lưu mô hình tại {model_path} ---")


if __name__ == "__main__":
    train_and_visualize()