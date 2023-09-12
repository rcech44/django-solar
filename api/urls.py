from django.urls import path

from . import views

urlpatterns = [
    path('login/', views.login_view, name='api-login'),
    path('logout/', views.logout_view, name='api-logout'),
    path('session/', views.session_view, name='api-session'),
    path('getCompanyInfo/', views.company_info, name='api-company-info'),
    path('whoami/', views.whoami_view, name='api-whoami'),
]