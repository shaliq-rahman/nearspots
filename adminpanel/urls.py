from django.urls import path
from adminpanel.views import account
from adminpanel.views import master

app_name = 'adminpanel'

urlpatterns = [
    path('', account.Dashboard.as_view(), name='dashboard'),
    path('login/', account.Login.as_view(), name='login'),
    path('logout/', account.Logout.as_view(), name='logout'),
    path('profile/', account.Profile.as_view(), name='profile'),
    
    #USERS
    path('users/', account.UsersView.as_view(), name='users'),
    path('users/<str:id>/toggle/', account.UserToggleView.as_view(), name='user_toggle'),
    path('users/<str:id>/delete/', account.UsersDeleteView.as_view(), name='user_delete'),
    
    
    #CATEGORIES
    path('categories/', master.CategoriesView.as_view(), name='categories'),
    path('categories/add/', master.CreateCategories.as_view(), name='create_categories'),
    path('categories/<str:id>/edit/', master.CategoriesUpdateView.as_view(), name='categories_update'),
    path('categories/<str:id>/toggle/', master.CategoriesToggleView.as_view(), name='categories_toggle'),
    path('categories/<str:id>/delete/', master.CategoriesDeleteView.as_view(), name='categories_delete'),
    
]
