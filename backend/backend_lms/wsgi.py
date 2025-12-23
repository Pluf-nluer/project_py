import os
from django.core.wsgi import get_wsgi_application

# Thiết lập settings module cho Django (đảm bảo tên 'backend_lms.settings' đúng với dự án của bạn)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_lms.settings')

application = get_wsgi_application()