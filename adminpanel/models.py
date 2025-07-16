from django.db import models
from django.contrib.auth.models import AbstractUser, Group 
from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext as _
from django.utils.text import slugify
from django.db.models.signals import post_delete, pre_save, post_save
from django.dispatch import receiver
import os
from phonenumber_field.modelfields import PhoneNumberField
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from autoslug import AutoSlugField

import uuid
from adminpanel.validators import validate_possible_number
    
class PossiblePhoneNumberField(PhoneNumberField):
    """Less strict field for phone numbers written to database."""
    default_validators = [validate_possible_number]


# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Users must have a username')

        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, password, **extra_fields)
    
    
USER_STATUS =(
    (1,'Active'),
    (2,'Blocked'),
    (3,'Deleted'),
)

USER_TYPE =(
    (1,'Admin'),
    (2,'User'),
)

# Create your models here.
class User(AbstractUser):
    name = models.CharField(max_length=250, null=True, blank=True)
    dob = models.CharField(max_length=250, null=True, blank=True)
    username = models.CharField(max_length=255, unique=True, blank=True, null=True)
    email = models.EmailField(verbose_name='email address', max_length=255, null=True, blank=True)
    country_code = models.CharField(max_length=250, null=True, blank=True)
    mobile = models.CharField(blank=True, default="", db_index=True)
    address = models.TextField(null=True, blank=True)
    nationality = models.CharField(max_length=250, null=True, blank=True)
    gender = models.CharField(max_length=250, null=True, blank=True)
    user_type = models.PositiveIntegerField(choices=USER_TYPE, null=False, blank=False, default=1)
    status = models.PositiveIntegerField(choices=USER_STATUS,null=False,blank=False,default=1)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['password']
    
    objects = CustomUserManager()
    
    def __str__(self):
        return self.username
    
    def save(self, *args, **kwargs):
        # Format and save mobile_number before saving the User instance
        if self.country_code and self.mobile:
            self.mobile_number = f"{self.country_code}{self.mobile}"
        super().save(*args, **kwargs)
        
        
# 
class Categories(models.Model):
    title = models.CharField(max_length=250, null=True, blank=True)
    slug = AutoSlugField(populate_from='title', max_length=250, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    
    
class Spots(models.Model):
    name = models.CharField(max_length=250, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='user_spots')
    profile_image = models.ImageField(upload_to='profile_image/', null=True, blank=True)
    slug = AutoSlugField(populate_from='name', max_length=250, unique=True, null=True, blank=True)
    category = models.ForeignKey(Categories, on_delete=models.CASCADE, null=True, blank=True)
    coordinates = models.CharField(max_length=250, null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    building_name = models.CharField(max_length=250, null=True, blank=True)
    landmark = models.CharField(max_length=250, null=True, blank=True)
    city = models.CharField(max_length=250, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    top_rated = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=1, null=False, blank=False, default=0)
    is_featured = models.BooleanField(default=False)
    top_rated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    
    
class SpotImages(models.Model):
    spot = models.ForeignKey(Spots, on_delete=models.CASCADE, null=True, blank=True, related_name='spot_images')
    image = models.ImageField(upload_to='spots/', null=True, blank=True)
    is_cover = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    

class Reviews(models.Model):
    spot = models.ForeignKey(Spots, on_delete=models.CASCADE, null=True, blank=True, related_name='spot_reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='user_reviews')
    review_text = models.TextField(null=True, blank=True)
    rating = models.IntegerField(null=True, blank=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    