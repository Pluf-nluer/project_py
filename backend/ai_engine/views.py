from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ai_engine.logics import get_recommendations
from rest_framework.permissions import AllowAny


class RecommendationView(APIView):
    # Sử dụng permission_classes của DRF để tự động kiểm tra login
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Gọi hàm logic đã cập nhật ở trên
            recommended_courses = get_recommendations(request.user)

            # Bạn có thể dùng Serializer ở đây, hoặc map thủ công như dưới:
            data = [
                {
                    "id": course.id,
                    "title": course.title,
                    "price": course.price,
                    # Thêm các trường khác để React hiển thị đẹp hơn
                    "category": course.category if hasattr(course, 'category') else "General",
                }
                for course in recommended_courses
            ]

            return Response({
                "status": "success",
                "data": data
            })

        except Exception as e:
            return Response({
                "status": "error",
                "message": "Không thể lấy gợi ý vào lúc này",
                "data": []
            }, status=500)