from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView
from courses.views import RegisterView
from django.conf.urls.static import static 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/courses/', include('courses.urls')),
    path('api/ai/', include('ai_engine.urls')), # Mở ra sau này khi làm AI
    path('api/register/', RegisterView.as_view(), name='auth_register'),
    # API Đăng nhập (Lấy Token)
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/courses/', include('courses.urls')),
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

admin.site.site_header = "QUẢN TRỊ HỆ THỐNG LMS" 
admin.site.site_title = "LMS Admin Portal"
admin.site.index_title = "Bảng điều khiển hệ thống"