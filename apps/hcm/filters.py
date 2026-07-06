import django_filters
from django.db.models import Q
from django.utils import timezone

from .models import Contract, Department


class ContractFilter(django_filters.FilterSet):
    """
    FilterSet for the Contract model.
    - status: filters by stored status field.
              'EXPIRED' also catches ACTIVE contracts whose end_date has passed.
    - department_id: traverses employee FK.
    - search: free-text across employee name, employee ID, and contract number.
    """

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('EXPIRED', 'Expired'),
        ('RENEWED', 'Renewed'),
        ('TERMINATED', 'Terminated'),
        ('PENDING_RENEWAL', 'Pending Renewal'),
    ]

    status = django_filters.ChoiceFilter(
        choices=STATUS_CHOICES,
        method='filter_status',
    )
    department_id = django_filters.NumberFilter(
        field_name='employee__department_id',
    )
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Contract
        fields = ['status', 'department_id', 'contract_type']

    def filter_status(self, queryset, name, value):
        if value == 'EXPIRED':
            today = timezone.now().date()
            return queryset.filter(
                Q(status='EXPIRED') | Q(status='ACTIVE', end_date__lt=today)
            )
        if value == 'ACTIVE':
            today = timezone.now().date()
            # Exclude ACTIVE contracts whose end_date already passed
            return queryset.filter(
                Q(status='ACTIVE') & (Q(end_date__isnull=True) | Q(end_date__gte=today))
            )
        return queryset.filter(status=value)

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(employee__first_name__icontains=value)
            | Q(employee__last_name__icontains=value)
            | Q(employee__employee_id__icontains=value)
            | Q(contract_number__icontains=value)
        )
