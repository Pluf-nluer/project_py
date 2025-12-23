from pathlib import Path
import os

# Đường dẫn gốc dự án
BASE_DIR = Path(__file__).resolve().parent.parent

# --- DÒNG BẠN ĐANG THIẾU ---
SECRET_KEY = 'django-insecure-my-secret-key-for-dev-environment-only'

# Chế độ Dev (True)
DEBUG = True

ALLOWED_HOSTS = ['*']

# Định nghĩa các App
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'core',
    'courses',
    'ai_engine',
    "corsheaders",  
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# File chứa URL chính (bạn vừa sửa lúc nãy)
ROOT_URLCONF = 'backend_lms.urls'

# Cấu hình giao diện (bạn vừa thêm lúc nãy)
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend_lms.wsgi.application'

# Database (bạn vừa sửa lúc nãy)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Các validator mật khẩu (để mặc định cũng được)
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

AUTH_USER_MODEL = 'courses.User'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# File tĩnh (bạn vừa thêm lúc nãy)
STATIC_URL = 'static/'

# Khóa chính mặc định (bạn vừa thêm lúc nãy)
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173"
]
LANGUAGE_CODE = 'vi'