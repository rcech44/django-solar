import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
from .models import Offer, User
from django.forms.models import model_to_dict

@require_POST
def login_view(request):
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')

    if username is None or password is None:
        return JsonResponse({'detail': 'Please provide username and password.'}, status=400)

    user = authenticate(username=username, password=password)

    if user is None:
        return JsonResponse({'detail': 'Invalid credentials.'}, status=400)

    login(request, user)
    return JsonResponse({'detail': 'Successfully logged in.'})

def logout_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'You\'re not logged in.'}, status=400)

    logout(request)
    return JsonResponse({'detail': 'Successfully logged out.'})

@ensure_csrf_cookie
def session_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'isAuthenticated': False})

    return JsonResponse({'isAuthenticated': True})

@ensure_csrf_cookie
def company_info(request):
    if not request.user.is_authenticated:
        return JsonResponse({'isAuthenticated': False})

    return JsonResponse({'company_long_name': request.user.company_name})

@ensure_csrf_cookie
def current_user_info_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'isAuthenticated': False})
    
    user_id = request.user.id
    user = User.objects.get(id=user_id)
    user_dict = model_to_dict( user )
    result = {
        'id': user_dict['id'],
        'username': user_dict['username'],
        'first_name': user_dict['first_name'],
        'last_name': user_dict['last_name'],
        'email': user_dict['email'],
        'is_companystaff': user_dict['is_companystaff'],
        'company_short_name': user_dict['company_short_name'],
        'company_name': user_dict['company_name'],
        'company_image': user_dict['company_image']
    }

    return JsonResponse({'user': result})

@ensure_csrf_cookie
@require_POST
def edit_current_user_info_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'isAuthenticated': False})
    
    try:
        user = User.objects.get(id=request.user.id)
        data = json.loads(request.body)
        user.first_name = data.get('first_name')
        user.last_name = data.get('last_name')
        user.email = data.get('email')
        user.company_name = data.get('company_name')
        user.company_image = data.get('company_image')
        user.save()
    except:
        return JsonResponse({'detail': 'Error while updating data'})
    return JsonResponse({'detail': 'Successfully logged in.'}, status=200)

def whoami_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'isAuthenticated': False})

    return JsonResponse({'username': request.user.username})

def compare_view(request):
    all_offers = list(Offer.objects.values())
    return JsonResponse({'data': all_offers})