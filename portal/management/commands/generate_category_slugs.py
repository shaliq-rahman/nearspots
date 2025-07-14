from django.core.management.base import BaseCommand
from adminpanel.models import Categories
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Generate slugs for categories that don\'t have them'

    def handle(self, *args, **options):
        categories = Categories.objects.filter(slug__isnull=True)
        
        for category in categories:
            if category.title:
                # Generate slug from title
                base_slug = slugify(category.title)
                slug = base_slug
                counter = 1
                
                # Ensure slug is unique
                while Categories.objects.filter(slug=slug).exclude(id=category.id).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                
                category.slug = slug
                category.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Generated slug "{slug}" for category "{category.title}"')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully generated slugs for {categories.count()} categories')
        ) 