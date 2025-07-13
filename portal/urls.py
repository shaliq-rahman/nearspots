from django.urls import path
from portal.views import home
from portal.views import master

app_name = 'portal'

urlpatterns = [
    path('', home.HomeView.as_view(), name='home'),
]
