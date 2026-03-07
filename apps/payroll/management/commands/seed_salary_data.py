"""
Seed payroll salary ranges and title breakdowns from sheet data.
"""
from django.core.management.base import BaseCommand
from apps.payroll.models import SalaryRange, TitleBreakdown


class Command(BaseCommand):
    help = 'Seed salary ranges and title breakdowns from HR sheet'

    def handle(self, *args, **options):
        self.stdout.write('Seeding salary ranges...')
        
        # EMPLOYEE SALARY RANGE data from sheet
        salary_ranges = [
            {'label': '3K < 4K', 'currency': 'ZMW', 'min_gross': 3000, 'max_gross': 4000, 'employee_count': 12},
            {'label': '5K < 6K', 'currency': 'ZMW', 'min_gross': 5000, 'max_gross': 6000, 'employee_count': 9},
            {'label': '7K < 10K', 'currency': 'ZMW', 'min_gross': 7000, 'max_gross': 10000, 'employee_count': 5},
            {'label': '11K < 15K', 'currency': 'ZMW', 'min_gross': 11000, 'max_gross': 15000, 'employee_count': 6},
            {'label': '16K < 20K', 'currency': 'ZMW', 'min_gross': 16000, 'max_gross': 20000, 'employee_count': 2},
            {'label': '21K < 30K', 'currency': 'ZMW', 'min_gross': 21000, 'max_gross': 30000, 'employee_count': 1},
            {'label': '31K < 40K', 'currency': 'ZMW', 'min_gross': 31000, 'max_gross': 40000, 'employee_count': 0},
            {'label': '41K < 50K', 'currency': 'ZMW', 'min_gross': 41000, 'max_gross': 50000, 'employee_count': 0},
            {'label': '51K < 60K', 'currency': 'ZMW', 'min_gross': 51000, 'max_gross': 60000, 'employee_count': 1},
        ]
        
        for data in salary_ranges:
            SalaryRange.objects.update_or_create(
                label=data['label'],
                defaults=data
            )
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(salary_ranges)} salary ranges'))
        
        # TITLE BREAKDOWN data from sheet
        self.stdout.write('Seeding title breakdowns...')
        
        title_breakdowns = [
            {
                'position': 'Admin',
                'currency': 'ZMW',
                'basic': 3000.00,
                'housing': 900.00,
                'transportation': 745.00,
                'lunch': 650.00,
                'gross': 5295.00,
                'net': 5500.00
            },
            {
                'position': 'Stores',
                'currency': 'ZMW',
                'basic': 3000.00,
                'housing': 900.00,
                'transportation': 745.00,
                'lunch': 650.00,
                'gross': 5295.00,
                'net': 5500.00
            },
            {
                'position': 'Logistic Officers Truck Driver',
                'currency': 'ZMW',
                'basic': 4000.00,
                'housing': 1200.00,
                'transportation': 1473.00,
                'lunch': 650.00,
                'gross': 8169.50,
                'net': 7700.17
            },
            {
                'position': 'Logistics Officer LV',
                'currency': 'ZMW',
                'basic': 3000.00,
                'housing': 900.00,
                'transportation': 1174.00,
                'lunch': 800.00,
                'gross': 5874.00,
                'net': 5550.30
            },
            {
                'position': 'Mechanical Fitter Senior',
                'currency': 'ZMK',
                'basic': 5000.00,
                'housing': 1500.00,
                'transportation': 3440.00,
                'lunch': 3440.00,
                'gross': 13380.00,
                'net': 10000.00
            },
            {
                'position': 'Mechanical Fitter',
                'currency': 'ZMK',
                'basic': 3000.00,
                'housing': 900.00,
                'transportation': 1357.50,
                'lunch': 1357.50,
                'gross': 6615.00,
                'net': 6000.00
            },
            {
                'position': 'Boiler Maker Senior',
                'currency': 'ZMK',
                'basic': 5000.00,
                'housing': 1500.00,
                'transportation': 2342.00,
                'lunch': 2342.00,
                'gross': 11184.00,
                'net': 9000.00
            },
            {
                'position': 'Boiler Maker Jnr',
                'currency': 'ZMK',
                'basic': 3000.00,
                'housing': 900.00,
                'transportation': 1181.00,
                'lunch': 1000.00,
                'gross': 6081.00,
                'net': 5550.75
            },
            {
                'position': 'Auto-Electrician Senior',
                'currency': 'ZMK',
                'basic': 5000.00,
                'housing': 1500.00,
                'transportation': 2342.00,
                'lunch': 2342.00,
                'gross': 11184.00,
                'net': 9000.00
            },
        ]
        
        for data in title_breakdowns:
            TitleBreakdown.objects.update_or_create(
                position=data['position'],
                currency=data['currency'],
                defaults=data
            )
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(title_breakdowns)} title breakdowns'))
        self.stdout.write(self.style.SUCCESS('Salary data seeding complete!'))
