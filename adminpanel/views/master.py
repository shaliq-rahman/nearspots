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
from adminpanel.models import User, Categories, Spots, SpotImages, Reviews
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
            
    
# ----------------------------- SPOTS --------------------------------

class SpotsView(LoginRequiredMixin, View):
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
  
        spots = Spots.objects.filter(**filter_conditions).order_by('-id')
        try:
            page = int(request.GET.get("page", 1))
        except ValueError:
            page = 1

        paginator = Paginator(spots, PAGINATION_PERPAGE)
        try:
            spots = paginator.page(page)
        except PageNotAnInteger:
            spots = paginator.page(1)  
        except EmptyPage:
            spots = paginator.page(paginator.num_pages)

        if is_ajax(request=request):
            context = {}
            context['spots']= spots
            response = {"success": True,
                        "template": render_to_string("adminpanel/spots/spots_ajax.html", context, request=request),
                        "pagination": render_to_string("adminpanel/spots/spots_pagination.html", context=context, request=request),
                        }
            return JsonResponse(response)
        
        data['spots'], data['current_page'] = spots, page
        return renderfile(request,'spots','index',data)
    
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

class SpotsCreateView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'
    
    
    def get(self, request, *args, **kwargs):
        data = {}
        data['categories'] = Categories.objects.filter(is_active=True)
        return renderfile(request,'spots','form',data)
    
    def post(self, request, *args, **kwargs):
        try:
            # Get spot data
            name = request.POST.get('name', None)
            category_id = request.POST.get('category', None)
            coordinates = request.POST.get('coordinates', None)
            latitude = request.POST.get('latitude', None)
            longitude = request.POST.get('longitude', None)
            address = request.POST.get('address', None)
            building_name = request.POST.get('building_name', None)
            landmark = request.POST.get('landmark', None)
            city = request.POST.get('city', None)
            description = request.POST.get('description', None)
            
            # Validate required field
            if not name:
                return JsonResponse({
                    'success': False, 
                    'message': 'Spot name is required'
                })
            
            # Check if spot with same name already exists
            if Spots.objects.filter(name=name).exists():
                return JsonResponse({
                    'success': False, 
                    'message': 'A spot with this name already exists'
                })
            
            # Create the spot
            spot_data = {
                'name': name,
                'is_active': True
            }
            
            # Add optional fields if provided
            if category_id and category_id != '':
                spot_data['category_id'] = category_id
            if coordinates and coordinates.strip():
                spot_data['coordinates'] = coordinates.strip()
            if latitude and latitude.strip():
                try:
                    spot_data['latitude'] = float(latitude)
                except ValueError:
                    return JsonResponse({
                        'success': False, 
                        'message': 'Invalid latitude value'
                    })
            if longitude and longitude.strip():
                try:
                    spot_data['longitude'] = float(longitude)
                except ValueError:
                    return JsonResponse({
                        'success': False, 
                        'message': 'Invalid longitude value'
                    })
            if address and address.strip():
                spot_data['address'] = address.strip()
            if building_name and building_name.strip():
                spot_data['building_name'] = building_name.strip()
            if landmark and landmark.strip():
                spot_data['landmark'] = landmark.strip()
            if city and city.strip():
                spot_data['city'] = city.strip()
            if description and description.strip():
                spot_data['description'] = description.strip()
            spot_data['is_approved'] = True
            
            # Create the spot
            spot = Spots.objects.create(**spot_data)
            
            # Handle spot images if uploaded
            images = request.FILES.getlist('spot_images')
            new_cover_image = request.POST.get('new_cover_image', None)
            
            if images:
                # Limit to 5 images
                images = images[:5]
                
                for i, image in enumerate(images):
                    SpotImages.objects.create(
                        spot=spot,
                        image=image,
                        is_cover=(str(i) == str(new_cover_image))
                    )
            
            success_message = f'Spot "{name}" created successfully'
            return JsonResponse({
                'success': True, 
                'message': success_message, 
                'redirect_url': reverse('adminpanel:spots')
            })
            
        except Exception as error:
            error_message = f"Error creating spot: {str(error)}"
            return JsonResponse({
                'success': False, 
                'message': error_message
            })

class SpotsToggleView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'


    def post(self, request, id, *args, **kwargs):
        id  = request.POST.get('id', None)
        status  = request.POST.get('status', None)
        
        try:
            with transaction.atomic():
                data = {}
                spot = get_object_or_404(Spots, id=id)
                if status == 'unchecked':
                    spot.is_active = False
                    message = 'Spot deactivated successfully'
                else:
                    spot.is_active = True
                    message = 'Spot activated successfully'
                spot.save()
                data['success'] = True
                data['message'] = message
                data['redirect_url'] = reverse('adminpanel:spots')
        except Exception as error:
            data = {}
            data["success"] = False
            data["message"] = "Something went wrong"
        return JsonResponse(data)

class SpotsTopRatedToggleView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'

    def post(self, request, id, *args, **kwargs):
        id  = request.POST.get('id', None)
        status  = request.POST.get('status', None)
        try:
            with transaction.atomic():
                data = {}
                spot = get_object_or_404(Spots, id=id)
                if status == 'unchecked':
                    spot.top_rated = False
                    message = 'Spot removed from Top Rated successfully'
                else:
                    spot.top_rated = True
                    message = 'Spot marked as Top Rated successfully'
                spot.save()
                data['success'] = True
                data['message'] = message
                data['redirect_url'] = reverse('adminpanel:spots')
        except Exception as error:
            data = {}
            data["success"] = False
            data["message"] = "Something went wrong"
        return JsonResponse(data)

class SpotsDeleteView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'

    def post(self, request, id, *args, **kwargs):
        id  = request.POST.get('id', None)
        try:
            with transaction.atomic():
                data = {}
                spot = get_object_or_404(Spots, id=id)
                spot.delete()
                data['success'] = True
                data['message'] = 'Spot deleted successfully'
                data['redirect_url'] = reverse('adminpanel:spots')
        except Exception as error:
            data = {}
            data["success"] = False
            data["message"] = "Something went wrong"
        return JsonResponse(data)

class SpotsUpdateView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'

    def get(self, request, id, *args, **kwargs):
        spot = get_object_or_404(Spots, id=id)
        context = {'spot': spot, 'id':id, 'categories': Categories.objects.filter(is_active=True)}
        return renderfile(request,'spots','form', context)


    def post(self, request, id, *args, **kwargs):
        try:
            # Get spot data
            name = request.POST.get('name', None)
            category_id = request.POST.get('category', None)
            coordinates = request.POST.get('coordinates', None)
            latitude = request.POST.get('latitude', None)
            longitude = request.POST.get('longitude', None)
            address = request.POST.get('address', None)
            building_name = request.POST.get('building_name', None)
            landmark = request.POST.get('landmark', None)
            city = request.POST.get('city', None)
            description = request.POST.get('description', None)
            
            # Validate required field
            if not name:
                return JsonResponse({
                    'success': False, 
                    'message': 'Spot name is required'
                })
            
            # Check if spot with same name already exists (excluding current spot)
            if Spots.objects.exclude(id=id).filter(name=name).exists():
                return JsonResponse({
                    'success': False, 
                    'message': 'A spot with this name already exists'
                })
            
            # Update the spot
            spot = Spots.objects.get(id=id)
            spot.name = name
            
            # Update optional fields if provided
            if category_id and category_id != '':
                spot.category_id = category_id
            elif category_id == '':
                spot.category = None
            if coordinates and coordinates.strip():
                spot.coordinates = coordinates.strip()
            elif coordinates == '':
                spot.coordinates = None
            if latitude and latitude.strip():
                try:
                    spot.latitude = float(latitude)
                except ValueError:
                    return JsonResponse({
                        'success': False, 
                        'message': 'Invalid latitude value'
                    })
            elif latitude == '':
                spot.latitude = None
            if longitude and longitude.strip():
                try:
                    spot.longitude = float(longitude)
                except ValueError:
                    return JsonResponse({
                        'success': False, 
                        'message': 'Invalid longitude value'
                    })
            elif longitude == '':
                spot.longitude = None
            if address and address.strip():
                spot.address = address.strip()
            elif address == '':
                spot.address = None
            if building_name and building_name.strip():
                spot.building_name = building_name.strip()
            elif building_name == '':
                spot.building_name = None
            if landmark and landmark.strip():
                spot.landmark = landmark.strip()
            elif landmark == '':
                spot.landmark = None
            if city and city.strip():
                spot.city = city.strip()
            elif city == '':
                spot.city = None
            if description and description.strip():
                spot.description = description.strip()
            elif description == '':
                spot.description = None
            
            spot.save()
            
            # Handle spot images if uploaded
            images = request.FILES.getlist('spot_images')
            new_cover_image = request.POST.get('new_cover_image', None)
            
            if images:
                # Limit to 5 images
                images = images[:5]
                
                # Check if there's already a cover image from existing images
                existing_cover = SpotImages.objects.filter(spot=spot, is_cover=True).exists()
                
                for i, image in enumerate(images):
                    # Set as cover only if no existing cover and this is the selected new cover
                    is_cover = (not existing_cover and str(i) == str(new_cover_image))
                    SpotImages.objects.create(
                        spot=spot,
                        image=image,
                        is_cover=is_cover
                    )
            
            success_message = f'Spot "{name}" updated successfully'
            return JsonResponse({
                'success': True, 
                'message': success_message, 
                'redirect_url': reverse('adminpanel:spots')
            })
            
        except Spots.DoesNotExist:
            return JsonResponse({
                'success': False, 
                'message': 'Spot not found'
            })
        except Exception as error:
            error_message = f"Error updating spot: {str(error)}"
            return JsonResponse({
                'success': False, 
                'message': error_message
            })

class SpotSetCoverView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'

    def post(self, request, id, *args, **kwargs):
        try:
            image_id = request.POST.get('image_id')
            
            if not image_id:
                return JsonResponse({
                    'success': False, 
                    'message': 'Image ID is required'
                })
            
            # Get the spot and image
            spot = get_object_or_404(Spots, id=id)
            image = get_object_or_404(SpotImages, id=image_id, spot=spot)
            
            # Remove cover from all other images of this spot
            SpotImages.objects.filter(spot=spot, is_cover=True).update(is_cover=False)
            
            # Set this image as cover
            image.is_cover = True
            image.save()
            
            return JsonResponse({
                'success': True, 
                'message': 'Cover image updated successfully'
            })
            
        except Exception as error:
            error_message = f"Error updating cover image: {str(error)}"
            return JsonResponse({
                'success': False, 
                'message': error_message
            })

class SpotsImagesPreviewView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'

    def get(self, request, *args, **kwargs):
        try:
            spot_id = request.GET.get('spot_id')
            
            if not spot_id:
                return JsonResponse({
                    'success': False, 
                    'message': 'Spot ID is required'
                })
            
            # Get the spot and its images
            spot = get_object_or_404(Spots, id=spot_id)
            images = SpotImages.objects.filter(spot=spot).order_by('-is_cover', 'id')
            
            # Prepare image data
            images_data = []
            for image in images:
                images_data.append({
                    'id': image.id,
                    'image_url': image.image.url,
                    'is_cover': image.is_cover,
                    'filename': image.image.name.split('/')[-1] if image.image.name else ''
                })
            
            return JsonResponse({
                'success': True,
                'images': images_data,
                'total_images': len(images_data)
            })
            
        except Spots.DoesNotExist:
            return JsonResponse({
                'success': False, 
                'message': 'Spot not found'
            })
        except Exception as error:
            error_message = f"Error loading images: {str(error)}"
            return JsonResponse({
                'success': False, 
                'message': error_message
            })

class SpotsApproveView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'

    def post(self, request, id, *args, **kwargs):
        try:
            with transaction.atomic():
                data = {}
                spot = get_object_or_404(Spots, id=id)
                spot.is_approved = True
                spot.save()
                data['success'] = True
                data['message'] = 'Spot approved successfully'
                data['redirect_url'] = reverse('adminpanel:spots')
        except Exception as error:
            print('the error is ', error)
            data = {}
            data["success"] = False
            data["message"] = "Something went wrong"
        return JsonResponse(data)
    
    
#REVIEWS
class ReviewsView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'
    
    def get(self, request, *args, **kwargs):
        data, filter_conditions = {}, {}
        if is_ajax(request=request):
            keyword = request.GET.get('keyword', None)
            status = request.GET.get('status', None)
            if keyword:
                filter_conditions['review_text__icontains'] = keyword
            if status and status != 'all':
                status = True if status == 'active' else False
                filter_conditions['is_approved'] = status
  
        reviews = Reviews.objects.filter(**filter_conditions).order_by('-id')
        try:
            page = int(request.GET.get("page", 1))
        except ValueError:
            page = 1

        paginator = Paginator(reviews, PAGINATION_PERPAGE)
        try:
            reviews = paginator.page(page)
        except PageNotAnInteger:
            reviews = paginator.page(1)  
        except EmptyPage:
            reviews = paginator.page(paginator.num_pages)

        if is_ajax(request=request):
            context = {}
            context['reviews']= reviews
            response = {"success": True,
                        "template": render_to_string("adminpanel/reviews/reviews_ajax.html", context, request=request),
                        "pagination": render_to_string("adminpanel/reviews/reviews_pagination.html", context=context, request=request),
                        }
            return JsonResponse(response)
        
        data['reviews'], data['current_page'] = reviews, page
        return renderfile(request,'reviews','index',data)
    
    
class ReviewsApproveView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'
    
    def post(self, request, id, *args, **kwargs):
        try:
            with transaction.atomic():
                data = {}
                review = get_object_or_404(Reviews, id=id)
                review.is_approved = True
                review.save()
                # Recalculate average rating for the spot
                spot = review.spot
                approved_reviews = spot.spot_reviews.filter(is_approved=True)
                if approved_reviews.exists():
                    total_rating = sum(r.rating for r in approved_reviews if r.rating)
                    review_count = approved_reviews.count()
                    average_rating = round(total_rating / review_count, 1) if review_count > 0 else 0
                else:
                    average_rating = 0
                spot.rating = average_rating
                spot.save()
                data['success'] = True
                data['message'] = 'Review approved successfully'
                data['redirect_url'] = reverse('adminpanel:reviews')
        except Exception as error:
            data = {}
            data["success"] = False
            data["message"] = "Something went wrong"
        return JsonResponse(data)
    

class ReviewsDeleteView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'
    
    def post(self, request, id, *args, **kwargs):
        try:
            with transaction.atomic():
                data = {}
                review = get_object_or_404(Reviews, id=id)
                spot = review.spot
                review.delete()
                # Recalculate average rating for the spot
                approved_reviews = spot.spot_reviews.filter(is_approved=True)
                if approved_reviews.exists():
                    total_rating = sum(r.rating for r in approved_reviews if r.rating)
                    review_count = approved_reviews.count()
                    average_rating = round(total_rating / review_count, 1) if review_count > 0 else 0
                else:
                    average_rating = 0
                spot.rating = average_rating
                spot.save()
                data['success'] = True
                data['message'] = 'Review deleted successfully'
                data['redirect_url'] = reverse('adminpanel:reviews')
                return JsonResponse(data)
        except Exception as error:
            data = {}
            data["success"] = False
            data["message"] = "Something went wrong"
        return JsonResponse(data)


class ReviewsToggleView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'
    
    def post(self, request, id, *args, **kwargs):
        try:
            with transaction.atomic():
                data = {}
                review = get_object_or_404(Reviews, id=id)
                review.is_approved = not review.is_approved
                review.save()
                # Recalculate average rating for the spot
                spot = review.spot
                approved_reviews = spot.spot_reviews.filter(is_approved=True)
                if approved_reviews.exists():
                    total_rating = sum(r.rating for r in approved_reviews if r.rating)
                    review_count = approved_reviews.count()
                    average_rating = round(total_rating / review_count, 1) if review_count > 0 else 0
                else:
                    average_rating = 0
                spot.rating = average_rating
                spot.save()
                data['success'] = True
                data['message'] = f'Review {"approved" if review.is_approved else "disapproved"} successfully'
                data['redirect_url'] = reverse('adminpanel:reviews')
        except Exception as error:
            data = {}
            data["success"] = False
            data["message"] = "Something went wrong"
        return JsonResponse(data)


class ReviewsUpdateView(LoginRequiredMixin, View):
    login_url = '/adminpanel/login/'
    
    def get(self, request, id, *args, **kwargs):
        try:
            review = get_object_or_404(Reviews, id=id)
            data = {'review': review}
            return renderfile(request, 'reviews', 'form', data)
        except Exception as error:
            return redirect('adminpanel:reviews')
    
    def post(self, request, id, *args, **kwargs):
        try:
            with transaction.atomic():
                review = get_object_or_404(Reviews, id=id)
                review_text = request.POST.get('review_text')
                rating = request.POST.get('rating')
                is_approved = request.POST.get('is_approved') == 'on'
                
                review.review_text = review_text
                review.rating = rating if rating else None
                review.is_approved = is_approved
                review.save()
                
                return JsonResponse({
                    'success': True,
                    'message': 'Review updated successfully',
                    'redirect_url': reverse('adminpanel:reviews')
                })
        except Exception as error:
            return JsonResponse({
                'success': False,
                'message': 'Something went wrong'
            })