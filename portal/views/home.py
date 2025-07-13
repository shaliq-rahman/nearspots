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


class HomeView(View):
    def get(self, request, *args, **kwargs):
        data = {}
        return renderfile(request,'home','index',data)