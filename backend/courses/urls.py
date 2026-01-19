from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from courses.views import (
    EnrollClassView, 
    CourseClassListView, 
    CourseListView, 
    CourseDetailView, 
    UserProfileView,
    get_popular_courses,
    RegisterView,
    ChangePasswordView,
    MyEnrolledCoursesView,
    PlacementQuizView,
    SubmitQuizView
)

urlpatterns = [
    path('', CourseListView.as_view(), name='course-list'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('popular/', get_popular_courses, name='popular-courses'),
    path('classes/', CourseClassListView.as_view(), name='list-classes'), 
    path('course-classes/', CourseClassListView.as_view(), name='course-class-list'), 
    path('enroll/', EnrollClassView.as_view(), name='enroll-class'),
    path('api/profile/', UserProfileView.as_view(), name='user-profile-api'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('my-courses/', MyEnrolledCoursesView.as_view(), name='my-enrolled-courses'),
    path('placement-quiz/', PlacementQuizView.as_view(), name='placement-quiz'),
    path('submit-quiz/', SubmitQuizView.as_view(), name='submit-quiz'),
]

# Cấu hình media (để hiển thị ảnh)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)