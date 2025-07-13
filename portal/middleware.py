from django.http import JsonResponse
from django.db import connection
import time

class DatabaseConnectionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check database connection before processing request
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception as e:
            # If database is locked, return error response
            if 'database is locked' in str(e).lower():
                return JsonResponse({
                    'status': 'error',
                    'message': 'Database is temporarily unavailable. Please try again in a few moments.',
                    'error_type': 'database_unavailable'
                }, status=503)
        
        response = self.get_response(request)
        return response 