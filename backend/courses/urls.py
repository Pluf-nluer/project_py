from django.urls import path
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static

from courses import views
from courses.views import EnrollClassView, CourseClassListView, CourseListView, CourseDetailView, SubmitCourseQuizView, UserProfileView
from courses.views import get_popular_courses
from courses.views import ChangePasswordView, RegisterView
from courses.views import MyEnrolledCoursesView
from courses.views import PlacementQuizView, admin_dashboard_stats
from rest_framework_simplejwt.views import TokenRefreshView
# Import view đăng ký từ courses.views
from courses.views import RegisterView
from courses.views import CourseQuizListView, StartQuizView, SubmitAnswerView, QuizResultView, MyQuizAttemptsView, CheckTimeView, SubmitPlacementQuizView
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
    
    # ===== BÀI KIỂM TRA ĐÁNH GIÁ ĐẦU VÀO (PLACEMENT) =====
    path('placement-quiz/', PlacementQuizView.as_view(), name='placement-quiz'),
    path('placement-quiz/submit/', SubmitPlacementQuizView.as_view(), name='submit-placement-quiz'),
    path('check-survey/', views.check_survey_status, name='check-survey'),


    path('course-classes/', CourseClassListView.as_view(), name='course-class-list'),
    path('admin/stats/', admin_dashboard_stats, name='admin-stats'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('save-interests/', views.save_user_interests, name='save_interests'),
        # Danh sách bài kiểm tra của một khóa học
    path(
        'courses/<int:course_id>/quizzes/', 
        CourseQuizListView.as_view(), 
        name='course-quiz-list'
    ),
    
    # Bắt đầu làm bài kiểm tra
    path(
        'quizzes/<int:quiz_id>/start/', 
        StartQuizView.as_view(), 
        name='start-quiz'
    ),
    
    # Lưu câu trả lời (submit từng câu)
    path(
        'quiz-attempts/<int:attempt_id>/answer/', 
        SubmitAnswerView.as_view(), 
        name='submit-answer'
    ),
    
    # Nộp toàn bộ bài kiểm tra
    path(
        'quiz-attempts/<int:attempt_id>/submit/', 
        SubmitCourseQuizView.as_view(), 
        name='submit-quiz'
    ),
    
    # Xem kết quả bài kiểm tra
    path(
        'quiz-attempts/<int:pk>/result/', 
        QuizResultView.as_view(), 
        name='quiz-result'
    ),
    
    # Lịch sử làm bài của một quiz
    path(
        'quizzes/<int:quiz_id>/my-attempts/', 
        MyQuizAttemptsView.as_view(), 
        name='my-quiz-attempts'
    ),
    
    # Kiểm tra thời gian còn lại
    path(
        'quiz-attempts/<int:attempt_id>/check-time/', 
        CheckTimeView.as_view(), 
        name='check-time'
    ),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)