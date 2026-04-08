from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from ai_engine.logics import get_recommendations

class RecommendationView(APIView):
    # Sử dụng IsAuthenticated để đảm bảo có request.user cho gợi ý cá nhân hóa
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # 1. Gọi logic lấy gợi ý (Trả về list các dict: {'course': obj, 'suitability': score})
            recommended_data = get_recommendations(request.user)

            # 2. Ánh xạ dữ liệu để trả về JSON cho React
            data = [
                {
                    "id": item['course'].id,
                    "title": item['course'].title,
                    "price": str(item['course'].price),
                    "image": request.build_absolute_uri(item['course'].image.url) if item['course'].image else None,
                    "category": item['course'].category or "Chưa phân loại",
                    "level": item['course'].level or "Mọi trình độ",
                    # Thêm chỉ số quan trọng nhất: Mức độ phù hợp (%)
                    "suitability": item['suitability'],
                }
                for item in recommended_data
            ]

            return Response({
                "status": "success",
                "count": len(data),
                "data": data
            })

        except Exception as e:
            print(f"Lỗi API Gợi ý: {e}")
            return Response({
                "status": "error",
                "message": "Không thể lấy gợi ý vào lúc này",
                "data": []
            }, status=500)