import joblib
import os
from django.conf import settings
from courses.models import Course
from ai_engine.models import UserInteraction
from django.db.models import Count

# Đường dẫn chuẩn đến file pkl đã lưu
MODEL_PATH = os.path.join(settings.BASE_DIR, 'ai_engine', 'nlu_recommendation_model.pkl')


def get_recommendations(user, num_rec=8):
    try:
        # 1. Nạp model và dữ liệu sở thích
        loaded_data = joblib.load(MODEL_PATH)
        model = loaded_data['model']

        # Lấy danh sách tag sở thích của user
        user_interest = getattr(user, 'interest', None)
        user_tags = user_interest.tags if user_interest else []

        # 2. Lọc bỏ các khóa học đã tương tác
        interacted_ids = UserInteraction.objects.filter(user=user).values_list('course_id', flat=True)
        available_courses = Course.objects.exclude(id__in=interacted_ids)

        recommendations = []
        for course in available_courses:
            # A. Điểm từ AI (SVD - Năng lực)
            prediction = model.predict(user.id, course.id).est

            # B. Điểm thưởng từ Sở thích (Tags - Content-based)
            tag_bonus = 0
            course_category = str(course.category or "").lower()
            for tag in user_tags:
                if tag.lower() in course_category or tag.lower() in course.title.lower():
                    tag_bonus += 0.5  # Cộng thêm điểm nếu trùng tag sở thích

            # C. Tính tổng điểm và quy đổi sang %
            # Chúng ta giới hạn điểm tối đa là 5.0
            final_rating = min(5.0, prediction + tag_bonus)
            suitability_score = round(((final_rating - 1) / 4) * 100, 1)

            recommendations.append({
                'course': course,
                'suitability': suitability_score
            })

        # 3. Sắp xếp và trả về
        recommendations.sort(key=lambda x: x['suitability'], reverse=True)
        return recommendations[:num_rec]

    except Exception as e:
        print(f"Lỗi Hybrid AI: {e}")
        return [{'course': c, 'suitability': 0} for c in Course.objects.all()[:num_rec]]