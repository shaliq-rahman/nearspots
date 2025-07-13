import pdb
import re
from django.views import View
from django.urls import resolve
from django.urls import reverse
from .. helper import renderfile
from django.db import transaction
from django.core.paginator import *
from django.db.models import Prefetch
from django.shortcuts import render
from django.shortcuts import redirect
from adminpanel.helper import is_ajax
from django.http import JsonResponse
from urllib.parse import urlparse, parse_qs
from django.shortcuts import get_object_or_404
from django.urls.exceptions import Resolver404
from django.template.loader import render_to_string
from django.contrib.auth.mixins import LoginRequiredMixin
from adminpanel.constantvariables import PAGINATION_PERPAGE
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth import login, authenticate, logout
from adminpanel.models import User, Categories, Spots, SpotImages
from ..utils import add_distance_to_spots_from_request
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import IntegrityError


class HomeView(View):
    def get(self, request, *args, **kwargs):
        data = {}
        data['categories'] = Categories.objects.filter(is_active=True)
        
        # Get food spots and add distance
        food_spots_queryset = Spots.objects.prefetch_related(
            Prefetch('spot_images', queryset=SpotImages.objects.filter(is_cover=True))
        ).filter(is_active=True, category_id=data['categories'][0].id)
        data['food_spots'] = add_distance_to_spots_from_request(food_spots_queryset, request)
        
        # Get attraction spots and add distance
        attraction_spots_queryset = Spots.objects.prefetch_related(
            Prefetch('spot_images', queryset=SpotImages.objects.filter(is_cover=True))
        ).filter(is_active=True, category_id=data['categories'][1].id)
        data['attraction_spots'] = add_distance_to_spots_from_request(attraction_spots_queryset, request)
        
        # Latest attraction sites (limited to 4) with distance
        latest_attractions_queryset = Spots.objects.prefetch_related(
            'spot_images'
        ).filter(is_active=True, category_id=data['categories'][1].id).order_by('-created_at')[:4]
        data['latest_attractions'] = add_distance_to_spots_from_request(latest_attractions_queryset, request)
        
        # Top rated spots (limited to 4) with distance
        top_rated_spots_queryset = Spots.objects.prefetch_related(
            'spot_images'
        ).filter(is_active=True, top_rated=True).order_by('-created_at')[:4]
        data['top_rated_spots'] = add_distance_to_spots_from_request(top_rated_spots_queryset, request)
        
        return renderfile(request,'home','index',data)
    
class SearchView(View):
    def get(self, request, *args, **kwargs):
        data = {}
        return renderfile(request,'search','index',data)
    
    
class SpotDetailView(View):
    def get(self, request, *args, **kwargs):
        data = {}
        return renderfile(request,'spots','detail',data)
    
class AddSpotView(View):
    def get(self, request, *args, **kwargs):
        data = {}
        return renderfile(request,'spots','add-spot',data)

class ProfileView(View):
    def get(self, request, *args, **kwargs):
        data = {}
        return renderfile(request,'profile','index',data)
    
    
    
class LoginView(View):
    def get(self, request, *args, **kwargs):
        data = {}
        return renderfile(request, 'auth', 'login', data)
        
    def post(self, request, *args, **kwargs):
        try:
            email = request.POST.get('email', '').strip()
            password = request.POST.get('password', '').strip()
            
            errors = {}
            
            # Validate required fields
            if not email:
                errors['email'] = 'Email is required'
            else:
                try:
                    validate_email(email)
                except ValidationError:
                    errors['email'] = 'Please enter a valid email address'
            
            if not password:
                errors['password'] = 'Password is required'
            
            # If there are validation errors, return them
            if errors:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Please correct the errors below',
                    'errors': errors
                }, status=400)
            
            # Try to authenticate user
            user = authenticate(request, username=email, password=password)
            
            if user is None:
                # Try with email as username
                try:
                    user_obj = User.objects.get(email=email)
                    user = authenticate(request, username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            if user is not None and user.is_active:
                login(request, user)
                return JsonResponse({
                    'status': 'success',
                    'message': 'Login successful! Welcome back.',
                    'redirect_url': reverse('portal:home')
                })
            else:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid email or password. Please try again.',
                    'error_type': 'invalid_credentials'
                }, status=400)
                
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': 'An unexpected error occurred. Please try again.',
                'error_type': 'server_error'
            }, status=500)

class LogoutView(View):
    def get(self, request, *args, **kwargs):
        logout(request)
        return redirect('portal:home')
    

class RegisterView(View):
    def post(self, request, *args, **kwargs):
        try:
            # Get form data
            first_name = request.POST.get('first_name', '').strip()
            last_name = request.POST.get('last_name', '').strip()
            email = request.POST.get('email', '').strip()
            mobile = request.POST.get('mobile', '').strip()
            password = request.POST.get('password', '').strip()
            terms_and_conditions = request.POST.get('terms_and_conditions')
            
            # Validation errors list
            errors = {}
            
            # Validate required fields
            if not first_name:
                errors['first_name'] = 'First name is required'
            elif len(first_name) < 2:
                errors['first_name'] = 'First name must be at least 2 characters long'
                
            if not last_name:
                errors['last_name'] = 'Last name is required'
            elif len(last_name) < 2:
                errors['last_name'] = 'Last name must be at least 2 characters long'
            
            # Validate email
            if not email:
                errors['email'] = 'Email is required'
            else:
                try:
                    validate_email(email)
                except ValidationError:
                    errors['email'] = 'Please enter a valid email address'
            
            # Validate mobile number (10 digits)
            if not mobile:
                errors['mobile'] = 'Mobile number is required'
            else:
                # Remove any non-digit characters
                mobile_clean = re.sub(r'\D', '', mobile)
                if len(mobile_clean) != 10:
                    errors['mobile'] = 'Mobile number must be exactly 10 digits'
                elif not mobile_clean.isdigit():
                    errors['mobile'] = 'Mobile number must contain only digits'
                else:
                    mobile = mobile_clean  # Use cleaned mobile number
            
            # Validate password
            if not password:
                errors['password'] = 'Password is required'
            elif len(password) < 8:
                errors['password'] = 'Password must be at least 8 characters long'
            
            # Validate terms and conditions
            if not terms_and_conditions:
                errors['terms_and_conditions'] = 'You must accept the terms and conditions'
            
            # If there are validation errors, return them
            if errors:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Please correct the errors below',
                    'errors': errors
                }, status=400)
            
            # Check if user already exists with email or mobile
            existing_user = None
            if User.objects.filter(email=email).exists():
                existing_user = User.objects.get(email=email)
                return JsonResponse({
                    'status': 'error',
                    'message': 'User with this email already exists. Please login instead.',
                    'error_type': 'user_exists'
                }, status=400)
            
            if User.objects.filter(mobile=mobile).exists():
                existing_user = User.objects.get(mobile=mobile)
                return JsonResponse({
                    'status': 'error',
                    'message': 'User with this mobile number already exists. Please login instead.',
                    'error_type': 'user_exists'
                }, status=400)
            
            # Create user with transaction to ensure data consistency
            with transaction.atomic():
                # Generate username from email
                username = email.split('@')[0]
                # Ensure username is unique
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                # Create the user
                user = User.objects.create(
                    username=username,
                    email=email,
                    mobile=mobile,
                    first_name=first_name,
                    last_name=last_name,
                    name=f"{first_name} {last_name}",
                    user_type=2,  # User type
                    status=1,     # Active status
                    is_active=True
                )
                
                # Set password
                user.set_password(password)
                user.save()
                
                # Log the user in
                login(request, user)
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Registration successful! Welcome to NearSpots.',
                    'redirect_url': reverse('portal:home')
                })
                
        except IntegrityError as e:
            return JsonResponse({
                'status': 'error',
                'message': 'An error occurred during registration. Please try again.',
                'error_type': 'database_error'
            }, status=500)
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': 'An unexpected error occurred. Please try again.',
                'error_type': 'server_error'
            }, status=500)
        
        
        