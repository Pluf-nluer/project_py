from django.contrib import admin
from courses.models import Course, CourseClass, Enrollment, WaitingList, Module, Lesson

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ('title', 'duration', 'is_preview', 'order') 

class ModuleInline(admin.StackedInline):
    model = Module
    extra = 1
    show_change_link = True

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    inlines = [LessonInline]

# 1. Quản lý Khóa học
class CourseClassInline(admin.TabularInline):
    model = CourseClass
    extra = 1
    fields = ('name', 'start_date', 'max_capacity') # Chỉ hiện các field cần thiết để gọn giao diện

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'instructor_name', 'category')
    search_fields = ('title',) # Thêm thanh tìm kiếm theo tên khóa học
    inlines = [ModuleInline, CourseClassInline]

# 2. Quản lý Lớp học (Layout chuyên sâu)
@admin.register(CourseClass)
class CourseClassAdmin(admin.ModelAdmin):
    # Cột hiển thị ở danh sách ngoài
    list_display = ('name', 'course', 'start_date', 'max_capacity', 'is_full')
    list_filter = ('start_date', 'course')
    list_editable = ('max_capacity',) # Cho phép đổi nhanh sĩ số mà không cần click vào trong
    
    # Bố cục bên trong trang chỉnh sửa (Layout)
    fieldsets = (
        ("Thông tin chung", {
            'fields': ('course', 'name')
        }),
        ("Kế hoạch đào tạo", {
            'fields': (('start_date', 'end_date'), 'schedule'), 
            'description': "Thiết lập thời gian bắt đầu, kết thúc và lịch học cụ thể."
        }),
        ("Quản lý quy mô", {
            'fields': ('max_capacity',),
            'classes': ('wide',),
        }),
    )

# 3. Quản lý Đăng ký
@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course_class', 'status', 'enrolled_at', 'final_score')
    list_filter = ('status', 'course_class')
    list_editable = ('status', 'final_score') # Rất hữu ích khi nhập điểm cho sinh viên
    search_fields = ('student__username', 'course_class__name')

# 4. Quản lý Danh sách chờ
@admin.register(WaitingList)
class WaitingListAdmin(admin.ModelAdmin):
    list_display = ('student', 'course_class', 'created_at')
    readonly_fields = ('created_at',) # Ngày tạo không được sửa