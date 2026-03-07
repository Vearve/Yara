"""
Management command to seed demo data across multiple workspaces for testing.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from apps.core.models import Workspace, WorkspaceMembership
from apps.core.assignments import Site, Project, Client, Assignment
from apps.hcm.models import (
    Employee, Contract, Engagement, Department,
    EmploymentType, ContractType
)


class Command(BaseCommand):
    help = 'Seed demo data across multiple workspaces'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Seeding workspace demo data...'))

        # Get or create demo user
        user, _ = User.objects.get_or_create(
            username='demo',
            defaults={'email': 'demo@yara.com', 'first_name': 'Demo', 'last_name': 'User'}
        )
        if not user.has_usable_password():
            user.set_password('demo123')
            user.save()
        
        # Create Workspaces
        acme = Workspace.objects.get_or_create(
            code='ACME',
            defaults={
                'name': 'Acme Construction Corp',
                'workspace_type': 'CONSULTING_FIRM',
                'industry': 'Construction',
                'description': 'Major construction contractor managing large infrastructure projects'
            }
        )[0]
        
        beta = Workspace.objects.get_or_create(
            code='BETA',
            defaults={
                'name': 'Beta Tech Solutions',
                'workspace_type': 'CONTRACTOR_COMPANY',
                'industry': 'Technology',
                'description': 'IT contractor firm providing software development staff'
            }
        )[0]
        
        gamma = Workspace.objects.get_or_create(
            code='GAMMA',
            defaults={
                'name': 'Gamma Healthcare Services',
                'workspace_type': 'LARGE_COMPANY',
                'industry': 'Healthcare',
                'description': 'Healthcare provider managing multiple facilities'
            }
        )[0]

        # Give demo user access to all workspaces
        for ws in [acme, beta, gamma]:
            WorkspaceMembership.objects.get_or_create(
                user=user,
                workspace=ws,
                defaults={'role': 'ADMIN', 'is_default': (ws == acme)}
            )

        self.stdout.write(self.style.SUCCESS(f'✓ Created 3 workspaces'))

        # Seed ACME Construction
        self._seed_acme(acme)
        
        # Seed BETA Tech
        self._seed_beta(beta)
        
        # Seed GAMMA Healthcare
        self._seed_gamma(gamma)

        self.stdout.write(self.style.SUCCESS('\n✅ Demo data seeded successfully!'))
        self.stdout.write(self.style.WARNING('\nLogin credentials:'))
        self.stdout.write('  Username: demo')
        self.stdout.write('  Password: demo123')

    def _seed_acme(self, workspace):
        """Seed Acme Construction data"""
        self.stdout.write('\n📦 Seeding Acme Construction...')
        
        # Ensure base HCM references
        emp_type, _ = EmploymentType.objects.get_or_create(name='DIRECT')
        ct_perm, _ = ContractType.objects.get_or_create(name='PERMANENT')
        dept_ops, _ = Department.objects.get_or_create(code='OPS', defaults={'name': 'Operations'})

        # Clients
        client1 = Client.objects.get_or_create(
            code='DOT-NYC',
            workspace=workspace,
            defaults={
                'name': 'NYC Dept of Transportation',
                'industry': 'Government',
                'contact_person': 'John Smith',
                'email': 'jsmith@nyc.gov',
                'phone': '212-555-0100'
            }
        )[0]
        
        client2 = Client.objects.get_or_create(
            code='MTA',
            workspace=workspace,
            defaults={
                'name': 'Metropolitan Transit Authority',
                'industry': 'Transportation',
                'contact_person': 'Maria Garcia',
                'email': 'mgarcia@mta.ny.gov',
                'phone': '212-555-0200'
            }
        )[0]

        # Sites
        site1 = Site.objects.get_or_create(
            code='BRK-BRIDGE',
            workspace=workspace,
            defaults={
                'name': 'Brooklyn Bridge Renovation',
                'location': 'Brooklyn, NY',
                'description': 'Major bridge infrastructure upgrade'
            }
        )[0]
        
        site2 = Site.objects.get_or_create(
            code='TUNNEL-QNS',
            workspace=workspace,
            defaults={
                'name': 'Queens Tunnel Construction',
                'location': 'Queens, NY',
                'description': 'New subway tunnel extension'
            }
        )[0]

        # Projects
        Project.objects.get_or_create(
            code='PRJ-BBR-2025',
            workspace=workspace,
            defaults={
                'name': 'Brooklyn Bridge Restoration Phase 2',
                'description': 'Structural reinforcement and cable replacement',
                'status': 'ACTIVE',
                'site': site1,
                'start_date': timezone.now().date() - timedelta(days=90),
                'end_date': timezone.now().date() + timedelta(days=365)
            }
        )[0]
        
        Project.objects.get_or_create(
            code='PRJ-QTE-2025',
            workspace=workspace,
            defaults={
                'name': 'Queens Tunnel Extension',
                'description': 'Excavation and tunnel boring operations',
                'status': 'ACTIVE',
                'site': site2,
                'start_date': timezone.now().date() - timedelta(days=45),
                'end_date': timezone.now().date() + timedelta(days=730)
            }
        )[0]

        # Employees
        employees_data = [
            {'first': 'James', 'last': 'Rodriguez', 'job_title': 'Site Manager'},
            {'first': 'Sarah', 'last': 'Chen', 'job_title': 'Civil Engineer'},
            {'first': 'Michael', 'last': 'Johnson', 'job_title': 'Safety Officer'},
            {'first': 'Emily', 'last': 'Williams', 'job_title': 'Construction Foreman'},
            {'first': 'David', 'last': 'Brown', 'job_title': 'Equipment Operator'},
        ]

        for idx, emp_data in enumerate(employees_data, 1):
            emp = Employee.objects.get_or_create(
                employee_id=f'ACME-{idx:03d}',
                workspace=workspace,
                defaults={
                    'first_name': emp_data['first'],
                    'last_name': emp_data['last'],
                    'nrc': f'NRCA{idx:05d}',
                    'tpin': f'TPINA{idx:05d}',
                    'date_of_birth': timezone.now().date() - timedelta(days=365*30 + idx*100),
                    'gender': 'M' if idx % 2 else 'F',
                    'email': f"{emp_data['first'].lower()}.{emp_data['last'].lower()}@acme.com",
                    'phone': f'212-555-{1000 + idx}',
                    'house_address': '123 Demo Street, Brooklyn NY',
                    'employment_type': emp_type,
                    'job_title': emp_data['job_title'],
                    'hire_date': timezone.now().date() - timedelta(days=365 + idx * 30),
                }
            )[0]

            # Assign to department
            if not emp.department:
                emp.department = dept_ops
                emp.save(update_fields=['department'])

            # Add contract
            Contract.objects.get_or_create(
                employee=emp,
                contract_type=ct_perm,
                defaults={
                    'contract_number': f'ACME-CN-{idx:04d}',
                    'start_date': emp.hire_date,
                    'status': 'ACTIVE',
                    'salary_currency': 'USD',
                    'basic_salary': 75000 + idx*1500,
                }
            )

            # Create assignment linking to site and client
            Assignment.objects.get_or_create(
                employee=emp,
                site=site1 if idx % 2 else site2,
                client=client1 if idx % 2 else client2,
                defaults={
                    'status': 'ACTIVE',
                    'assignment_start_date': emp.hire_date,
                    'role_at_site': emp_data['job_title'],
                    'shift': 'Day'
                }
            )

        self.stdout.write(self.style.SUCCESS(f'  ✓ Acme: 2 clients, 2 sites, 2 projects, {len(employees_data)} employees'))

    def _seed_beta(self, workspace):
        """Seed Beta Tech Solutions data"""
        self.stdout.write('\n📦 Seeding Beta Tech Solutions...')
        
        # Ensure base HCM references
        emp_type, _ = EmploymentType.objects.get_or_create(name='CONTRACTOR')
        ct_contract, _ = ContractType.objects.get_or_create(name='FIXED_TERM')
        dept_eng, _ = Department.objects.get_or_create(code='ENG', defaults={'name': 'Engineering'})

        # Clients
        client1 = Client.objects.get_or_create(
            code='FINTECH-01',
            workspace=workspace,
            defaults={
                'name': 'FinTech Innovations Inc',
                'industry': 'Financial Services',
                'contact_person': 'Lisa Wang',
                'email': 'lwang@fintech.com',
                'phone': '415-555-0300'
            }
        )[0]
        
        client2 = Client.objects.get_or_create(
            code='ECOM-02',
            workspace=workspace,
            defaults={
                'name': 'E-Commerce Global',
                'industry': 'Retail',
                'contact_person': 'Robert Kumar',
                'email': 'rkumar@ecomglobal.com',
                'phone': '650-555-0400'
            }
        )[0]

        # Sites (for Beta, these are client locations)
        site1 = Site.objects.get_or_create(
            code='FTI-SF',
            workspace=workspace,
            defaults={
                'name': 'FinTech SF Office',
                'location': 'San Francisco, CA',
                'description': 'Client development center'
            }
        )[0]
        
        site2 = Site.objects.get_or_create(
            code='ECG-SV',
            workspace=workspace,
            defaults={
                'name': 'E-Commerce Silicon Valley HQ',
                'location': 'Mountain View, CA',
                'description': 'Client headquarters location'
            }
        )[0]

        # Projects
        Project.objects.get_or_create(
            code='FTI-MOBILE-2025',
            workspace=workspace,
            defaults={
                'name': 'Mobile Banking App Development',
                'description': 'React Native mobile banking application',
                'status': 'ACTIVE',
                'site': site1,
                'start_date': timezone.now().date() - timedelta(days=120),
                'end_date': timezone.now().date() + timedelta(days=180)
            }
        )[0]
        
        Project.objects.get_or_create(
            code='ECG-CLOUD-2025',
            workspace=workspace,
            defaults={
                'name': 'Cloud Migration Initiative',
                'description': 'AWS migration and microservices architecture',
                'status': 'PLANNING',
                'site': site2,
                'start_date': timezone.now().date() + timedelta(days=30),
                'end_date': timezone.now().date() + timedelta(days=365)
            }
        )[0]

        # Employees (contractors)
        employees_data = [
            {'first': 'Alex', 'last': 'Martinez', 'job_title': 'Senior Full Stack Developer'},
            {'first': 'Priya', 'last': 'Patel', 'job_title': 'React Developer'},
            {'first': 'Kevin', 'last': 'Lee', 'job_title': 'DevOps Engineer'},
            {'first': 'Amanda', 'last': 'Taylor', 'job_title': 'QA Automation Engineer'},
            {'first': 'Carlos', 'last': 'Santos', 'job_title': 'UI/UX Designer'},
            {'first': 'Nina', 'last': 'Ivanova', 'job_title': 'Backend Developer'},
        ]

        for idx, emp_data in enumerate(employees_data, 1):
            emp = Employee.objects.get_or_create(
                employee_id=f'BETA-{idx:03d}',
                workspace=workspace,
                defaults={
                    'first_name': emp_data['first'],
                    'last_name': emp_data['last'],
                    'nrc': f'NRCB{idx:05d}',
                    'tpin': f'TPINB{idx:05d}',
                    'date_of_birth': timezone.now().date() - timedelta(days=365*28 + idx*120),
                    'gender': 'M' if idx % 2 else 'F',
                    'email': f"{emp_data['first'].lower()}.{emp_data['last'].lower()}@betatech.com",
                    'phone': f'415-555-{2000 + idx}',
                    'house_address': '456 Market Street, San Francisco CA',
                    'employment_type': emp_type,
                    'job_title': emp_data['job_title'],
                    'hire_date': timezone.now().date() - timedelta(days=180 + idx * 20),
                    'contractor_type': 'CONTRACTOR',
                }
            )[0]

            if not emp.department:
                emp.department = dept_eng
                emp.save(update_fields=['department'])

            Contract.objects.get_or_create(
                employee=emp,
                contract_type=ct_contract,
                defaults={
                    'contract_number': f'BETA-CN-{idx:04d}',
                    'start_date': emp.hire_date,
                    'end_date': emp.hire_date + timedelta(days=365),
                    'status': 'ACTIVE',
                    'salary_currency': 'USD',
                    'basic_salary': 100000 + idx*2000,
                }
            )

            Assignment.objects.get_or_create(
                employee=emp,
                site=site1 if idx % 2 else site2,
                client=client1 if idx % 2 else client2,
                defaults={
                    'status': 'ACTIVE',
                    'assignment_start_date': emp.hire_date,
                    'role_at_site': emp_data['job_title'],
                    'shift': 'Day'
                }
            )

        self.stdout.write(self.style.SUCCESS(f'  ✓ Beta: 2 clients, 2 sites, 2 projects, {len(employees_data)} contractors'))

    def _seed_gamma(self, workspace):
        """Seed Gamma Healthcare Services data"""
        self.stdout.write('\n📦 Seeding Gamma Healthcare...')
        
        # Ensure base HCM references
        emp_type, _ = EmploymentType.objects.get_or_create(name='DIRECT')
        ct_perm, _ = ContractType.objects.get_or_create(name='PERMANENT')
        dept_med, _ = Department.objects.get_or_create(code='MED', defaults={'name': 'Medical'})

        # Clients (insurance providers)
        client1 = Client.objects.get_or_create(
            code='UHINS',
            workspace=workspace,
            defaults={
                'name': 'United Health Insurance',
                'industry': 'Insurance',
                'contact_person': 'Dr. Patricia Moore',
                'email': 'pmoore@uhins.com',
                'phone': '800-555-0500'
            }
        )[0]

        # Sites (hospital locations)
        site1 = Site.objects.get_or_create(
            code='GMH-MAIN',
            workspace=workspace,
            defaults={
                'name': 'Gamma Medical Hospital - Main Campus',
                'location': 'Chicago, IL',
                'description': 'Primary care and surgical center'
            }
        )[0]
        
        site2 = Site.objects.get_or_create(
            code='GMH-NORTH',
            workspace=workspace,
            defaults={
                'name': 'Gamma Medical Hospital - North Branch',
                'location': 'Evanston, IL',
                'description': 'Outpatient and urgent care facility'
            }
        )[0]

        # Projects (healthcare initiatives)
        Project.objects.get_or_create(
            code='EHR-IMPL-2025',
            workspace=workspace,
            defaults={
                'name': 'Electronic Health Records Implementation',
                'description': 'System-wide EHR deployment and training',
                'status': 'ACTIVE',
                'site': site1,
                'start_date': timezone.now().date() - timedelta(days=60),
                'end_date': timezone.now().date() + timedelta(days=240)
            }
        )[0]
        
        Project.objects.get_or_create(
            code='TELE-HEALTH',
            workspace=workspace,
            defaults={
                'name': 'Telemedicine Expansion',
                'description': 'Remote consultation platform rollout',
                'status': 'COMPLETED',
                'site': site2,
                'start_date': timezone.now().date() - timedelta(days=180),
                'end_date': timezone.now().date() - timedelta(days=30)
            }
        )[0]

        # Employees
        employees_data = [
            {'first': 'Jennifer', 'last': 'Anderson', 'job_title': 'Chief Medical Officer'},
            {'first': 'Thomas', 'last': 'Wright', 'job_title': 'Cardiologist'},
            {'first': 'Susan', 'last': 'Miller', 'job_title': 'Head Nurse'},
            {'first': 'Rachel', 'last': 'Green', 'job_title': 'Registered Nurse'},
            {'first': 'Mark', 'last': 'Thompson', 'job_title': 'Radiology Technician'},
            {'first': 'Linda', 'last': 'Davis', 'job_title': 'Pharmacy Manager'},
            {'first': 'George', 'last': 'Harris', 'job_title': 'Medical Records Clerk'},
        ]

        for idx, emp_data in enumerate(employees_data, 1):
            emp = Employee.objects.get_or_create(
                employee_id=f'GHS-{idx:03d}',
                workspace=workspace,
                defaults={
                    'first_name': emp_data['first'],
                    'last_name': emp_data['last'],
                    'nrc': f'NRCG{idx:05d}',
                    'tpin': f'TPING{idx:05d}',
                    'date_of_birth': timezone.now().date() - timedelta(days=365*35 + idx*80),
                    'gender': 'M' if idx % 2 else 'F',
                    'email': f"{emp_data['first'].lower()}.{emp_data['last'].lower()}@gammahealthcare.com",
                    'phone': f'312-555-{3000 + idx}',
                    'house_address': '789 Lakeshore Dr, Chicago IL',
                    'employment_type': emp_type,
                    'job_title': emp_data['job_title'],
                    'hire_date': timezone.now().date() - timedelta(days=730 + idx * 60),
                }
            )[0]

            if not emp.department:
                emp.department = dept_med
                emp.save(update_fields=['department'])

            Contract.objects.get_or_create(
                employee=emp,
                contract_type=ct_perm,
                defaults={
                    'contract_number': f'GHS-CN-{idx:04d}',
                    'start_date': emp.hire_date,
                    'status': 'ACTIVE',
                    'salary_currency': 'USD',
                    'basic_salary': 90000 + idx*2500,
                }
            )

            Assignment.objects.get_or_create(
                employee=emp,
                site=site1 if idx % 2 else site2,
                client=client1,
                defaults={
                    'status': 'ACTIVE',
                    'assignment_start_date': emp.hire_date,
                    'role_at_site': emp_data['job_title'],
                    'shift': 'Night' if idx % 2 else 'Day'
                }
            )

        self.stdout.write(self.style.SUCCESS(f'  ✓ Gamma: 1 client, 2 sites, 2 projects, {len(employees_data)} employees'))
