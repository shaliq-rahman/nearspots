from adminpanel.models import Categories

def categories_processor(request):
    """
    Context processor to provide categories for header navigation
    """
    categories = Categories.objects.filter(is_active=True).order_by('id')[:2]  # Get first 2 categories
    return {
        'header_categories': categories
    } 