import pdb
from django.views import View
from django.urls import resolve
from django.urls import reverse
from .. helper import renderfile
from django.db import transaction
from django.shortcuts import render
from django.core.paginator import *
from django.http import JsonResponse
from adminpanel.helper import is_ajax
from django.shortcuts import redirect
from urllib.parse import urlparse, parse_qs
from adminpanel.models import User, Categories
from django.urls.exceptions import Resolver404
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.contrib.auth.hashers import check_password
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import login, authenticate, logout
from adminpanel.constantvariables import PAGINATION_PERPAGE



# ----------------------------- CATEGORIES --------------------------------

class CategoriesView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'
    
    
    def get(self, request, *args, **kwargs):
        data, filter_conditions = {}, {}
        if is_ajax(request=request):
            keyword = request.GET.get('keyword', None)
            status = request.GET.get('status', None)
            if keyword:
                filter_conditions['title__icontains'] = keyword
            if status and status != 'all':
                status = True if status == 'active' else False
                filter_conditions['is_active'] = status

        categories = Categories.objects.filter(**filter_conditions).order_by('-id')
        try:
            page = int(request.GET.get("page", 1))
        except ValueError:
            page = 1

        paginator = Paginator(categories, PAGINATION_PERPAGE)
        try:
            categories = paginator.page(page)
        except PageNotAnInteger:
            categories = paginator.page(1)  
        except EmptyPage:
            categories = paginator.page(paginator.num_pages)

        if is_ajax(request=request):
            context = {}
            context['categories']= categories
            response = {"success": True,
                        "template": render_to_string("adminpanel/categories/categories_ajax.html", context, request=request),
                        "pagination": render_to_string("adminpanel/categories/categories_pagination.html", context=context, request=request),
                        }
            return JsonResponse(response)
        
        data['categories'], data['current_page'] = categories, page
        return renderfile(request,'categories','index',data)
    
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



class CreateCategories(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'
    
    
    def get(self, request, *args, **kwargs):
        data = {}
        return renderfile(request,'categories','form',data)
    
    def post(self, request, *args, **kwargs):
        try:
            # Get only the category name
            title = request.POST.get('title', None)
            
            # Validate required field
            if not title:
                return JsonResponse({
                    'success': False, 
                    'message': 'Category name is required'
                })
            
            # Check if category with same name already exists
            if Categories.objects.filter(title=title).exists():
                return JsonResponse({
                    'success': False, 
                    'message': 'A category with this name already exists'
                })
            
            # Create the category with just the name
            category = Categories.objects.create(
                title=title,
                is_active=True
            )
            
            success_message = f'Category "{title}" created successfully'
            return JsonResponse({
                'success': True, 
                'message': success_message, 
                'redirect_url': reverse('adminpanel:categories')
            })
            
        except Exception as error:
            error_message = f"Error creating category: {str(error)}"
            return JsonResponse({
                'success': False, 
                'message': error_message
            })




class CategoriesToggleView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'


    def post(self, request, id, *args, **kwargs):
        response = {}
        id  = request.POST.get('id', None)
        status  = request.POST.get('status', None)
        
        try:
            with transaction.atomic():
                data = {}
                category = get_object_or_404(Categories, id=id)
                if status == 'unchecked':
                    category.is_active = False
                    message = 'Category deactivated successfully'
                else:
                    category.is_active = True
                    message = 'Category activated successfully'
                category.save()
                data['success'] = True
                data['message'] = message
                data['redirect_url'] = reverse('adminpanel:categories')
        except Exception as error:
            response["success"] = False
            response["message"] = "Something went wrong"
        return JsonResponse(data)


class CategoriesDeleteView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'

    def post(self, request, id, *args, **kwargs):
        response = {}
        id  = request.POST.get('id', None)
        try:
            with transaction.atomic():
                data = {}
                category = get_object_or_404(Categories, id=id)
                category.delete()
                data['success'] = True
                data['message'] = 'category deleted successfully'
                data['redirect_url'] = reverse('adminpanel:categories')
        except Exception as error:
            response["status"] = False
            response["message"] = "Something went wrong"
        return JsonResponse(data)


class CategoriesUpdateView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'

    def get(self, request, id, *args, **kwargs):
        category = get_object_or_404(Categories, id=id)
        context = {'category': category, 'id':id}
        return renderfile(request,'categories','form', context)


    def post(self, request, id, *args, **kwargs):
        try:
            # Get only the category name
            title = request.POST.get('title', None)
            
            # Validate required field
            if not title:
                return JsonResponse({
                    'success': False, 
                    'message': 'Category name is required'
                })
            
            # Check if category with same name already exists (excluding current category)
            if Categories.objects.exclude(id=id).filter(title=title).exists():
                return JsonResponse({
                    'success': False, 
                    'message': 'A category with this name already exists'
                })
            
            # Update the category
            category = Categories.objects.get(id=id)
            category.title = title
            category.save()
            
            success_message = f'Category "{title}" updated successfully'
            return JsonResponse({
                'success': True, 
                'message': success_message, 
                'redirect_url': reverse('adminpanel:categories')
            })
            
        except Categories.DoesNotExist:
            return JsonResponse({
                'success': False, 
                'message': 'Category not found'
            })
        except Exception as error:
            error_message = f"Error updating category: {str(error)}"
            return JsonResponse({
                'success': False, 
                'message': error_message
            })