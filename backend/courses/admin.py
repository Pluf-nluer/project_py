from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Course, CourseClass, Enrollment, WaitingList, Module, Lesson, User
from .models import Quiz, Question, Choice, QuizResult, UserLessonProgress
from .models import CourseQuiz, CourseQuizQuestion, CourseQuizChoice, CourseQuizAttempt, CourseQuizAnswer


# --- 0. QUẢN LÝ USER (BẮT BUỘC THÊM) ---
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['email', 'username', 'role', 'is_staff']
    # Thêm các trường mới vào giao diện chỉnh sửa User
    fieldsets = UserAdmin.fieldsets + (
        ("Thông tin Profile", {'fields': ('phone', 'avatar', 'role', 'bio')}),
    )


# --- 1. QUẢN LÝ NỘI DUNG (LESSON & MODULE) ---
class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ('title', 'duration', 'is_preview', 'order')


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    inlines = [LessonInline]
    search_fields = ('title',)


# --- 2. QUẢN LÝ KHÓA HỌC ---
class ModuleInline(admin.TabularInline):  # Đổi Stacked sang Tabular cho gọn
    model = Module
    extra = 0
    show_change_link = True  # Cho phép click nhanh sang trang Module để sửa Lesson


class CourseClassInline(admin.TabularInline):
    model = CourseClass
    extra = 0
    fields = ('name', 'start_date', 'max_capacity')


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'instructor_name', 'category', 'rating')
    list_filter = ('category',)
    search_fields = ('title', 'instructor_name')
    inlines = [ModuleInline, CourseClassInline]


# --- 3. QUẢN LÝ LỚP HỌC ---
@admin.register(CourseClass)
class CourseClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'start_date', 'max_capacity', 'is_full')
    list_filter = ('start_date', 'course')
    list_editable = ('max_capacity',)

    fieldsets = (
        ("Thông tin chung", {'fields': ('course', 'name')}),
        ("Kế hoạch đào tạo", {'fields': (('start_date', 'end_date'), 'schedule')}),
        ("Quản lý quy mô", {'fields': ('max_capacity',)}),
    )


# --- 4. QUẢN LÝ ĐĂNG KÝ & HÀNG CHỜ ---
@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    # Đã đổi student__username thành student__email
    list_display = ('student', 'course_class', 'status', 'enrolled_at', 'final_score')
    list_filter = ('status', 'course_class')
    list_editable = ('status', 'final_score')
    search_fields = ('student__email', 'course_class__name')


@admin.register(WaitingList)
class WaitingListAdmin(admin.ModelAdmin):
    list_display = ('student', 'course_class', 'created_at')
    readonly_fields = ('created_at',)
    search_fields = ('student__email',)

# --- 5. QUẢN LÝ BÀI KIỂM TRA ĐÁNH GIÁ NĂNG LỰC ĐẦU VÀO ---
@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('title', 'description')

# Đăng ký Question (dạng inline để thêm dễ dàng trong Quiz)
class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 4  # Mặc định hiện 4 lựa chọn

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'quiz', 'order')
    list_filter = ('quiz',)
    search_fields = ('text',)
    inlines = [ChoiceInline]

# Nếu muốn quản lý riêng Choice (không cần thiết)
# @admin.register(Choice)
# class ChoiceAdmin(admin.ModelAdmin):
#     list_display = ('text', 'question', 'is_correct')
#     list_filter = ('is_correct',)

@admin.register(QuizResult)
class QuizResultAdmin(admin.ModelAdmin):
    list_display = ('student', 'quiz', 'score', 'recommended_level', 'completed_at')
    list_filter = ('recommended_level', 'quiz')
    readonly_fields = ('completed_at',)
    
# Đăng ký bảng Tiến độ bài học
@admin.register(UserLessonProgress)
class UserLessonProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'is_completed', 'completed_at')
    list_filter = ('is_completed', 'lesson__module__course') # Lọc theo trạng thái và Khóa học
    search_fields = ('student__email', 'lesson__title')

# === QUẢN LÝ BÀI KIỂM TRA KHÓA HỌC ===
class CourseQuizChoiceInline(admin.TabularInline):
    model = CourseQuizChoice
    extra = 4
    fields = ('choice_text', 'is_correct', 'order')


@admin.register(CourseQuizQuestion)
class CourseQuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text_short', 'quiz', 'points', 'order')
    list_filter = ('quiz__course', 'quiz')
    search_fields = ('question_text',)
    list_editable = ('points', 'order')
    inlines = [CourseQuizChoiceInline]
    
    def question_text_short(self, obj):
        return obj.question_text[:60] + "..." if len(obj.question_text) > 60 else obj.question_text
    question_text_short.short_description = "Câu hỏi"


class CourseQuizQuestionInline(admin.TabularInline):
    model = CourseQuizQuestion
    extra = 0
    fields = ('question_text', 'points', 'order')
    show_change_link = True


@admin.register(CourseQuiz)
class CourseQuizAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'course', 'time_limit', 'passing_score', 
        'max_attempts', 'is_active', 'total_questions'
    )
    list_filter = ('is_active', 'course', 'shuffle_questions')
    search_fields = ('title', 'course__title', 'description')
    list_editable = ('is_active',)
    inlines = [CourseQuizQuestionInline]
    
    fieldsets = (
        ('Thông tin chung', {
            'fields': ('course', 'title', 'description', 'is_active')
        }),
        ('Cấu hình thời gian & điểm', {
            'fields': ('time_limit', 'passing_score', 'max_attempts')
        }),
        ('Cấu hình hiển thị', {
            'fields': ('shuffle_questions', 'shuffle_choices', 'show_correct_answers')
        }),
    )
    
    def total_questions(self, obj):
        return obj.get_total_questions()
    total_questions.short_description = "Số câu hỏi"


@admin.register(CourseQuizAttempt)
class CourseQuizAttemptAdmin(admin.ModelAdmin):
    list_display = (
        'student', 'quiz', 'status', 'score', 'total_points',
        'percentage', 'passed', 'started_at', 'time_spent_minutes'
    )
    list_filter = ('status', 'quiz__course', 'quiz', 'started_at')
    search_fields = ('student__email', 'quiz__title')
    readonly_fields = (
        'started_at', 'submitted_at', 'question_order', 
        'choice_orders', 'score', 'total_points'
    )
    
    fieldsets = (
        ('Thông tin', {
            'fields': ('student', 'quiz', 'status')
        }),
        ('Kết quả', {
            'fields': (
                'score', 'total_points', 'correct_answers', 
                'total_questions', 'time_spent'
            )
        }),
        ('Chi tiết', {
            'fields': ('started_at', 'submitted_at', 'question_order', 'choice_orders'),
            'classes': ('collapse',)
        }),
    )
    
    def percentage(self, obj):
        return f"{obj.get_percentage()}%"
    percentage.short_description = "Phần trăm"
    
    def passed(self, obj):
        return "✓ Đạt" if obj.is_passed() else "✗ Không đạt"
    passed.short_description = "Kết quả"
    
    def time_spent_minutes(self, obj):
        return f"{obj.time_spent // 60}:{obj.time_spent % 60:02d}"
    time_spent_minutes.short_description = "Thời gian (phút)"


@admin.register(CourseQuizAnswer)
class CourseQuizAnswerAdmin(admin.ModelAdmin):
    list_display = (
        'attempt_info', 'question_short', 'selected_choice', 
        'is_correct', 'points_earned', 'answered_at'
    )
    list_filter = ('is_correct', 'attempt__quiz__course')
    search_fields = (
        'attempt__student__email', 'question__question_text'
    )
    readonly_fields = ('answered_at',)
    
    def attempt_info(self, obj):
        return f"{obj.attempt.student.email} - {obj.attempt.quiz.title}"
    attempt_info.short_description = "Lần làm bài"
    
    def question_short(self, obj):
        return obj.question.question_text[:50]
    question_short.short_description = "Câu hỏi"