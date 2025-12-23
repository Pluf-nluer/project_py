import pandas as pd
import pickle
from sklearn.decomposition import TruncatedSVD

from ai_engine.models import UserInteraction


def train_recommendation_model():
    # 1. Lấy dữ liệu từ Database
    # Lấy các cột: User, Course và Rating
    interactions = UserInteraction.objects.all().values('user_id', 'course_id', 'rating')

    # Nếu chưa có dữ liệu thì dừng lại
    if not interactions:
        print("Chưa có dữ liệu tương tác để train!")
        return False

    df = pd.DataFrame(list(interactions))

    # 2. Tạo Ma trận User-Course (Pivot Table)
    # Hàng là User, Cột là Course, Giá trị là Rating
    # Fillna(0) nghĩa là chưa học thì điểm = 0
    pivot_table = df.pivot_table(index='user_id', columns='course_id', values='rating').fillna(0)

    # 3. Train Model bằng thuật toán Ma trận (SVD)
    # Nén dữ liệu lại để tìm quy luật ẩn
    SVD = TruncatedSVD(n_components=10, random_state=42)
    SVD.fit(pivot_table)

    # 4. Lưu Model và danh sách cột (Course ID) lại để dùng sau
    # Ta cần lưu cả columns để biết cột nào ứng với khóa học nào
    model_data = {
        'model': SVD,
        'course_ids': pivot_table.columns.tolist(),
        'pivot_matrix': pivot_table  # Lưu tạm ma trận gốc để tra cứu
    }

    with open('rec_model.pkl', 'wb') as f:
        pickle.dump(model_data, f)
    return True