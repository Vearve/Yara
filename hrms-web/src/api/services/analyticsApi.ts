import http from '../../lib/http';

export interface AnalyticsData {
  // KPI metrics
  kpis: {
    turnover_rate: number;
    turnover_change: number;
    overtime_rate: number;
    overtime_change: number;
    training_roi: number;
    roi_change: number;
    offer_acceptance: number;
    acceptance_change: number;
    retention_rate: number;
    retention_change: number;
  };

  // Module statistics
  hcm: {
    total_employees: number;
    active_engagements: number;
    pending_terminations: number;
    departments: number;
  };

  recruitment: {
    active_atrs: number;
    total_candidates: number;
    interviews_scheduled: number;
    offers_pending: number;
  };

  salary: {
    avg_gross: number;
    avg_net: number;
    total_payroll: number;
    salary_ranges: number;
  };

  case_studies: {
    opened: number;
    under_review: number;
    resolved: number;
    investigations_active: number;
  };

  // Trends and charts
  employee_trend: Array<{
    month: string;
    active: number;
    inactive: number;
    on_leave: number;
  }>;

  department_distribution: Array<{
    name: string;
    value: number;
  }>;

  training_completion: Array<{
    month: string;
    completed: number;
    pending: number;
  }>;

  recruitment_funnel: Array<{
    stage: string;
    count: number;
  }>;

  monthly_summary: Array<{
    month: string;
    active: number;
    engagements: number;
    terminations: number;
    leaves: number;
    sickNotes: number;
    absenteeism: number;
    completed: number;
    offers: number;
  }>;
}

export type AnalyticsFilters = {
  departmentId?: number | null;
  jobTitle?: string | null;
  employeeId?: number | null;
  dateRange?: any;
};

export const analyticsApi = {
  /**
   * Fetch comprehensive analytics data
   */
  async getAnalytics(filters: AnalyticsFilters = {}): Promise<AnalyticsData> {
    try {
      const { departmentId, jobTitle, employeeId, dateRange } = filters;
      // Fetch data from multiple endpoints in parallel
      const results = await Promise.allSettled([
        http.get('/api/v1/hcm/employees/'),
        http.get('/api/v1/hcm/engagements/'),
        http.get('/api/v1/hcm/terminations/'),
        http.get('/api/v1/hcm/departments/'),
        http.get('/api/v1/recruitment/atrs/', { params: { page_size: 500 } }),
        http.get('/api/v1/recruitment/candidates/', { params: { page_size: 500 } }),
        http.get('/api/v1/hcm/contracts/'),
        http.get('/api/v1/activities/case-studies/'),
        http.get('/api/v1/activities/investigations/'),
        http.get('/api/v1/leave/requests/'),
        http.get('/api/v1/leave/sick-notes/'),
        http.get('/api/v1/leave/absenteeism/'),
        http.get('/api/v1/tracking/trainings/'),
        http.get('/api/v1/payroll/entries/'),
        http.get('/api/v1/performance/kpis/employee_trend/'),
      ]);

      const getResultData = (result: PromiseSettledResult<any>): any[] => {
        if (result.status === 'fulfilled' && result.value?.data) {
          return result.value.data?.results || result.value.data || [];
        }
        return [];
      };

      const employees = getResultData(results[0]);
      const engagements = getResultData(results[1]);
      const terminations = getResultData(results[2]);
      const departments = getResultData(results[3]);
      const atrs = getResultData(results[4]);
      const candidates = getResultData(results[5]);
      const contracts = getResultData(results[6]);
      const caseStudies = getResultData(results[7]);
      const investigations = getResultData(results[8]);
      const leaveRequests = getResultData(results[9]);
      const sickNotes = getResultData(results[10]);
      const absenteeism = getResultData(results[11]);
      const trainings = getResultData(results[12]);
      const payrollEntries = getResultData(results[13]);
      const employeeTrendResult = results[14];

      const applyDateFilter = (items: any[], dateKey: string) => {
        if (!dateRange?.[0] || !dateRange?.[1]) return items;
        const from = new Date(dateRange[0].format('YYYY-MM-DD'));
        const to = new Date(dateRange[1].format('YYYY-MM-DD'));
        return items.filter((item: any) => {
          const raw = item?.[dateKey];
          if (!raw) return false;
          const dt = new Date(raw);
          return dt >= from && dt <= to;
        });
      };

      // First filter ALL employees (including terminated) by filters
      let allFilteredEmployees = [...employees];
      if (departmentId) {
        allFilteredEmployees = allFilteredEmployees.filter((e: any) => e.department === departmentId);
      }
      if (jobTitle) {
        allFilteredEmployees = allFilteredEmployees.filter((e: any) => (e.job_title || '').toLowerCase() === jobTitle.toLowerCase());
      }
      if (employeeId) {
        allFilteredEmployees = allFilteredEmployees.filter((e: any) => e.id === employeeId);
      }
      allFilteredEmployees = applyDateFilter(allFilteredEmployees, 'hire_date');

      // Then get active employees only (excluding terminated)
      let filteredEmployees = allFilteredEmployees.filter((e: any) => e.employment_status !== 'TERMINATED');

      const filteredEmployeeIds = new Set(filteredEmployees.map((e: any) => e.id));
      const filterByEmployee = (items: any[]) => {
        if (!departmentId && !jobTitle && !employeeId && !dateRange?.[0]) return items;
        return items.filter((item: any) => {
          const empId = item?.employee ?? item?.employee_id ?? item?.employee?.id;
          return empId ? filteredEmployeeIds.has(empId) : false;
        });
      };

      const filteredEngagements = filterByEmployee(engagements);
      const filteredTerminations = filterByEmployee(terminations);
      const filteredContracts = filterByEmployee(contracts);
      const filteredCandidates = candidates;
      const filteredCaseStudies = caseStudies;
      const filteredInvestigations = investigations;
      const filteredLeaveRequests = filterByEmployee(leaveRequests);
      const filteredSickNotes = filterByEmployee(sickNotes);
      const filteredAbsenteeism = filterByEmployee(absenteeism);
      const filteredTrainings = filterByEmployee(trainings);
      const filteredDepartments = departmentId
        ? departments.filter((d: any) => d.id === departmentId)
        : departments;

      // Calculate metrics
      const totalEmployees = filteredEmployees.length;
      const totalAllEmployees = allFilteredEmployees.length; // Including terminated
      const terminatedEmployees = totalAllEmployees - totalEmployees;
      const activeEngagements = filteredEngagements.filter((e: any) => !e.end_date || new Date(e.end_date) > new Date()).length;
      const pendingTerminations = filteredTerminations.filter((t: any) => t.status === 'PENDING').length;

      const activeAtrs = atrs.filter((a: any) => {
        if (a.approval_status) {
          return String(a.approval_status).toUpperCase() !== 'REJECTED';
        }
        if (a.status) {
          return !['CLOSED', 'REJECTED'].includes(String(a.status).toUpperCase());
        }
        return !(a.hr_manager_signed_at && a.ops_manager_signed_at && a.director_signed_at);
      }).length;
      const interviewsScheduled = filteredCandidates.filter((c: any) => {
        const status = String(c?.status || '').toLowerCase();
        return !!c?.interview_due_date && status !== 'rejected';
      }).length;
      const offersPending = filteredCandidates.filter((c: any) => c.status === 'Onboarded').length;

      const openedCaseStudies = filteredCaseStudies.filter((cs: any) => cs.status === 'OPENED').length;
      const underReviewCaseStudies = filteredCaseStudies.filter((cs: any) => cs.status === 'UNDER_REVIEW').length;
      const resolvedCaseStudies = filteredCaseStudies.filter((cs: any) => cs.status === 'CLOSED').length;
      const activeInvestigations = filteredInvestigations.filter((i: any) => i.status === 'ACTIVE').length;

      // Calculate salary metrics
      const activeContracts = filteredContracts.filter((c: any) => c.status === 'ACTIVE');
      const activeContractsWithSalary = activeContracts.filter((c: any) => {
        const val = parseFloat(c?.basic_salary ?? c?.basic ?? c?.gross ?? 0);
        return Number.isFinite(val) && val > 0;
      });
      const usePayrollEntries = activeContractsWithSalary.length === 0 && payrollEntries.length > 0;
      const salarySource = usePayrollEntries ? payrollEntries : activeContractsWithSalary;

      const readSalary = (item: any) => {
        const value = item?.basic_salary ?? item?.basic ?? item?.gross ?? item?.net;
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const readNet = (item: any) => {
        const value = item?.net ?? item?.net_salary ?? item?.gross ?? item?.basic ?? item?.basic_salary;
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const avgGross = salarySource.length > 0
        ? salarySource.reduce((sum: number, item: any) => sum + readSalary(item), 0) / salarySource.length
        : 0;
      const avgNet = salarySource.length > 0
        ? salarySource.reduce((sum: number, item: any) => sum + readNet(item), 0) / salarySource.length
        : 0;
      const totalPayroll = salarySource.reduce((sum: number, item: any) => sum + readSalary(item), 0);

      // Department distribution (fallback computed)
      const deptCounts: { [key: string]: number } = {};
      filteredEmployees.forEach((e: any) => {
        const deptName = e.department_name || 'Unassigned';
        deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
      });
      let departmentDistribution = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));

      // Calculate offer acceptance rate
      const totalOffers = filteredCandidates.filter((c: any) => c.status === 'Onboarded' || c.status === 'Rejected').length;
      const acceptedOffers = filteredCandidates.filter((c: any) => c.status === 'Onboarded').length;
      const offerAcceptanceRate = totalOffers > 0 ? (acceptedOffers / totalOffers) * 100 : 0;

      // Try to use dedicated performance analytics endpoints when available
      const [kpiSummary, recruitFunnel, deptDist, monthlySummary] = await Promise.allSettled([
        http.get('/api/v1/performance/kpis/summary/'),
        http.get('/api/v1/performance/kpis/recruitment_funnel/'),
        http.get('/api/v1/performance/kpis/department_distribution/'),
        http.get('/api/v1/performance/kpis/monthly_performance_summary/'),
      ]);

      // KPIs - use real data only
      const kpis = (() => {
        if (kpiSummary.status === 'fulfilled' && kpiSummary.value?.data) {
          const d = kpiSummary.value.data as any;
          return {
            turnover_rate: Number(d.turnover_rate) || 0,
            turnover_change: Number(d.turnover_change) || 0,
            overtime_rate: Number(d.overtime_rate) || 0,
            overtime_change: Number(d.overtime_change) || 0,
            training_roi: Number(d.training_roi) || 0,
            roi_change: Number(d.roi_change) || 0,
            offer_acceptance: Number(d.offer_acceptance) || 0,
            acceptance_change: Number(d.acceptance_change) || 0,
            retention_rate: totalAllEmployees > 0 ? (totalEmployees / totalAllEmployees) * 100 : 0,
            retention_change: 0,
          };
        }
        return {
          turnover_rate: totalAllEmployees > 0 ? (terminatedEmployees / totalAllEmployees) * 100 : 0,
          turnover_change: 0,
          overtime_rate: 0,
          overtime_change: 0,
          training_roi: 0,
          roi_change: 0,
          offer_acceptance: offerAcceptanceRate,
          acceptance_change: 0,
          retention_rate: totalAllEmployees > 0 ? (totalEmployees / totalAllEmployees) * 100 : 0,
          retention_change: 0,
        };
      })();

      // Keep department distribution computed from filtered employees

      // Recruitment funnel via endpoint if present
      const recruitmentFunnel = (recruitFunnel.status === 'fulfilled' && Array.isArray(recruitFunnel.value?.data))
        ? (recruitFunnel.value.data as any[])
        : this.generateRecruitmentFunnel(filteredCandidates);

      // Monthly summary: Use backend endpoint if available
      let monthlySummaryData = this.generateMonthlySummary(
        filteredEmployees,
        filteredEngagements,
        filteredTerminations,
        filteredLeaveRequests,
        filteredSickNotes,
        filteredAbsenteeism,
        filteredTrainings,
        filteredCandidates
      );
      if (monthlySummary && monthlySummary.status === 'fulfilled' && Array.isArray(monthlySummary.value?.data) && monthlySummary.value.data.length > 0) {
        // Use actual endpoint data for monthly summary
        monthlySummaryData = monthlySummary.value.data.map((row: any) => ({
          month: row.month || 'Unknown',
          active: Number(row.active) || 0,
          engagements: Number(row.engagements) || 0,
          terminations: Number(row.terminations) || 0,
          leaves: Number(row.leaves) || 0,
          sickNotes: Number(row.sickNotes) || 0,
          absenteeism: Number(row.absenteeism) || 0,
          completed: Number(row.completed) || 0,
          offers: Number(row.offers) || 0,
        }));
      }
      // Ensure it's always an array
      if (!Array.isArray(monthlySummaryData)) {
        monthlySummaryData = [];
      }

      let employeeTrendData = this.generateEmployeeTrend(filteredEmployees);
      if (employeeTrendResult.status === 'fulfilled' && employeeTrendResult.value?.data) {
        const trend = employeeTrendResult.value.data;
        if (Array.isArray(trend)) {
          employeeTrendData = trend.map((row: any) => ({
            month: row.month || 'Unknown',
            active: Number(row.active) || 0,
            inactive: Number(row.inactive) || 0,
            on_leave: Number(row.on_leave) || 0,
          }));
        } else if (typeof trend === 'object') {
          employeeTrendData = [{
            month: 'Current',
            active: Number(trend.active) || 0,
            inactive: Number(trend.inactive) || 0,
            on_leave: Number(trend.on_leave) || 0,
          }];
        }
      }

      // Build analytics data structure
      return {
        kpis,
        hcm: {
          total_employees: totalEmployees,
          active_engagements: activeEngagements,
          pending_terminations: pendingTerminations,
          departments: filteredDepartments.length,
        },
        recruitment: {
          active_atrs: activeAtrs,
          total_candidates: filteredCandidates.length,
          interviews_scheduled: interviewsScheduled,
          offers_pending: offersPending,
        },
        salary: {
          avg_gross: avgGross,
          avg_net: avgNet,
          total_payroll: totalPayroll,
          salary_ranges: this.calculateSalaryRangeCount(salarySource),
        },
        case_studies: {
          opened: openedCaseStudies,
          under_review: underReviewCaseStudies,
          resolved: resolvedCaseStudies,
          investigations_active: activeInvestigations,
        },
        employee_trend: employeeTrendData,
        department_distribution: departmentDistribution,
        training_completion: this.generateTrainingTrend(filteredTrainings),
        recruitment_funnel: recruitmentFunnel,
        monthly_summary: monthlySummaryData,
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  generateEmployeeTrend(_employees: any[]) {
    // Return empty array if no data - do not generate synthetic data
    return [];
  },

  generateTrainingTrend(trainings: any[]) {
    // Return actual training data
    const completed = trainings.filter((t: any) => t.status === 'COMPLETED').length;
    const pending = trainings.filter((t: any) => ['SCHEDULED', 'IN_PROGRESS'].includes(t.status)).length;

    // Return data in expected format for chart
    return [
      { month: 'Completed', completed: completed, pending: 0 },
      { month: 'Pending', completed: 0, pending: pending },
    ];
  },

  generateRecruitmentFunnel(candidates: any[]) {
    const pipeline = candidates.filter((c: any) => c.status === 'Pipeline').length;
    const onboarded = candidates.filter((c: any) => c.status === 'Onboarded').length;
    const rejected = candidates.filter((c: any) => c.status === 'Rejected').length;

    return [
      { stage: 'Pipeline', count: pipeline },
      { stage: 'Onboarded', count: onboarded },
      { stage: 'Rejected', count: rejected },
    ];
  },

  generateMonthlySummary(
    employees: any[],
    engagements: any[],
    terminations: any[],
    leaves: any[],
    sickNotes: any[],
    absenteeism: any[],
    trainings: any[],
    candidates: any[]
  ) {
    const monthBuckets: Record<string, {
      month: string;
      active: number;
      engagements: number;
      terminations: number;
      leaves: number;
      sickNotes: number;
      absenteeism: number;
      trainingCompleted: number;
      trainingTotal: number;
      offers: number;
    }> = {};

    const toMonthKey = (raw: any) => {
      if (!raw) return null;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return null;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    };

    const toMonthLabel = (key: string) => {
      const [year, month] = key.split('-').map((v) => Number(v));
      const d = new Date(year, month - 1, 1);
      return `${d.toLocaleString('en-US', { month: 'short' })} ${year}`;
    };

    const ensureBucket = (key: string) => {
      if (!monthBuckets[key]) {
        monthBuckets[key] = {
          month: toMonthLabel(key),
          active: 0,
          engagements: 0,
          terminations: 0,
          leaves: 0,
          sickNotes: 0,
          absenteeism: 0,
          trainingCompleted: 0,
          trainingTotal: 0,
          offers: 0,
        };
      }
      return monthBuckets[key];
    };

    // Active employees by hire month
    employees
      .filter((e: any) => e.employment_status === 'ACTIVE')
      .forEach((e: any) => {
        const key = toMonthKey(e.hire_date || e.created_at);
        if (!key) return;
        ensureBucket(key).active += 1;
      });

    engagements.forEach((e: any) => {
      const key = toMonthKey(e.engagement_date || e.created_at);
      if (!key) return;
      ensureBucket(key).engagements += 1;
    });

    terminations.forEach((t: any) => {
      const key = toMonthKey(t.termination_date || t.created_at);
      if (!key) return;
      ensureBucket(key).terminations += 1;
    });

    leaves.forEach((l: any) => {
      const key = toMonthKey(l.start_date || l.created_at);
      if (!key) return;
      ensureBucket(key).leaves += 1;
    });

    sickNotes.forEach((s: any) => {
      const key = toMonthKey(s.start_date || s.created_at);
      if (!key) return;
      ensureBucket(key).sickNotes += 1;
    });

    absenteeism.forEach((a: any) => {
      const key = toMonthKey(a.date || a.created_at);
      if (!key) return;
      ensureBucket(key).absenteeism += 1;
    });

    trainings.forEach((t: any) => {
      const key = toMonthKey(t.completion_date || t.scheduled_date || t.created_at);
      if (!key) return;
      const bucket = ensureBucket(key);
      bucket.trainingTotal += 1;
      if (t.status === 'COMPLETED') {
        bucket.trainingCompleted += 1;
      }
    });

    candidates
      .filter((c: any) => c.status === 'Onboarded' || c.status === 'HIRED')
      .forEach((c: any) => {
        const key = toMonthKey(c.engaged_date || c.created_at);
        if (!key) return;
        ensureBucket(key).offers += 1;
      });

    return Object.keys(monthBuckets)
      .sort()
      .map((key) => {
        const bucket = monthBuckets[key];
        const completionRate = bucket.trainingTotal > 0
          ? Math.round((bucket.trainingCompleted / bucket.trainingTotal) * 100)
          : 0;
        return {
          month: bucket.month,
          active: bucket.active,
          engagements: bucket.engagements,
          terminations: bucket.terminations,
          leaves: bucket.leaves,
          sickNotes: bucket.sickNotes,
          absenteeism: bucket.absenteeism,
          completed: completionRate,
          offers: bucket.offers,
        };
      })
      .reverse();
  },

  calculateSalaryRangeCount(contracts: any[]) {
    const ranges = [
      { min: 0, max: 5000 },
      { min: 5000, max: 10000 },
      { min: 10000, max: 15000 },
      { min: 15000, max: 20000 },
      { min: 20000, max: 30000 },
      { min: 30000, max: 40000 },
      { min: 40000, max: 50000 },
      { min: 50000, max: Number.MAX_SAFE_INTEGER },
    ];

    const filled = new Set<number>();
    contracts.forEach((c: any) => {
      const raw = c?.basic_salary ?? c?.basic ?? c?.gross ?? c?.net ?? c?.net_salary;
      const salary = parseFloat(raw);
      if (Number.isNaN(salary)) return;
      ranges.forEach((r, idx) => {
        if (salary >= r.min && salary < r.max) {
          filled.add(idx);
        }
      });
    });

    return filled.size;
  },
};
