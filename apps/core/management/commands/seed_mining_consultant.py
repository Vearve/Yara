"""
Management command to create a mining company consultant with 4 client workspaces.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from apps.core.models import Workspace, WorkspaceMembership
from apps.core.assignments import Site, Project, Client
from apps.hcm.models import (
    Employee, Contract, Department,
    EmploymentType, ContractType
)


class Command(BaseCommand):
    help = 'Create a mining company consultant with 4 client workspaces'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Creating mining company consultant scenario...'))

        # Create the consultant user
        user, created = User.objects.get_or_create(
            username='mining_consultant',
            defaults={
                'email': 'consultant@mining-hr.com',
                'first_name': 'Mining',
                'last_name': 'Consultant'
            }
        )
        user.set_password('mining123')
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created mining consultant user'))
        else:
            self.stdout.write(self.style.SUCCESS('✓ Updated mining consultant user'))

        # Create 4 mining client workspaces
        clients_data = [
            {
                'name': 'Copper Ridge Mining Ltd',
                'code': 'CRM',
                'industry': 'Copper Mining',
                'description': 'Large-scale copper mining operations in Northern Province',
                'sites': ['Main Mine Site', 'Processing Plant'],
                'employee_count': 45,
            },
            {
                'name': 'Diamond Valley Extractors',
                'code': 'DVE',
                'industry': 'Diamond Mining',
                'description': 'Diamond extraction and processing facility',
                'sites': ['Diamond Mine Alpha', 'Sorting Facility'],
                'employee_count': 32,
            },
            {
                'name': 'Gold Peak Resources',
                'code': 'GPR',
                'industry': 'Gold Mining',
                'description': 'Gold mining and refinery operations',
                'sites': ['Gold Mine Central', 'Refinery Complex'],
                'employee_count': 58,
            },
            {
                'name': 'Emerald Hills Mining Co',
                'code': 'EHMC',
                'industry': 'Emerald Mining',
                'description': 'Precious gemstone extraction and export',
                'sites': ['Emerald Mine Site'],
                'employee_count': 28,
            },
        ]

        # Base HCM references
        emp_type_direct, _ = EmploymentType.objects.get_or_create(name='DIRECT')
        emp_type_contractor, _ = EmploymentType.objects.get_or_create(name='CONTRACTOR')
        ct_perm, _ = ContractType.objects.get_or_create(name='PERMANENT')
        ct_contract, _ = ContractType.objects.get_or_create(name='FIXED_TERM')

        for idx, client_data in enumerate(clients_data, 1):
            # Create workspace
            workspace = Workspace.objects.get_or_create(
                code=client_data['code'],
                defaults={
                    'name': client_data['name'],
                    'workspace_type': 'LARGE_COMPANY',
                    'industry': client_data['industry'],
                    'description': client_data['description'],
                }
            )[0]

            # Add consultant as admin to this workspace
            WorkspaceMembership.objects.get_or_create(
                user=user,
                workspace=workspace,
                defaults={
                    'role': 'ADMIN',
                    'is_default': (idx == 1)  # First one is default
                }
            )

            # Create departments
            dept_ops, _ = Department.objects.get_or_create(
                code=f'{client_data["code"]}-OPS',
                defaults={'name': 'Operations'}
            )
            dept_safety, _ = Department.objects.get_or_create(
                code=f'{client_data["code"]}-SAFE',
                defaults={'name': 'Safety'}
            )

            # Create sites
            sites = []
            for site_idx, site_name in enumerate(client_data['sites'], 1):
                site = Site.objects.get_or_create(
                    code=f'{client_data["code"]}-SITE{site_idx}',
                    workspace=workspace,
                    defaults={
                        'name': site_name,
                        'location': f'{client_data["industry"]} Region, Zambia',
                        'description': f'{site_name} facility'
                    }
                )[0]
                sites.append(site)

            # Create a client record (for contractor assignments)
            client_record = Client.objects.get_or_create(
                code=f'{client_data["code"]}-CLIENT',
                workspace=workspace,
                defaults={
                    'name': client_data['name'],
                    'industry': client_data['industry'],
                    'contact_person': 'Operations Manager',
                    'email': f'ops@{client_data["code"].lower()}.com',
                    'phone': f'+260-97{idx}123456'
                }
            )[0]

            # Create project
            project = Project.objects.get_or_create(
                code=f'{client_data["code"]}-PROJ-2025',
                workspace=workspace,
                defaults={
                    'name': f'{client_data["name"]} Operations 2025',
                    'description': 'Ongoing mining operations and expansion',
                    'status': 'ACTIVE',
                    'site': sites[0],
                    'start_date': timezone.now().date() - timedelta(days=180),
                    'end_date': timezone.now().date() + timedelta(days=545),
                }
            )[0]

            # Create employees
            positions = [
                'Mine Manager', 'Safety Officer', 'Shift Supervisor', 'Equipment Operator',
                'Geologist', 'Drill Operator', 'Blasting Technician', 'Maintenance Engineer',
                'Environmental Officer', 'Quality Control Specialist'
            ]

            for emp_idx in range(1, client_data['employee_count'] + 1):
                position = positions[(emp_idx - 1) % len(positions)]
                is_contractor = (emp_idx % 4 == 0)  # Every 4th is a contractor

                emp = Employee.objects.get_or_create(
                    employee_id=f'{client_data["code"]}-{emp_idx:03d}',
                    workspace=workspace,
                    defaults={
                        'first_name': f'Employee{emp_idx}',
                        'last_name': f'{client_data["code"]}',
                        'nrc': f'NRC{client_data["code"]}{emp_idx:05d}',
                        'tpin': f'TPIN{client_data["code"]}{emp_idx:05d}',
                        'date_of_birth': timezone.now().date() - timedelta(days=365*30 + emp_idx*100),
                        'gender': 'M' if emp_idx % 2 else 'F',
                        'email': f'emp{emp_idx}@{client_data["code"].lower()}.com',
                        'phone': f'+260-96{idx}{emp_idx:04d}',
                        'house_address': f'Mining Compound {emp_idx}, Kitwe',
                        'employment_type': emp_type_contractor if is_contractor else emp_type_direct,
                        'job_title': position,
                        'department': dept_ops if 'Operator' in position or 'Supervisor' in position else dept_safety,
                        'hire_date': timezone.now().date() - timedelta(days=365 + emp_idx * 10),
                        'contractor_type': 'CONTRACTOR' if is_contractor else 'PERMANENT',
                    }
                )[0]

                # Add contract
                Contract.objects.get_or_create(
                    employee=emp,
                    contract_type=ct_contract if is_contractor else ct_perm,
                    defaults={
                        'contract_number': f'{client_data["code"]}-CN-{emp_idx:04d}',
                        'start_date': emp.hire_date,
                        'end_date': emp.hire_date + timedelta(days=365) if is_contractor else None,
                        'status': 'ACTIVE',
                        'salary_currency': 'ZMW',
                        'basic_salary': 8500 + emp_idx * 150,
                    }
                )

            self.stdout.write(self.style.SUCCESS(
                f'  ✓ {client_data["name"]}: {len(sites)} sites, 1 project, {client_data["employee_count"]} employees'
            ))

        self.stdout.write(self.style.SUCCESS('\n✅ Mining company consultant scenario created!'))
        self.stdout.write(self.style.WARNING('\nLogin credentials:'))
        self.stdout.write('  Username: mining_consultant')
        self.stdout.write('  Password: mining123')
        self.stdout.write('\nThis user manages 4 mining company clients:')
        self.stdout.write('  1. Copper Ridge Mining Ltd (45 employees)')
        self.stdout.write('  2. Diamond Valley Extractors (32 employees)')
        self.stdout.write('  3. Gold Peak Resources (58 employees)')
        self.stdout.write('  4. Emerald Hills Mining Co (28 employees)')
