from django.urls import path
from ai_engine.views import RecommendationView

urlpatterns = [
    # Đường dẫn API sẽ là: /api/ai/recommend/
    path('recommendations/', RecommendationView.as_view(), name='get_recommendations'),
]