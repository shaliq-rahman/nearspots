from django.urls import path
from portal.views import home
from portal.views import master
from django.shortcuts import render

app_name = 'portal'

def debug_view(request):
    return render(request, 'portal/debug.html')

urlpatterns = [
    # path('debug/', debug_view, name='debug'),
    
    #Home Page
    path('', home.HomeView.as_view(), name='home'),
    path('search/', home.SearchView.as_view(), name='search'),
    
    #Spot Detail Page
    path('spot-detail/<slug:slug>/', home.SpotDetailView.as_view(), name='spot_detail'),
    
    #Add Spot Page
    path('add-spot/', home.AddSpotView.as_view(), name='add_spot'),
    
    #Profile Page
    path('profile/', home.ProfileView.as_view(), name='profile'),
    
    #Login Page
    path('login/', home.LoginView.as_view(), name='login'),
    path('logout/', home.LogoutView.as_view(), name='logout'),
    path('register/', home.RegisterView.as_view(), name='register'),
]
