import pdb
import re
from django.views import View
from django.urls import resolve
from django.urls import reverse
from .. helper import renderfile
from django.db import transaction
from django.core.paginator import *
from django.db.models import Prefetch, Q
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
from ..utils import add_distance_to_spots_from_request, retry_database_operation
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import IntegrityError


class HomeView(View):
    def get(self, request, *args, **kwargs):
        lat = request.GET.get('lat')
        lon = request.GET.get('lon')
        data = {}
        data['lat'] = lat
        data['lon'] = lon
        data['categories'] = Categories.objects.filter(is_active=True)
        
        # Get food spots and add distance
        food_spots_queryset = Spots.objects.prefetch_related(
            Prefetch('spot_images', queryset=SpotImages.objects.filter(is_cover=True))
        ).filter(is_active=True,  category_id=data['categories'][0].id, is_approved=True)
        data['food_spots'] = add_distance_to_spots_from_request(food_spots_queryset, request)
        
        # Get attraction spots and add distance
        attraction_spots_queryset = Spots.objects.prefetch_related(
            Prefetch('spot_images', queryset=SpotImages.objects.filter(is_cover=True))
        ).filter(is_active=True, category_id=data['categories'][1].id, is_approved=True)
        data['attraction_spots'] = add_distance_to_spots_from_request(attraction_spots_queryset, request)
        
        # Latest attraction sites (limited to 4) with distance
        latest_attractions_queryset = Spots.objects.prefetch_related(
            'spot_images'
        ).filter(is_active=True, category_id=data['categories'][1].id, is_approved=True).order_by('-created_at')[:4]
        data['latest_attractions'] = add_distance_to_spots_from_request(latest_attractions_queryset, request)
        
        # Top rated spots (limited to 4) with distance
        top_rated_spots_queryset = Spots.objects.prefetch_related(
            'spot_images'
        ).filter(is_active=True, top_rated=True, is_approved=True).order_by('-created_at')[:4]
        data['top_rated_spots'] = add_distance_to_spots_from_request(top_rated_spots_queryset, request)
        
        return renderfile(request,'home','index',data)
    
class SearchView(View):
    def get(self, request, *args, **kwargs):
        data = {}
        
        # Get search parameters
        search_text = request.GET.get('q', '').strip()
        distance = request.GET.get('distance', '5').strip()
        lat = request.GET.get('lat')
        lon = request.GET.get('lon')
        
        # Get all active and approved spots
        spots_queryset = Spots.objects.prefetch_related(
            Prefetch('spot_images', queryset=SpotImages.objects.filter(is_cover=True))
        ).filter(is_active=True, is_approved=True)
        
        # Apply text search if provided
        if search_text:
            spots_queryset = spots_queryset.filter(
                Q(name__icontains=search_text) |
                Q(description__icontains=search_text) |
                Q(address__icontains=search_text) |
                Q(city__icontains=search_text) |
                Q(landmark__icontains=search_text)
            )
        
        # Add distance calculation if coordinates are provided
        if lat and lon:
            spots_queryset = add_distance_to_spots_from_request(spots_queryset, request)
            
            # Filter by distance if specified and not "Anywhere"
            if distance and distance != '0':
                try:
                    max_distance = float(distance)
                    # Filter spots within the specified distance
                    spots_queryset = [spot for spot in spots_queryset if spot.distance and spot.distance <= max_distance]
                except ValueError:
                    pass
            
            # Order by distance
            spots_queryset = sorted(spots_queryset, key=lambda x: x.distance if x.distance else float('inf'))
        else:
            # Order by creation date if no coordinates
            spots_queryset = spots_queryset.order_by('-created_at')
        
        data['spots'] = spots_queryset
        data['search_text'] = search_text
        data['distance'] = distance
        data['lat'] = lat
        data['lon'] = lon
        data['categories'] = Categories.objects.filter(is_active=True)
        
        return renderfile(request,'search','index',data)
      
class SpotDetailView(View):
    def get(self, request, *args, **kwargs):
        try:
            # Get the slug from URL parameters
            slug = kwargs.get('slug')
            
            # Fetch the spot with related data
            spot = Spots.objects.prefetch_related(
                'spot_images',
                'category',
                'user'
            ).select_related(
                'category',
                'user'
            ).get(
                slug=slug,
                is_active=True,
                is_approved=True
            )
            
            # Get all images for this spot
            spot_images = spot.spot_images.all()
            cover_image = spot_images.filter(is_cover=True).first()
            
            # Get related spots (same category, excluding current spot)
            related_spots = Spots.objects.prefetch_related(
                Prefetch('spot_images', queryset=SpotImages.objects.filter(is_cover=True))
            ).filter(
                is_active=True,
                is_approved=True,
                category=spot.category
            ).exclude(id=spot.id).order_by('-created_at')[:4]
            
            # Add distance calculation if coordinates are provided
            lat = request.GET.get('lat')
            lon = request.GET.get('lon')
            if lat and lon:
                related_spots = add_distance_to_spots_from_request(related_spots, request)
            
            data = {
                'spot': spot,
                'spot_images': spot_images,
                'cover_image': cover_image,
                'related_spots': related_spots,
                'lat': lat,
                'lon': lon,
            }
            
            return renderfile(request, 'spots', 'detail', data)
            
        except Spots.DoesNotExist:
            # Spot not found - render 404 page
            return renderfile(request, 'portal', '404', {}, status=404)
        except Exception as e:
            # Any other error - render 404 page
            return renderfile(request, 'portal', '404', {}, status=404)
    
class AddSpotView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        lat = request.GET.get('lat')
        data = {}
        data['categories'] = Categories.objects.filter(is_active=True)
        return renderfile(request,'spots','add-spot',data)
    
    def post(self, request, *args, **kwargs):
        try:
            # Get form data
            lat = request.POST.get('lat', '').strip()
            lon = request.POST.get('lon', '').strip()
            spot_name = request.POST.get('spot-name', '').strip()
            spot_description = request.POST.get('spot-description', '').strip()
            spot_address = request.POST.get('spot-address', '').strip()
            spot_coords = request.POST.get('spot-coords', '').strip()
            address = request.POST.get('address', '').strip()
            building = request.POST.get('building', '').strip()
            landmark = request.POST.get('landmark', '').strip()
            city = request.POST.get('city', '').strip()
            
            # Validation errors list
            errors = {}
            
            # Validate required fields
            if not spot_name:
                errors['spot-name'] = 'Spot name is required'
            elif len(spot_name) < 3:
                errors['spot-name'] = 'Spot name must be at least 3 characters long'
                
            if not spot_description:
                errors['spot-description'] = 'Description is required'
            elif len(spot_description) < 10:
                errors['spot-description'] = 'Description must be at least 10 characters long'
            
            # Validate location information
            if not spot_address and not spot_coords:
                errors['location'] = 'Either address or coordinates are required'
            
            # Parse coordinates if provided
            latitude = None
            longitude = None
            if spot_coords:
                try:
                    # Handle different coordinate formats
                    coords_clean = spot_coords.replace('N', '').replace('S', '').replace('E', '').replace('W', '').strip()
                    if ',' in coords_clean:
                        lat_str, lon_str = coords_clean.split(',', 1)
                        latitude = float(lat_str.strip())
                        longitude = float(lon_str.strip())
                        
                        # Validate coordinate ranges
                        if not (-90 <= latitude <= 90):
                            errors['spot-coords'] = 'Latitude must be between -90 and 90'
                        if not (-180 <= longitude <= 180):
                            errors['spot-coords'] = 'Longitude must be between -180 and 180'
                    else:
                        errors['spot-coords'] = 'Invalid coordinate format. Use: latitude, longitude'
                except ValueError:
                    errors['spot-coords'] = 'Invalid coordinate format. Use numbers only'
            
            # Check if at least one image is uploaded
            cover_photo = request.FILES.get('cover-photo')
            photo1 = request.FILES.get('photo1')
            photo2 = request.FILES.get('photo2')
            photo3 = request.FILES.get('photo3')
            photo4 = request.FILES.get('photo4')
            
            uploaded_images = [img for img in [cover_photo, photo1, photo2, photo3, photo4] if img]
            
            if not uploaded_images:
                errors['images'] = 'At least one image is required'
            
            # Validate image files
            for i, image in enumerate(uploaded_images):
                if image:
                    # Check file size (5MB limit)
                    if image.size > 5 * 1024 * 1024:
                        errors[f'image_{i}'] = f'Image {image.name} is too large. Maximum size is 5MB'
                    
                    # Check file type
                    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
                    if image.content_type not in allowed_types:
                        errors[f'image_{i}'] = f'Image {image.name} has unsupported format. Use JPEG, PNG, or WebP'
            
            # If there are validation errors, return them
            if errors:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Please correct the errors below',
                    'errors': errors
                }, status=400)
            
            # Get default category (first active category) - outside transaction
            default_category = Categories.objects.filter(is_active=True).first()
            
            def create_spot_with_images():
                """Function to create spot and images with retry mechanism"""
                with transaction.atomic():
                    # Create the spot
                    spot = Spots.objects.create(
                        user=request.user,
                        name=spot_name,
                        description=spot_description,
                        address=spot_address or address,
                        building_name=building,
                        landmark=landmark,
                        city=city,
                        latitude=latitude,
                        longitude=longitude,
                        coordinates=spot_coords if spot_coords else f"{latitude}, {longitude}" if latitude and longitude else "",
                        category=default_category,
                        is_active=True,
                        top_rated=False,
                    )
                    
                    # Save images in a separate loop to avoid long transaction
                    spot_images = []
                    for i, image in enumerate(uploaded_images):
                        if image:
                            is_cover = (i == 0)  # First image is cover
                            spot_images.append(SpotImages(
                                spot=spot,
                                image=image,
                                is_cover=is_cover
                            ))
                    
                    # Bulk create images to reduce database calls
                    if spot_images:
                        SpotImages.objects.bulk_create(spot_images)
                    
                    return spot
            
            # Try to create spot with retry mechanism
            try:
                spot = retry_database_operation(create_spot_with_images, max_retries=3, delay=0.5)
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Spot added successfully! Admin will verify the details and let you know.',
                    'redirect_url': reverse('portal:home')
                })
                
            except Exception as e:
                # If retry mechanism fails, try without transaction as last resort
                try:
                    # Create the spot without transaction
                    spot = Spots.objects.create(
                        user=request.user,
                        name=spot_name,
                        description=spot_description,
                        address=spot_address or address,
                        building_name=building,
                        landmark=landmark,
                        city=city,
                        latitude=latitude,
                        longitude=longitude,
                        coordinates=spot_coords if spot_coords else f"{latitude}, {longitude}" if latitude and longitude else "",
                        category=default_category,
                        is_active=True,
                        top_rated=False,
                    )
                    
                    # Save images individually
                    for i, image in enumerate(uploaded_images):
                        if image:
                            is_cover = (i == 0)  # First image is cover
                            SpotImages.objects.create(
                                spot=spot,
                                image=image,
                                is_cover=is_cover
                            )
                    
                    return JsonResponse({
                        'status': 'success',
                        'message': 'Spot added successfully! Admin will verify the details and let you know.',
                        'redirect_url': reverse('portal:home')
                    })
                    
                except Exception as fallback_error:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Database is busy. Please try again in a few moments.',
                        'error_type': 'database_busy'
                    }, status=503)
                
        except IntegrityError as e:
            return JsonResponse({
                'status': 'error',
                'message': 'An error occurred while saving the spot. Please try again.',
                'error_type': 'database_error'
            }, status=500)
            
        except Exception as e:
            # Check if it's a database lock error
            if 'database is locked' in str(e).lower() or 'database is busy' in str(e).lower():
                return JsonResponse({
                    'status': 'error',
                    'message': 'Database is temporarily busy. Please try again in a few moments.',
                    'error_type': 'database_busy'
                }, status=503)
            else:
                return JsonResponse({
                    'status': 'error',
                    'message': 'An unexpected error occurred. Please try again.',
                    'error_type': 'server_error'
                }, status=500)

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
        
        
        