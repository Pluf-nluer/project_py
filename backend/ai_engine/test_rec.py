# ai_engine/test_rec.py
import joblib
import os
from django.conf import settings


# Khởi tạo Django tương tự như file training_logic.py ...

def test_user_recommendation(user_id):
    model_path = os.path.join(settings.BASE_DIR, 'ai_engine', 'nlu_recommendation_model.pkl')
    model = joblib.load(model_path)

    # Giả sử bạn muốn dự đoán cho khóa học ID từ 1 đến 10
    for course_id in range(1, 11):
        prediction = model.predict(user_id, course_id)
        print(f"User {user_id} - Khóa {course_id}: Điểm dự đoán {prediction.est:.2f}")