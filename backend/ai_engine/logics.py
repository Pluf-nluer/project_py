import joblib
import os
from django.conf import settings
from courses.models import Course
from ai_engine.models import UserInteraction
from django.db.models import Count

MODEL_PATH = os.path.join(settings.BASE_DIR, 'ai_engine', 'nlu_recommendation_model.pkl')

def get_recommendations(user, num_rec=8):
    try:
        # 1. Xử lý Cold Start cho người dùng mới
        user_interactions_count = UserInteraction.objects.filter(user=user).count()
        if user_interactions_count < 3:
            return Course.objects.annotate(num_users=Count('interactions')).order_by('-num_users')[:num_rec]

        # 2. Kiểm tra và nạp mô hình
        if not os.path.exists(MODEL_PATH):
            return Course.objects.all()[:num_rec]

        model = joblib.load(MODEL_PATH)

        # 3. Lọc các khóa học người dùng chưa học
        enrolled_ids = UserInteraction.objects.filter(user=user).values_list('course_id', flat=True)
        available_courses = Course.objects.exclude(id__in=enrolled_ids)

        # 4. Dự đoán điểm số cho từng khóa học
        preds = []
        for course in available_courses:
            # uid và iid phải khớp với kiểu dữ liệu lúc train (thường là int)
            prediction = model.predict(user.id, course.id)
            preds.append((course, prediction.est))

        # 5. Lấy Top 5
        preds.sort(key=lambda x: x[1], reverse=True)
        return [p[0] for p in preds[:num_rec]]

    except Exception as e:
        print(f"Lỗi AI: {e}")
        return Course.objects.all()[:num_rec]