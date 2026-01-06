from django.urls import path
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static      # <-- Import hàm static (Dòng bạn đang thiếu)
from courses.views import EnrollClassView, CourseClassListView, CourseListView, CourseDetailView, UserProfileView
from courses.views import get_popular_courses
# Import view đăng ký từ courses.views
from courses.views import RegisterView

urlpatterns = [
    path('', CourseListView.as_view(), name='course-list'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('classes/', CourseClassListView.as_view(), name='list-classes'), # Xem danh sách
    path('enroll/', EnrollClassView.as_view(), name='enroll-class'),      # Đăng ký
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('popular/', get_popular_courses, name='popular-courses'),
]
# Cấu hình media
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)