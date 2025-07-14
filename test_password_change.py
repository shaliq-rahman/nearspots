#!/usr/bin/env python
"""
Test script for password change functionality
This script tests the password change view and validation
"""

import os
import sys
import django
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nearspots.settings')
django.setup()

User = get_user_model()

def test_password_change():
    """Test the password change functionality"""
    print("Testing password change functionality...")
    
    # Create a test user
    user = User.objects.create_user(
        username='testuser@example.com',
        email='testuser@example.com',
        password='oldpassword123',
        first_name='Test',
        last_name='User'
    )
    
    # Create a client
    client = Client()
    
    # Login the user
    login_success = client.login(username='testuser@example.com', password='oldpassword123')
    print(f"Login successful: {login_success}")
    
    if login_success:
        # Test password change with valid data
        response = client.post(reverse('portal:change_password'), {
            'currentPassword': 'oldpassword123',
            'newPassword': 'NewPassword123!',
            'confirmPassword': 'NewPassword123!'
        })
        
        print(f"Password change response status: {response.status_code}")
        if response.status_code == 200:
            print("Password change successful!")
            print(f"Response: {response.json()}")
        else:
            print(f"Password change failed: {response.content}")
        
        # Test with invalid current password
        response = client.post(reverse('portal:change_password'), {
            'currentPassword': 'wrongpassword',
            'newPassword': 'NewPassword123!',
            'confirmPassword': 'NewPassword123!'
        })
        
        print(f"Invalid password test status: {response.status_code}")
        if response.status_code == 400:
            print("Invalid password correctly rejected!")
        
        # Test with mismatched passwords
        response = client.post(reverse('portal:change_password'), {
            'currentPassword': 'oldpassword123',
            'newPassword': 'NewPassword123!',
            'confirmPassword': 'DifferentPassword123!'
        })
        
        print(f"Mismatched passwords test status: {response.status_code}")
        if response.status_code == 400:
            print("Mismatched passwords correctly rejected!")
    
    # Clean up
    user.delete()
    print("Test completed!")

if __name__ == '__main__':
    test_password_change() 