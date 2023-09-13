from django.contrib import admin
from django.shortcuts import render
from django.urls import path, include

def manager(request):
    return render(request, 'dist/index.html')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('manager/', manager, name='manager'),
    path('', include('frontend.urls')),
]
