from django.urls import path
from portal.views import home
from portal.views import master
from django.shortcuts import render

app_name = 'portal'

def debug_view(request):
    return render(request, 'portal/debug.html')

urlpatterns = [
    path('', home.HomeView.as_view(), name='home'),
    path('debug/', debug_view, name='debug'),
]
