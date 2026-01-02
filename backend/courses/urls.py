from django.urls import path
from django.urls import path,include
from courses.views import EnrollClassView, CourseClassListView, CourseListView, CourseDetailView, UserProfileView

urlpatterns = [
    path('', CourseListView.as_view(), name='course-list'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('classes/', CourseClassListView.as_view(), name='list-classes'), # Xem danh sách
    path('enroll/', EnrollClassView.as_view(), name='enroll-class'),      # Đăng ký
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]