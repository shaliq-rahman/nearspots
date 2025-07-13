from django.core.management.base import BaseCommand
from adminpanel.models import Spots
from portal.utils import calculate_distance_haversine, add_distance_to_spots
from django.db import connection
import time


class Command(BaseCommand):
    help = 'Test distance calculation functionality'

    def add_arguments(self, parser):
        parser.add_argument(
            '--lat',
            type=float,
            default=40.7128,
            help='Test latitude (default: New York City)'
        )
        parser.add_argument(
            '--lon',
            type=float,
            default=-74.0060,
            help='Test longitude (default: New York City)'
        )

    def handle(self, *args, **options):
        self.stdout.write('Testing distance calculation...')
        
        # Test database connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                self.stdout.write(self.style.SUCCESS('Database connection successful'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Database connection failed: {e}'))
            return
        
        # Test database lock status
        try:
            with connection.cursor() as cursor:
                cursor.execute("PRAGMA busy_timeout = 5000")
                cursor.execute("PRAGMA journal_mode = WAL")
                self.stdout.write(self.style.SUCCESS('Database settings updated'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Could not update database settings: {e}'))
        
        test_lat = options['lat']
        test_lon = options['lon']
        
        self.stdout.write(
            self.style.SUCCESS(f'Testing distance calculation from ({test_lat}, {test_lon})')
        )
        
        # Test basic distance calculation
        self.stdout.write('\n=== Testing Basic Distance Calculation ===')
        lat1, lon1 = 40.7128, -74.0060  # New York
        lat2, lon2 = 34.0522, -118.2437  # Los Angeles
        distance = calculate_distance_haversine(lat1, lon1, lat2, lon2)
        self.stdout.write(f'Distance from NYC to LA: {distance} km')
        
        # Test with spots from database
        self.stdout.write('\n=== Testing with Database Spots ===')
        spots = Spots.objects.filter(is_active=True)[:5]
        
        if not spots:
            self.stdout.write(self.style.WARNING('No active spots found in database'))
            return
        
        spots_with_distance = add_distance_to_spots(spots, test_lat, test_lon)
        
        for spot in spots_with_distance:
            if spot.latitude and spot.longitude:
                self.stdout.write(
                    f'Spot: {spot.name} - Distance: {spot.distance} km '
                    f'(from {spot.latitude}, {spot.longitude})'
                )
            else:
                self.stdout.write(f'Spot: {spot.name} - No coordinates available')
        
        self.stdout.write(self.style.SUCCESS('Distance calculation test completed')) 