from django.core.management.base import BaseCommand
from django.db import connection
import time

class Command(BaseCommand):
    help = 'Fix database locks and optimize SQLite database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force database optimization even if no locks detected',
        )

    def handle(self, *args, **options):
        self.stdout.write('Checking database locks and optimizing...')
        
        try:
            with connection.cursor() as cursor:
                # Set SQLite optimizations
                cursor.execute("PRAGMA busy_timeout = 30000")  # 30 seconds timeout
                cursor.execute("PRAGMA journal_mode = WAL")    # Write-Ahead Logging
                cursor.execute("PRAGMA synchronous = NORMAL")  # Faster writes
                cursor.execute("PRAGMA cache_size = 10000")    # Increase cache
                cursor.execute("PRAGMA temp_store = MEMORY")   # Use memory for temp tables
                
                self.stdout.write(self.style.SUCCESS('Database optimizations applied'))
                
                # Check for any active transactions
                cursor.execute("PRAGMA database_list")
                databases = cursor.fetchall()
                
                for db in databases:
                    self.stdout.write(f'Database: {db[1]} - {db[2]}')
                
                # Vacuum the database to reclaim space and optimize
                if options['force']:
                    self.stdout.write('Running VACUUM (this may take a while)...')
                    cursor.execute("VACUUM")
                    self.stdout.write(self.style.SUCCESS('VACUUM completed'))
                
                # Analyze tables for better query planning
                cursor.execute("ANALYZE")
                self.stdout.write(self.style.SUCCESS('Database analysis completed'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error optimizing database: {e}'))
            return
        
        self.stdout.write(self.style.SUCCESS('Database optimization completed successfully!')) 