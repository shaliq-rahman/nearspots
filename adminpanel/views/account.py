from django.shortcuts import render
from django.views import View
from .. helper import renderfile
from django.contrib.auth import login, authenticate, logout
from urllib.parse import urlparse, parse_qs
from django.urls import resolve
from django.http import JsonResponse
from django.urls import reverse
from django.urls.exceptions import Resolver404
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from adminpanel.models import User
from django.core.paginator import *
from django.template.loader import render_to_string
from adminpanel.helper import is_ajax
from django.db import transaction
from django.shortcuts import get_object_or_404
from adminpanel.constantvariables import PAGINATION_PERPAGE
from django.contrib.auth.hashers import check_password
import pdb


class Login(View):
    def get(self, request, *args, **kwargs):
        data = {}
        return renderfile(request,'account','login',data)
    
    def post(self, request, *args, **kwargs):
        context = {}
        username = request.POST.get('email')
        password = request.POST.get('password')
        current_url = request.POST.get('current_url')
        user = authenticate(username=username, password=password)
        
        if current_url:
            try:
                parsed_url = urlparse(current_url)
                query_params = parse_qs(parsed_url.query)
                next_url = query_params.get('next', [None])[0]
                if next_url:
                    resolve_result = resolve(next_url)
                    redirect_url = next_url
                else:
                    redirect_url = reverse('adminpanel:dashboard')
            except Resolver404:
                redirect_url = reverse('adminpanel:dashboard')  
        if user is not None and user.is_active:
            login(request, user)
            return JsonResponse({'success': True, 'redirect_url': redirect_url})
        else:
            message = 'Incorrect username or password'
            return JsonResponse({'success': False, 'message': message})
        
class Logout(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'
    
    def get(self, request, *args, **kwargs):
        context = {}
        logout(request)
        request.session.flush()
        return redirect(reverse('adminpanel:login'))
    

class Dashboard(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'
    
    def get(self, request, *args, **kwargs):
        data = {}
        data['users'] = User.objects.filter(is_active=True, is_superuser=False).exclude().count()
        return renderfile(request,'dashboard','index',data)
    
    
# USERS
class UsersView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'
    
    
    def get(self, request, *args, **kwargs):
        data, filter_conditions = {}, {}
        
        if is_ajax(request=request):
            keyword = request.GET.get('keyword', None)
            status = request.GET.get('status', None)
            if keyword:
                filter_conditions['name__icontains'] = keyword
            if status and status != 'all':
                status = True if status == 'active' else False
                filter_conditions['is_active'] = status

        users = User.objects.prefetch_related('account_deletion_status').filter(**filter_conditions).exclude(is_superuser=True).order_by('-id')
        try:
            page = int(request.GET.get("page", 1))
        except ValueError:
            page = 1

        paginator = Paginator(users, PAGINATION_PERPAGE)
        try:
            users = paginator.page(page)
        except PageNotAnInteger:
            users = paginator.page(1)  
        except EmptyPage:
            users = paginator.page(paginator.num_pages)

        if is_ajax(request=request):
            context = {}
            context['users']= users
            response = {"success": True,
                        "template": render_to_string("adminpanel/users/users_ajax.html", context, request=request),
                        "pagination": render_to_string("adminpanel/users/users_pagination.html", context=context, request=request),
                        }
            return JsonResponse(response)
        
        data['users'], data['current_page'] = users, page
        return renderfile(request,'users','index',data)
    
    
class UserToggleView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'


    def post(self, request, id, *args, **kwargs):
        response = {}
        id  = request.POST.get('id', None)
        status  = request.POST.get('status', None)
        
        try:
            with transaction.atomic():
                data = {}
                user = get_object_or_404(User, id=id)
                if status == 'unchecked':
                    user.is_active = False
                    message = 'User deactivated successfully'
                else:
                    user.is_active = True
                    message = 'User activated successfully'
                user.save()
                data['success'] = True
                data['message'] = message
                data['redirect_url'] = reverse('adminpanel:users')
        except Exception as error:
            response["success"] = False
            response["message"] = "Something went wrong"
        return JsonResponse(data)


class UsersDeleteView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'

    def post(self, request, id, *args, **kwargs):
        response = {}
        id  = request.POST.get('id', None)
        try:
            with transaction.atomic():
                data = {}
                user = get_object_or_404(User, id=id)
                user.is_deleted = True
                user.save()
                data['success'] = True
                data['message'] = 'User deleted successfully'
                data['redirect_url'] = reverse('adminpanel:users')
        except Exception as error:
            response["status"] = False
            response["message"] = "Something went wrong"
        return JsonResponse(data)
    
    


class Profile(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'
    
    def get(self, request, *args, **kwargs):
        data = {}
        return renderfile(request,'auth','profile',data)
    
    
    def post(self, request, *args, **kwargs):
        context, create_conditions = {}, {}
        current_password = request.POST.get('current_password', None)
        new_password = request.POST.get('new_password', None)
        confirm_new_password = request.POST.get('confirm_new_password', None)

        try:
            with transaction.atomic():
                user = request.user
                # Check if the provided current_password matches the user's old password
                if not check_password(current_password, user.password):
                    message = 'Current password is incorrect.'
                    return JsonResponse({'success': False, 'message': message, 'redirect_url': reverse('adminpanel:profile')})

                # Continue with your password change logic
                if new_password != confirm_new_password:
                    message = 'Passwords do not match.'
                    return JsonResponse({'success': False, 'message': message, 'redirect_url': reverse('adminpanel:profile')})

                # Change the user's password
                user.set_password(new_password)
                user.save()
                logout(request)

                success_message = 'Password changed successfully'
                return JsonResponse({'success': True, 'message': success_message, 'redirect_url': reverse('adminpanel:partner_list')})
        except Exception as dberror:
            error_message = str(dberror)
            print(dberror)
            return JsonResponse({'success': False, 'message': error_message, 'redirect_url': reverse('adminpanel:partner_add')})
