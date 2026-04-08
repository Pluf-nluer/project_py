import os
import sys

# trỏ path về backend để import Django project
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")  
# core.settings phải đúng theo project của bạn

from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()