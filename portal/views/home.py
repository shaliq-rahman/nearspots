import pdb
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
from django.contrib.auth.hashers import check_password
from django.contrib.auth import login, authenticate, logout
from adminpanel.models import User, Categories, Spots, SpotImages
from ..utils import add_distance_to_spots_from_request


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