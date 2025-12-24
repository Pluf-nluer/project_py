import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import TruncatedSVD
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error


def train_and_evaluate():
    csv_file = "B:\\Year_3rd\\Lập trình mạng - Thầy Tính\\training_dataset.csv"
    print(f"Đang tải dữ liệu từ: {csv_file}...")

    try:
        df = pd.read_csv(csv_file)
        print(f"Đã load xong {len(df)} dòng dữ liệu lịch sử.")
    except FileNotFoundError:
        print("Lỗi: Không tìm thấy file dataset. Hãy chạy 'create_dataset.py' trước!")
        return

    # --- 2. PRE-PROCESSING (TIỀN XỬ LÝ) ---
    # Chia tập Train (để học) và Test (để thi)
    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)

    # Tạo Ma trận User-Item (Bảng điểm số)
    # Đây là bước chuyển dữ liệu thô thành dạng toán học để máy tính hiểu
    matrix = train_df.pivot(index='user_id', columns='course_id', values='rating').fillna(0)

    print(f"Kích thước ma trận học: {matrix.shape} (User x Item)")

    # --- 3. TRAINING (HUẤN LUYỆN MODEL) ---
    # Máy tính sẽ cố gắng phân rã ma trận để tìm ra các đặc trưng ẩn (Latent Features)
    # n_components=5: Giả sử có 5 yếu tố ẩn ảnh hưởng đến quyết định (tương ứng 5 Category mình đã tạo)
    print("Đang train model SVD (Học các mẫu hành vi)...")
    svd = TruncatedSVD(n_components=5, random_state=42)

    # Đây là lúc máy "HỌC"
    user_factors = svd.fit_transform(matrix)
    item_factors = svd.components_

    print(f"Train xong! Model đã học được {svd.explained_variance_ratio_.sum():.2%} thông tin từ dữ liệu.")

    # --- 4. PREDICT & EVALUATE (DỰ ĐOÁN & CHẤM ĐIỂM) ---
    print("imota Đang kiểm tra độ thông minh của Model trên tập Test...")

    y_true = []
    y_pred = []

    # Tạo từ điển để tra cứu nhanh vị trí index
    user_idx_map = {uid: i for i, uid in enumerate(matrix.index)}
    item_idx_map = {cid: i for i, cid in enumerate(matrix.columns)}

    for _, row in test_df.iterrows():
        user = row['user_id']
        item = row['course_id']
        actual_rating = row['rating']

        # Chỉ dự đoán những user/item model ĐÃ TỪNG GẶP (để tránh lỗi Cold Start)
        if user in user_idx_map and item in item_idx_map:
            u_idx = user_idx_map[user]
            i_idx = item_idx_map[item]

            # CÔNG THỨC DỰ ĐOÁN: Tích vô hướng của Vector User và Vector Item
            predicted_rating = np.dot(user_factors[u_idx], item_factors[:, i_idx])

            # Giới hạn điểm từ 1 đến 5
            predicted_rating = np.clip(predicted_rating, 1, 5)

            y_true.append(actual_rating)
            y_pred.append(predicted_rating)

    # --- 5. REPORT KẾT QUẢ ---
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    print("\n" + "=" * 40)
    print(f"KẾT QUẢ ĐÁNH GIÁ MODEL")
    print(f"RMSE (Sai số trung bình): {rmse:.4f}")
    print("=" * 40)

    if rmse < 1.5:
        print("🎉 Model hoạt động TỐT! Nó đã học được quy luật sở thích của User.")
    else:
        print("⚠️ Model chưa tốt lắm, có thể dữ liệu quá nhiễu hoặc tham số chưa chuẩn.")

    # Vẽ biểu đồ kiểm chứng
    visualize_results(y_true, y_pred)


def visualize_results(y_true, y_pred):
    plt.figure(figsize=(10, 5))
    sns.scatterplot(x=y_true, y=y_pred, alpha=0.3)
    plt.plot([0, 6], [0, 6], 'r--')
    plt.xlabel("Điểm Thực Tế")
    plt.ylabel("Điểm Model Dự Đoán")
    plt.title("Khả năng 'Học' của Model: Dự đoán vs Thực tế")
    plt.show()


if __name__ == "__main__":
    train_and_evaluate()