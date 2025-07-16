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
    
    #SPOTS
    path('spots/', master.SpotsView.as_view(), name='spots'),
    path('spots/add/', master.SpotsCreateView.as_view(), name='create_spots'),
    path('spots/<str:id>/edit/', master.SpotsUpdateView.as_view(), name='spots_update'),
    path('spots/<str:id>/toggle/', master.SpotsToggleView.as_view(), name='spots_toggle'),
    path('spots/<str:id>/toprated-toggle/', master.SpotsTopRatedToggleView.as_view(), name='spots_toprated_toggle'),
    path('spots/<str:id>/delete/', master.SpotsDeleteView.as_view(), name='spots_delete'),
    path('spots/<str:id>/set-cover/', master.SpotSetCoverView.as_view(), name='spots_set_cover'),
    path('spots/images-preview/', master.SpotsImagesPreviewView.as_view(), name='spots_images_preview'),
    path('spots/<str:id>/approve/', master.SpotsApproveView.as_view(), name='spots_approve'),
    
    #REVIEWS
    path('reviews/', master.ReviewsView.as_view(), name='reviews'),
    path('reviews/<str:id>/edit/', master.ReviewsUpdateView.as_view(), name='review_edit'),
    path('reviews/<str:id>/toggle/', master.ReviewsToggleView.as_view(), name='review_toggle'),
    path('reviews/<str:id>/approve/', master.ReviewsApproveView.as_view(), name='reviews_approve'),
    path('reviews/<str:id>/delete/', master.ReviewsDeleteView.as_view(), name='reviews_delete'),
    
]
