from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Course, CourseClass, Enrollment, WaitingList, Module, Lesson, User


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