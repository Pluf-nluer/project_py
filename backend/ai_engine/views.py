from rest_framework.views import APIView
from rest_framework.response import Response
from ai_engine.logics import get_recommendations
from ai_engine.models import UserInteraction  # Import để tránh lỗi nếu logic cần


class RecommendationView(APIView):
    def get(self, request):
        # Kiểm tra user đã đăng nhập chưa
        if not request.user.is_authenticated:
            return Response({"error": "Vui lòng đăng nhập để nhận gợi ý"}, status=401)

        # Gọi hàm logic lấy gợi ý (Hàm này ở file logic.py bạn đã tạo trước đó)
        # Lưu ý: Cần đảm bảo file logic.py đã có hàm get_recommendations
        try:
            # Truyền user profile vào (tạm thời truyền user object)
            # Bạn cần đảm bảo logic.py xử lý đúng tham số này
            recommended_courses = get_recommendations(request.user)

            # Trả về kết quả JSON
            data = [
                {
                    "id": c.id,
                    "title": c.title,
                    "price": c.price
                }
                for c in recommended_courses
            ]
            return Response(data)
        except Exception as e:
            # Nếu lỗi thì trả về danh sách rỗng để không crash app
            print(f"Lỗi AI: {str(e)}")
            return Response([])