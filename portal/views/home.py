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


class HomeView(View):
    def get(self, request, *args, **kwargs):
        data = {}
        data['categories'] = Categories.objects.filter(is_active=True)
        data['food_spots'] = Spots.objects.prefetch_related(
            Prefetch('spot_images', queryset=SpotImages.objects.filter(is_cover=True))
        ).filter(is_active=True, category_id=data['categories'][0].id)
        data['attraction_spots'] = Spots.objects.prefetch_related(
            Prefetch('spot_images', queryset=SpotImages.objects.filter(is_cover=True))
        ).filter(is_active=True, category_id=data['categories'][1].id)
        
        # Latest attraction sites (limited to 4)
        data['latest_attractions'] = Spots.objects.prefetch_related(
            'spot_images'
        ).filter(is_active=True, category_id=data['categories'][1].id).order_by('-created_at')[:4]
        
        # Top rated spots (limited to 4)
        data['top_rated_spots'] = Spots.objects.prefetch_related(
            'spot_images'
        ).filter(is_active=True, top_rated=True).order_by('-created_at')[:4]
        
        return renderfile(request,'home','index',data)