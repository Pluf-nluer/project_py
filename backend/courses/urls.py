from django.urls import path
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
from courses.views import EnrollClassView, CourseClassListView, CourseListView, CourseDetailView, UserProfileView
from courses.views import get_popular_courses
from courses.views import ChangePasswordView, RegisterView
from courses.views import MyEnrolledCoursesView
from courses.views import PlacementQuizView, SubmitQuizView, admin_dashboard_stats
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
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('my-courses/', MyEnrolledCoursesView.as_view(), name='my-enrolled-courses'),
    path('placement-quiz/', PlacementQuizView.as_view(), name='placement-quiz'),
    path('submit-quiz/', SubmitQuizView.as_view(), name='submit-quiz'),
    path('course-classes/', CourseClassListView.as_view(), name='course-class-list'),
    path('admin/stats/', admin_dashboard_stats, name='admin-stats'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)