import math
from decimal import Decimal
from typing import Optional, Tuple
from django.http import HttpRequest


def calculate_distance_haversine(
    lat1: float, 
    lon1: float, 
    lat2: float, 
    lon2: float
) -> float:
    """
    Calculate the distance between two points on Earth using the Haversine formula.
    
    Args:
        lat1: Latitude of first point in decimal degrees
        lon1: Longitude of first point in decimal degrees
        lat2: Latitude of second point in decimal degrees
        lon2: Longitude of second point in decimal degrees
    
    Returns:
        Distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = (math.sin(dlat/2)**2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2)
    c = 2 * math.asin(math.sqrt(a))
    
    # Earth's radius in kilometers
    r = 6371
    
    # Calculate distance
    distance = c * r
    
    return round(distance, 2)


def get_user_location_from_request(request: HttpRequest) -> Tuple[float, float]:
    """
    Get user location from request parameters or session.
    Priority: URL params > Session > Default location
    
    Args:
        request: Django HttpRequest object
    
    Returns:
        Tuple of (latitude, longitude) in decimal degrees
    """
    # Try to get from URL parameters first
    lat_param = request.GET.get('lat')
    lon_param = request.GET.get('lon')
    
    if lat_param and lon_param:
        try:
            lat = float(lat_param)
            lon = float(lon_param)
            # Validate coordinates
            if -90 <= lat <= 90 and -180 <= lon <= 180:
                return lat, lon
        except (ValueError, TypeError):
            pass
    
    # Try to get from session
    session_lat = request.session.get('user_lat')
    session_lon = request.session.get('user_lon')
    
    if session_lat is not None and session_lon is not None:
        try:
            lat = float(session_lat)
            lon = float(session_lon)
            if -90 <= lat <= 90 and -180 <= lon <= 180:
                return lat, lon
        except (ValueError, TypeError):
            pass
    
    # Return default location
    return get_current_location()


def get_current_location() -> Tuple[float, float]:
    """
    Get the current system location.
    For now, this returns a default location (you can modify this based on your needs).
    
    Returns:
        Tuple of (latitude, longitude) in decimal degrees
    """
    # Default location - you can modify this or implement IP-based geolocation
    # For example, you could use a geolocation service or get from user preferences
    default_lat = 40.7128  # New York City latitude
    default_lon = -74.0060  # New York City longitude
    
    return default_lat, default_lon


def add_distance_to_spots(spots_queryset, current_lat: Optional[float] = None, current_lon: Optional[float] = None):
    """
    Add distance field to each spot in the queryset.
    
    Args:
        spots_queryset: Django queryset of Spots objects
        current_lat: Current latitude (optional, will use default if not provided)
        current_lon: Current longitude (optional, will use default if not provided)
    
    Returns:
        List of spots with distance field added
    """
    if current_lat is None or current_lon is None:
        current_lat, current_lon = get_current_location()
    
    spots_with_distance = []
    
    for spot in spots_queryset:
        if spot.latitude is not None and spot.longitude is not None:
            distance = calculate_distance_haversine(
                current_lat, 
                current_lon, 
                float(spot.latitude), 
                float(spot.longitude)
            )
            spot.distance = distance
        else:
            spot.distance = None
        
        spots_with_distance.append(spot)
    
    return spots_with_distance


def add_distance_to_spots_from_request(spots_queryset, request: HttpRequest):
    """
    Add distance field to each spot in the queryset using location from request.
    
    Args:
        spots_queryset: Django queryset of Spots objects
        request: Django HttpRequest object
    
    Returns:
        List of spots with distance field added
    """
    current_lat, current_lon = get_user_location_from_request(request)
    return add_distance_to_spots(spots_queryset, current_lat, current_lon) 