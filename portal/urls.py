from django.urls import path
from portal.views import home
from portal.views import master
from django.shortcuts import render

app_name = 'portal'

def debug_view(request):
    return render(request, 'portal/debug.html')

urlpatterns = [
    path('debug/', debug_view, name='debug'),
    path('', home.HomeView.as_view(), name='home'),
    path('search/', home.SearchView.as_view(), name='search'),
    path('spot-detail/<slug:slug>/', home.SpotDetailView.as_view(), name='spot_detail'),
]
