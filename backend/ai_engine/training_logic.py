import os
import sys
import django
import joblib
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from surprise import SVD, Dataset, Reader
from surprise.model_selection import GridSearchCV, cross_validate
from sklearn.metrics.pairwise import cosine_similarity

# --- BƯỚC 1: SETUP (Giữ nguyên) ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_lms.settings')
django.setup()

from ai_engine.models import UserInteraction
from courses.models import Course


def train_and_optimize():
    # --- BƯỚC 2: LỌC DỮ LIỆU NĂNG LỰC (Từ Quiz) ---
    print("--- 1. Đang nạp dữ liệu QUIZ từ Database ---")
    # Chúng ta chỉ lấy type='QUIZ' để model hiểu về năng lực học tập
    interactions = UserInteraction.objects.filter(interaction_type='QUIZ').values('user_id', 'course_id', 'rating')

    if not interactions.exists():
        print("Lỗi: Không có dữ liệu QUIZ. Hãy chạy script tạo dữ liệu giả hoặc đồng bộ trước!")
        return

    df = pd.DataFrame(list(interactions))
    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(df[['user_id', 'course_id', 'rating']], reader)

    # --- BƯỚC 3: GRID SEARCH (Tìm thông số chuẩn nhất) ---
    print("\n--- 2. Đang tìm bộ tham số tối ưu (Grid Search) ---")
    param_grid = {
        'n_factors': [20, 50, 100],
        'n_epochs': [20, 30],
        'lr_all': [0.005, 0.01],
        'reg_all': [0.02, 0.1]
    }
    gs = GridSearchCV(SVD, param_grid, measures=['rmse'], cv=5)
    gs.fit(data)

    best_algo = gs.best_estimator['rmse']
    best_rmse = gs.best_score['rmse']
    print(f"✅ Đã tìm thấy tham số tốt nhất! RMSE: {best_rmse:.4f}")

    # --- BƯỚC 4: HUẤN LUYỆN CHÍNH THỨC ---
    from surprise.model_selection import train_test_split
    print("\n--- 3. Đang huấn luyện mô hình với tham số tối ưu ---")
    trainset, test_data = train_test_split(data, test_size=0.2)
    best_algo.fit(trainset)

    # Chuyển test_data sang DataFrame để dễ in ấn
    test_df = pd.DataFrame(test_data, columns=['user_id', 'course_id', 'rating'])

    # GỌI HÀM BÁO CÁO
    print_detailed_report(best_algo, trainset, test_df)

    # --- BƯỚC 5: VẼ BIỂU ĐỒ TƯƠNG ĐỒNG (Dùng để báo cáo) ---
    print("\n--- 4. Đang tạo biểu đồ tương đồng Heatmap ---")
    num_items = min(12, trainset.n_items)
    item_factors = best_algo.qi[:num_items]

    course_labels = []
    for i in range(num_items):
        try:
            raw_id = trainset.to_raw_iid(i)
            course = Course.objects.get(id=raw_id)
            course_labels.append(course.title[:20] + "...")
        except:
            course_labels.append(f"Course {i}")

    sim_matrix = cosine_similarity(item_factors)
    plt.figure(figsize=(10, 8))
    sns.heatmap(sim_matrix, annot=True, cmap='YlGnBu', xticklabels=course_labels, yticklabels=course_labels)
    plt.title(f"Ma trận tương đồng năng lực (Best RMSE: {best_rmse:.4f})")
    plt.tight_layout()
    plt.savefig(os.path.join(BASE_DIR, 'ai_engine', 'final_similarity_chart.png'))
    plt.show()

    # --- BƯỚC 6: LƯU MODEL KÈM METADATA ---
    model_path = os.path.join(BASE_DIR, 'ai_engine', 'nlu_recommendation_model.pkl')
    # Lưu dưới dạng dictionary để sau này lấy được cả điểm RMSE ra hiển thị
    joblib.dump({
        'model': best_algo,
        'rmse': best_rmse,
        'params': gs.best_params['rmse']
    }, model_path)
    print(f"\n--- THÀNH CÔNG: Đã lưu mô hình tại {model_path} ---")


def print_detailed_report(algo, trainset, test_df):
    print("\n" + "═" * 50)
    print("📊 BÁO CÁO CHI TIẾT ĐỘ CHÍNH XÁC CỦA AI")
    print("═" * 50)

    # 1. Lấy mẫu 5 dự đoán ngẫu nhiên để so sánh
    print(f"{'Sinh viên':<20} | {'Khóa học':<25} | {'Thực tế':<8} | {'Dự đoán':<8}")
    print("-" * 70)

    samples = test_df.sample(min(5, len(test_df)))
    for _, row in samples.iterrows():
        uid = row['user_id']
        iid = row['course_id']
        actual = row['rating']

        # AI dự đoán
        pred = algo.predict(uid, iid).est

        # Lấy tên User/Course để dễ nhìn (nếu cần)
        print(f"User ID: {uid:<11} | Course ID: {iid:<19} | {actual:<8.1f} | {pred:<8.1f}")

    # 2. Tính toán % Phù hợp mẫu cho một User bất kỳ
    test_user_id = test_df['user_id'].iloc[0]
    print(f"\n🎯 VÍ DỤ GỢI Ý CHO USER ID: {test_user_id}")
    print(f"{'Tên khóa học':<35} | {'Mức độ phù hợp (%)'}")
    print("-" * 55)

    # Giả sử lấy 5 khóa học ngẫu nhiên để tính điểm phù hợp
    all_courses = Course.objects.all()[:5]
    for course in all_courses:
        prediction = algo.predict(test_user_id, course.id).est
        # Công thức chuyển đổi sang %
        suitability = max(0, min(100, round(((prediction - 1) / 4) * 100, 1)))
        print(f"{course.title[:30]:<35} | {suitability}%")

    print("═" * 50)

if __name__ == "__main__":
    train_and_optimize()