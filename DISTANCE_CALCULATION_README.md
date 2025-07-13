# Distance Calculation Feature

This feature adds distance calculation to all spots in the NearSpots application. Each spot now displays its distance from the user's current location in kilometers.

## Features

### 1. Distance Calculation
- Uses the Haversine formula to calculate accurate distances between two geographical points
- Calculates distances in kilometers
- Handles edge cases where spots don't have coordinates

### 2. Location Sources
The system can get the user's location from multiple sources (in order of priority):
1. **URL Parameters**: `?lat=40.7128&lon=-74.0060`
2. **Session Storage**: Previously stored coordinates
3. **Default Location**: New York City (40.7128, -74.0060)

### 3. User Interface
- **Location Button**: A "📍 Use My Location" button in the header that uses browser geolocation
- **Distance Display**: Shows distance on all spot cards and category cards
- **Responsive Design**: Distance information is styled for both desktop and mobile

## Files Modified/Created

### New Files
- `portal/utils.py` - Distance calculation utilities
- `portal/management/commands/test_distance.py` - Test command for distance calculation
- `DISTANCE_CALCULATION_README.md` - This documentation

### Modified Files
- `portal/views/home.py` - Updated to include distance calculations
- `templates/portal/home/index.html` - Added distance display in templates
- `static/portal/css/style.css` - Added styling for distance elements
- `static/portal/js/script.js` - Added geolocation functionality
- `nearspots/settings.py` - Added portal app to INSTALLED_APPS

## Usage

### For Users
1. Click the "📍 Use My Location" button in the header
2. Allow location access when prompted by the browser
3. The page will reload with distances calculated from your location
4. All spots will now show their distance from your location

### For Developers
1. **Test the distance calculation**:
   ```bash
   python manage.py test_distance
   python manage.py test_distance --lat 11.2588 --lon 75.7804
   ```

2. **Add distance to spots programmatically**:
   ```python
   from portal.utils import add_distance_to_spots
   
   spots = Spots.objects.filter(is_active=True)
   spots_with_distance = add_distance_to_spots(spots, lat=40.7128, lon=-74.0060)
   
   for spot in spots_with_distance:
       print(f"{spot.name}: {spot.distance} km")
   ```

3. **Get user location from request**:
   ```python
   from portal.utils import get_user_location_from_request
   
   lat, lon = get_user_location_from_request(request)
   ```

## Technical Details

### Distance Calculation Formula
The Haversine formula is used to calculate the great-circle distance between two points on a sphere:

```
a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
c = 2 ⋅ atan2( √a, √(1−a) )
d = R ⋅ c
```

Where:
- φ = latitude
- λ = longitude
- R = Earth's radius (6371 km)

### Browser Geolocation
The JavaScript uses the HTML5 Geolocation API:
- Requests high accuracy location
- 10-second timeout
- 5-minute cache for location data

### Error Handling
- Gracefully handles missing coordinates
- Shows "Distance unavailable" when coordinates are missing
- Validates coordinate ranges (-90 to 90 for lat, -180 to 180 for lon)

## Future Enhancements

1. **IP-based Geolocation**: Use a service like MaxMind or IP-API to get approximate location from IP address
2. **Caching**: Cache distance calculations to improve performance
3. **Distance-based Sorting**: Add option to sort spots by distance
4. **Radius Filtering**: Filter spots within a certain radius
5. **Multiple Units**: Support for miles, meters, etc.
6. **Real-time Updates**: Update distances without page reload

## Testing

The distance calculation has been tested with:
- Real coordinates from the database (Kerala, India spots)
- Known distances (NYC to LA: ~3935 km)
- Edge cases (missing coordinates)
- Different coordinate formats

All tests pass successfully and show accurate distance calculations. 