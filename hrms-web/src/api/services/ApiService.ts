/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ATR } from '../models/ATR';
import type { Candidate } from '../models/Candidate';
import type { CaseStudy } from '../models/CaseStudy';
import type { ComplianceAlert } from '../models/ComplianceAlert';
import type { Contract } from '../models/Contract';
import type { Department } from '../models/Department';
import type { EmployeeDetail } from '../models/EmployeeDetail';
import type { Engagement } from '../models/Engagement';
import type { Hearing } from '../models/Hearing';
import type { Interview } from '../models/Interview';
import type { Investigation } from '../models/Investigation';
import type { KPI } from '../models/KPI';
import type { Medical } from '../models/Medical';
import type { PaginatedATRList } from '../models/PaginatedATRList';
import type { PaginatedCandidateList } from '../models/PaginatedCandidateList';
import type { PaginatedCaseStudyList } from '../models/PaginatedCaseStudyList';
import type { PaginatedComplianceAlertList } from '../models/PaginatedComplianceAlertList';
import type { PaginatedContractList } from '../models/PaginatedContractList';
import type { PaginatedDepartmentList } from '../models/PaginatedDepartmentList';
import type { PaginatedEmployeeListList } from '../models/PaginatedEmployeeListList';
import type { PaginatedEngagementList } from '../models/PaginatedEngagementList';
import type { PaginatedHearingList } from '../models/PaginatedHearingList';
import type { PaginatedInterviewList } from '../models/PaginatedInterviewList';
import type { PaginatedInvestigationList } from '../models/PaginatedInvestigationList';
import type { PaginatedKPIList } from '../models/PaginatedKPIList';
import type { PaginatedMedicalList } from '../models/PaginatedMedicalList';
import type { PaginatedPayrollComponentList } from '../models/PaginatedPayrollComponentList';
import type { PaginatedPayrollEntryList } from '../models/PaginatedPayrollEntryList';
import type { PaginatedPermitList } from '../models/PaginatedPermitList';
import type { PaginatedProbationList } from '../models/PaginatedProbationList';
import type { PaginatedReportList } from '../models/PaginatedReportList';
import type { PaginatedTerminationList } from '../models/PaginatedTerminationList';
import type { PaginatedTrainingList } from '../models/PaginatedTrainingList';
import type { PatchedATR } from '../models/PatchedATR';
import type { PatchedCandidate } from '../models/PatchedCandidate';
import type { PatchedCaseStudy } from '../models/PatchedCaseStudy';
import type { PatchedComplianceAlert } from '../models/PatchedComplianceAlert';
import type { PatchedContract } from '../models/PatchedContract';
import type { PatchedDepartment } from '../models/PatchedDepartment';
import type { PatchedEmployeeDetail } from '../models/PatchedEmployeeDetail';
import type { PatchedEngagement } from '../models/PatchedEngagement';
import type { PatchedHearing } from '../models/PatchedHearing';
import type { PatchedInterview } from '../models/PatchedInterview';
import type { PatchedInvestigation } from '../models/PatchedInvestigation';
import type { PatchedKPI } from '../models/PatchedKPI';
import type { PatchedMedical } from '../models/PatchedMedical';
import type { PatchedPayrollComponent } from '../models/PatchedPayrollComponent';
import type { PatchedPayrollEntry } from '../models/PatchedPayrollEntry';
import type { PatchedPermit } from '../models/PatchedPermit';
import type { PatchedProbation } from '../models/PatchedProbation';
import type { PatchedReport } from '../models/PatchedReport';
import type { PatchedTermination } from '../models/PatchedTermination';
import type { PatchedTraining } from '../models/PatchedTraining';
import type { PayrollComponent } from '../models/PayrollComponent';
import type { PayrollEntry } from '../models/PayrollEntry';
import type { Permit } from '../models/Permit';
import type { Probation } from '../models/Probation';
import type { Report } from '../models/Report';
import type { Termination } from '../models/Termination';
import type { TokenObtainPair } from '../models/TokenObtainPair';
import type { TokenRefresh } from '../models/TokenRefresh';
import type { Training } from '../models/Training';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiService {
    /**
     * OpenApi3 schema for this API. Format can be selected via content negotiation.
     *
     * - YAML: application/vnd.oai.openapi
     * - JSON: application/vnd.oai.openapi+json
     * @param format
     * @param lang
     * @returns any
     * @throws ApiError
     */
    public static apiSchemaRetrieve(
        format?: 'json' | 'yaml',
        lang?: 'af' | 'ar' | 'ar-dz' | 'ast' | 'az' | 'be' | 'bg' | 'bn' | 'br' | 'bs' | 'ca' | 'ckb' | 'cs' | 'cy' | 'da' | 'de' | 'dsb' | 'el' | 'en' | 'en-au' | 'en-gb' | 'eo' | 'es' | 'es-ar' | 'es-co' | 'es-mx' | 'es-ni' | 'es-ve' | 'et' | 'eu' | 'fa' | 'fi' | 'fr' | 'fy' | 'ga' | 'gd' | 'gl' | 'he' | 'hi' | 'hr' | 'hsb' | 'hu' | 'hy' | 'ia' | 'id' | 'ig' | 'io' | 'is' | 'it' | 'ja' | 'ka' | 'kab' | 'kk' | 'km' | 'kn' | 'ko' | 'ky' | 'lb' | 'lt' | 'lv' | 'mk' | 'ml' | 'mn' | 'mr' | 'ms' | 'my' | 'nb' | 'ne' | 'nl' | 'nn' | 'os' | 'pa' | 'pl' | 'pt' | 'pt-br' | 'ro' | 'ru' | 'sk' | 'sl' | 'sq' | 'sr' | 'sr-latn' | 'sv' | 'sw' | 'ta' | 'te' | 'tg' | 'th' | 'tk' | 'tr' | 'tt' | 'udm' | 'uk' | 'ur' | 'uz' | 'vi' | 'zh-hans' | 'zh-hant',
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/schema/',
            query: {
                'format': format,
                'lang': lang,
            },
        });
    }
    /**
     * ViewSet for case studies linking reports to hearings/investigations.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @param status * `OPENED` - Opened
     * * `UNDER_REVIEW` - Under Review
     * * `HEARING_PENDING` - Hearing Pending
     * * `INVESTIGATION_PENDING` - Investigation Pending
     * * `VERDICT_PENDING` - Verdict Pending
     * * `CLOSED` - Closed
     * @returns PaginatedCaseStudyList
     * @throws ApiError
     */
    public static apiV1ActivitiesCaseStudiesList(
        ordering?: string,
        page?: number,
        search?: string,
        status?: 'CLOSED' | 'HEARING_PENDING' | 'INVESTIGATION_PENDING' | 'OPENED' | 'UNDER_REVIEW' | 'VERDICT_PENDING',
    ): CancelablePromise<PaginatedCaseStudyList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/activities/case-studies/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
                'status': status,
            },
        });
    }
    /**
     * ViewSet for case studies linking reports to hearings/investigations.
     * @param requestBody
     * @returns CaseStudy
     * @throws ApiError
     */
    public static apiV1ActivitiesCaseStudiesCreate(
        requestBody: CaseStudy,
    ): CancelablePromise<CaseStudy> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/activities/case-studies/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for case studies linking reports to hearings/investigations.
     * @param id A unique integer value identifying this case study.
     * @returns CaseStudy
     * @throws ApiError
     */
    public static apiV1ActivitiesCaseStudiesRetrieve(
        id: number,
    ): CancelablePromise<CaseStudy> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/activities/case-studies/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for case studies linking reports to hearings/investigations.
     * @param id A unique integer value identifying this case study.
     * @param requestBody
     * @returns CaseStudy
     * @throws ApiError
     */
    public static apiV1ActivitiesCaseStudiesUpdate(
        id: number,
        requestBody: CaseStudy,
    ): CancelablePromise<CaseStudy> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/activities/case-studies/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for case studies linking reports to hearings/investigations.
     * @param id A unique integer value identifying this case study.
     * @param requestBody
     * @returns CaseStudy
     * @throws ApiError
     */
    public static apiV1ActivitiesCaseStudiesPartialUpdate(
        id: number,
        requestBody?: PatchedCaseStudy,
    ): CancelablePromise<CaseStudy> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/activities/case-studies/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for case studies linking reports to hearings/investigations.
     * @param id A unique integer value identifying this case study.
     * @returns void
     * @throws ApiError
     */
    public static apiV1ActivitiesCaseStudiesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/activities/case-studies/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for disciplinary hearings.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @returns PaginatedHearingList
     * @throws ApiError
     */
    public static apiV1ActivitiesHearingsList(
        ordering?: string,
        page?: number,
    ): CancelablePromise<PaginatedHearingList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/activities/hearings/',
            query: {
                'ordering': ordering,
                'page': page,
            },
        });
    }
    /**
     * ViewSet for disciplinary hearings.
     * @param requestBody
     * @returns Hearing
     * @throws ApiError
     */
    public static apiV1ActivitiesHearingsCreate(
        requestBody: Hearing,
    ): CancelablePromise<Hearing> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/activities/hearings/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for disciplinary hearings.
     * @param id A unique integer value identifying this hearing.
     * @returns Hearing
     * @throws ApiError
     */
    public static apiV1ActivitiesHearingsRetrieve(
        id: number,
    ): CancelablePromise<Hearing> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/activities/hearings/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for disciplinary hearings.
     * @param id A unique integer value identifying this hearing.
     * @param requestBody
     * @returns Hearing
     * @throws ApiError
     */
    public static apiV1ActivitiesHearingsUpdate(
        id: number,
        requestBody: Hearing,
    ): CancelablePromise<Hearing> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/activities/hearings/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for disciplinary hearings.
     * @param id A unique integer value identifying this hearing.
     * @param requestBody
     * @returns Hearing
     * @throws ApiError
     */
    public static apiV1ActivitiesHearingsPartialUpdate(
        id: number,
        requestBody?: PatchedHearing,
    ): CancelablePromise<Hearing> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/activities/hearings/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for disciplinary hearings.
     * @param id A unique integer value identifying this hearing.
     * @returns void
     * @throws ApiError
     */
    public static apiV1ActivitiesHearingsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/activities/hearings/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for candidate interviews.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedInterviewList
     * @throws ApiError
     */
    public static apiV1ActivitiesInterviewsList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedInterviewList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/activities/interviews/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for candidate interviews.
     * @param requestBody
     * @returns Interview
     * @throws ApiError
     */
    public static apiV1ActivitiesInterviewsCreate(
        requestBody: Interview,
    ): CancelablePromise<Interview> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/activities/interviews/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for candidate interviews.
     * @param id A unique integer value identifying this interview.
     * @returns Interview
     * @throws ApiError
     */
    public static apiV1ActivitiesInterviewsRetrieve(
        id: number,
    ): CancelablePromise<Interview> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/activities/interviews/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for candidate interviews.
     * @param id A unique integer value identifying this interview.
     * @param requestBody
     * @returns Interview
     * @throws ApiError
     */
    public static apiV1ActivitiesInterviewsUpdate(
        id: number,
        requestBody: Interview,
    ): CancelablePromise<Interview> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/activities/interviews/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for candidate interviews.
     * @param id A unique integer value identifying this interview.
     * @param requestBody
     * @returns Interview
     * @throws ApiError
     */
    public static apiV1ActivitiesInterviewsPartialUpdate(
        id: number,
        requestBody?: PatchedInterview,
    ): CancelablePromise<Interview> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/activities/interviews/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for candidate interviews.
     * @param id A unique integer value identifying this interview.
     * @returns void
     * @throws ApiError
     */
    public static apiV1ActivitiesInterviewsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/activities/interviews/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for investigations.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @returns PaginatedInvestigationList
     * @throws ApiError
     */
    public static apiV1ActivitiesInvestigationsList(
        ordering?: string,
        page?: number,
    ): CancelablePromise<PaginatedInvestigationList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/activities/investigations/',
            query: {
                'ordering': ordering,
                'page': page,
            },
        });
    }
    /**
     * ViewSet for investigations.
     * @param requestBody
     * @returns Investigation
     * @throws ApiError
     */
    public static apiV1ActivitiesInvestigationsCreate(
        requestBody: Investigation,
    ): CancelablePromise<Investigation> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/activities/investigations/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for investigations.
     * @param id A unique integer value identifying this investigation.
     * @returns Investigation
     * @throws ApiError
     */
    public static apiV1ActivitiesInvestigationsRetrieve(
        id: number,
    ): CancelablePromise<Investigation> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/activities/investigations/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for investigations.
     * @param id A unique integer value identifying this investigation.
     * @param requestBody
     * @returns Investigation
     * @throws ApiError
     */
    public static apiV1ActivitiesInvestigationsUpdate(
        id: number,
        requestBody: Investigation,
    ): CancelablePromise<Investigation> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/activities/investigations/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for investigations.
     * @param id A unique integer value identifying this investigation.
     * @param requestBody
     * @returns Investigation
     * @throws ApiError
     */
    public static apiV1ActivitiesInvestigationsPartialUpdate(
        id: number,
        requestBody?: PatchedInvestigation,
    ): CancelablePromise<Investigation> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/activities/investigations/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for investigations.
     * @param id A unique integer value identifying this investigation.
     * @returns void
     * @throws ApiError
     */
    public static apiV1ActivitiesInvestigationsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/activities/investigations/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for KPI tracking.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @returns PaginatedKPIList
     * @throws ApiError
     */
    public static apiV1ActivitiesKpisList(
        ordering?: string,
        page?: number,
    ): CancelablePromise<PaginatedKPIList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/activities/kpis/',
            query: {
                'ordering': ordering,
                'page': page,
            },
        });
    }
    /**
     * ViewSet for KPI tracking.
     * @param requestBody
     * @returns KPI
     * @throws ApiError
     */
    public static apiV1ActivitiesKpisCreate(
        requestBody: KPI,
    ): CancelablePromise<KPI> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/activities/kpis/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for KPI tracking.
     * @param id A unique integer value identifying this kpi.
     * @returns KPI
     * @throws ApiError
     */
    public static apiV1ActivitiesKpisRetrieve(
        id: number,
    ): CancelablePromise<KPI> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/activities/kpis/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for KPI tracking.
     * @param id A unique integer value identifying this kpi.
     * @param requestBody
     * @returns KPI
     * @throws ApiError
     */
    public static apiV1ActivitiesKpisUpdate(
        id: number,
        requestBody: KPI,
    ): CancelablePromise<KPI> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/activities/kpis/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for KPI tracking.
     * @param id A unique integer value identifying this kpi.
     * @param requestBody
     * @returns KPI
     * @throws ApiError
     */
    public static apiV1ActivitiesKpisPartialUpdate(
        id: number,
        requestBody?: PatchedKPI,
    ): CancelablePromise<KPI> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/activities/kpis/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for KPI tracking.
     * @param id A unique integer value identifying this kpi.
     * @returns void
     * @throws ApiError
     */
    public static apiV1ActivitiesKpisDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/activities/kpis/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for safety, complaint, grievance, and disciplinary reports.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param reportType
     * @param search A search term.
     * @param severity * `LOW` - Low
     * * `MEDIUM` - Medium
     * * `HIGH` - High
     * * `CRITICAL` - Critical
     * @param status * `DRAFT` - Draft
     * * `SUBMITTED` - Submitted
     * * `ACKNOWLEDGED` - Acknowledged
     * * `ESCALATED` - Escalated
     * * `CLOSED` - Closed
     * @returns PaginatedReportList
     * @throws ApiError
     */
    public static apiV1ActivitiesReportsList(
        ordering?: string,
        page?: number,
        reportType?: number,
        search?: string,
        severity?: 'CRITICAL' | 'HIGH' | 'LOW' | 'MEDIUM',
        status?: 'ACKNOWLEDGED' | 'CLOSED' | 'DRAFT' | 'ESCALATED' | 'SUBMITTED',
    ): CancelablePromise<PaginatedReportList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/activities/reports/',
            query: {
                'ordering': ordering,
                'page': page,
                'report_type': reportType,
                'search': search,
                'severity': severity,
                'status': status,
            },
        });
    }
    /**
     * ViewSet for safety, complaint, grievance, and disciplinary reports.
     * @param requestBody
     * @returns Report
     * @throws ApiError
     */
    public static apiV1ActivitiesReportsCreate(
        requestBody: Report,
    ): CancelablePromise<Report> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/activities/reports/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for safety, complaint, grievance, and disciplinary reports.
     * @param id A unique integer value identifying this report.
     * @returns Report
     * @throws ApiError
     */
    public static apiV1ActivitiesReportsRetrieve(
        id: number,
    ): CancelablePromise<Report> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/activities/reports/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for safety, complaint, grievance, and disciplinary reports.
     * @param id A unique integer value identifying this report.
     * @param requestBody
     * @returns Report
     * @throws ApiError
     */
    public static apiV1ActivitiesReportsUpdate(
        id: number,
        requestBody: Report,
    ): CancelablePromise<Report> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/activities/reports/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for safety, complaint, grievance, and disciplinary reports.
     * @param id A unique integer value identifying this report.
     * @param requestBody
     * @returns Report
     * @throws ApiError
     */
    public static apiV1ActivitiesReportsPartialUpdate(
        id: number,
        requestBody?: PatchedReport,
    ): CancelablePromise<Report> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/activities/reports/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for safety, complaint, grievance, and disciplinary reports.
     * @param id A unique integer value identifying this report.
     * @returns void
     * @throws ApiError
     */
    public static apiV1ActivitiesReportsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/activities/reports/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Takes a set of user credentials and returns an access and refresh JSON web
     * token pair to prove the authentication of those credentials.
     * @param requestBody
     * @returns TokenObtainPair
     * @throws ApiError
     */
    public static apiV1AuthTokenCreate(
        requestBody: TokenObtainPair,
    ): CancelablePromise<TokenObtainPair> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/token/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Takes a refresh type JSON web token and returns an access type JSON web
     * token if the refresh token is valid.
     * @param requestBody
     * @returns TokenRefresh
     * @throws ApiError
     */
    public static apiV1AuthTokenRefreshCreate(
        requestBody: TokenRefresh,
    ): CancelablePromise<TokenRefresh> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/token/refresh/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee contracts.
     * @param contractType
     * @param employee
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param status * `ACTIVE` - Active
     * * `EXPIRED` - Expired
     * * `RENEWED` - Renewed
     * * `TERMINATED` - Terminated
     * * `PENDING_RENEWAL` - Pending Renewal
     * @returns PaginatedContractList
     * @throws ApiError
     */
    public static apiV1HcmContractsList(
        contractType?: number,
        employee?: number,
        ordering?: string,
        page?: number,
        status?: 'ACTIVE' | 'EXPIRED' | 'PENDING_RENEWAL' | 'RENEWED' | 'TERMINATED',
    ): CancelablePromise<PaginatedContractList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/hcm/contracts/',
            query: {
                'contract_type': contractType,
                'employee': employee,
                'ordering': ordering,
                'page': page,
                'status': status,
            },
        });
    }
    /**
     * ViewSet for employee contracts.
     * @param requestBody
     * @returns Contract
     * @throws ApiError
     */
    public static apiV1HcmContractsCreate(
        requestBody: Contract,
    ): CancelablePromise<Contract> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/hcm/contracts/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee contracts.
     * @param id A unique integer value identifying this contract.
     * @returns Contract
     * @throws ApiError
     */
    public static apiV1HcmContractsRetrieve(
        id: number,
    ): CancelablePromise<Contract> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/hcm/contracts/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee contracts.
     * @param id A unique integer value identifying this contract.
     * @param requestBody
     * @returns Contract
     * @throws ApiError
     */
    public static apiV1HcmContractsUpdate(
        id: number,
        requestBody: Contract,
    ): CancelablePromise<Contract> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/hcm/contracts/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee contracts.
     * @param id A unique integer value identifying this contract.
     * @param requestBody
     * @returns Contract
     * @throws ApiError
     */
    public static apiV1HcmContractsPartialUpdate(
        id: number,
        requestBody?: PatchedContract,
    ): CancelablePromise<Contract> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/hcm/contracts/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee contracts.
     * @param id A unique integer value identifying this contract.
     * @returns void
     * @throws ApiError
     */
    public static apiV1HcmContractsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/hcm/contracts/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for departments.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedDepartmentList
     * @throws ApiError
     */
    public static apiV1HcmDepartmentsList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedDepartmentList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/hcm/departments/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for departments.
     * @param requestBody
     * @returns Department
     * @throws ApiError
     */
    public static apiV1HcmDepartmentsCreate(
        requestBody: Department,
    ): CancelablePromise<Department> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/hcm/departments/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for departments.
     * @param id A unique integer value identifying this department.
     * @returns Department
     * @throws ApiError
     */
    public static apiV1HcmDepartmentsRetrieve(
        id: number,
    ): CancelablePromise<Department> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/hcm/departments/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for departments.
     * @param id A unique integer value identifying this department.
     * @param requestBody
     * @returns Department
     * @throws ApiError
     */
    public static apiV1HcmDepartmentsUpdate(
        id: number,
        requestBody: Department,
    ): CancelablePromise<Department> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/hcm/departments/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for departments.
     * @param id A unique integer value identifying this department.
     * @param requestBody
     * @returns Department
     * @throws ApiError
     */
    public static apiV1HcmDepartmentsPartialUpdate(
        id: number,
        requestBody?: PatchedDepartment,
    ): CancelablePromise<Department> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/hcm/departments/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for departments.
     * @param id A unique integer value identifying this department.
     * @returns void
     * @throws ApiError
     */
    public static apiV1HcmDepartmentsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/hcm/departments/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for Employee CRUD operations.
     * List view uses EmployeeListSerializer, detail uses EmployeeDetailSerializer.
     * @param category
     * @param department
     * @param employmentStatus * `ACTIVE` - Active
     * * `INACTIVE` - Inactive
     * * `SUSPENDED` - Suspended
     * * `ON_LEAVE` - On Leave
     * * `TERMINATED` - Terminated
     * @param gender * `M` - Male
     * * `F` - Female
     * * `OTHER` - Other
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedEmployeeListList
     * @throws ApiError
     */
    public static apiV1HcmEmployeesList(
        category?: number,
        department?: number,
        employmentStatus?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED',
        gender?: 'F' | 'M' | 'OTHER',
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedEmployeeListList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/hcm/employees/',
            query: {
                'category': category,
                'department': department,
                'employment_status': employmentStatus,
                'gender': gender,
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for Employee CRUD operations.
     * List view uses EmployeeListSerializer, detail uses EmployeeDetailSerializer.
     * @param requestBody
     * @returns EmployeeDetail
     * @throws ApiError
     */
    public static apiV1HcmEmployeesCreate(
        requestBody: EmployeeDetail,
    ): CancelablePromise<EmployeeDetail> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/hcm/employees/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for Employee CRUD operations.
     * List view uses EmployeeListSerializer, detail uses EmployeeDetailSerializer.
     * @param id A unique integer value identifying this employee.
     * @returns EmployeeDetail
     * @throws ApiError
     */
    public static apiV1HcmEmployeesRetrieve(
        id: number,
    ): CancelablePromise<EmployeeDetail> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/hcm/employees/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for Employee CRUD operations.
     * List view uses EmployeeListSerializer, detail uses EmployeeDetailSerializer.
     * @param id A unique integer value identifying this employee.
     * @param requestBody
     * @returns EmployeeDetail
     * @throws ApiError
     */
    public static apiV1HcmEmployeesUpdate(
        id: number,
        requestBody: EmployeeDetail,
    ): CancelablePromise<EmployeeDetail> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/hcm/employees/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for Employee CRUD operations.
     * List view uses EmployeeListSerializer, detail uses EmployeeDetailSerializer.
     * @param id A unique integer value identifying this employee.
     * @param requestBody
     * @returns EmployeeDetail
     * @throws ApiError
     */
    public static apiV1HcmEmployeesPartialUpdate(
        id: number,
        requestBody?: PatchedEmployeeDetail,
    ): CancelablePromise<EmployeeDetail> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/hcm/employees/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for Employee CRUD operations.
     * List view uses EmployeeListSerializer, detail uses EmployeeDetailSerializer.
     * @param id A unique integer value identifying this employee.
     * @returns void
     * @throws ApiError
     */
    public static apiV1HcmEmployeesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/hcm/employees/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee engagements.
     * @param employee
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @returns PaginatedEngagementList
     * @throws ApiError
     */
    public static apiV1HcmEngagementsList(
        employee?: number,
        ordering?: string,
        page?: number,
    ): CancelablePromise<PaginatedEngagementList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/hcm/engagements/',
            query: {
                'employee': employee,
                'ordering': ordering,
                'page': page,
            },
        });
    }
    /**
     * ViewSet for employee engagements.
     * @param requestBody
     * @returns Engagement
     * @throws ApiError
     */
    public static apiV1HcmEngagementsCreate(
        requestBody: Engagement,
    ): CancelablePromise<Engagement> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/hcm/engagements/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee engagements.
     * @param id A unique integer value identifying this engagement.
     * @returns Engagement
     * @throws ApiError
     */
    public static apiV1HcmEngagementsRetrieve(
        id: number,
    ): CancelablePromise<Engagement> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/hcm/engagements/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee engagements.
     * @param id A unique integer value identifying this engagement.
     * @param requestBody
     * @returns Engagement
     * @throws ApiError
     */
    public static apiV1HcmEngagementsUpdate(
        id: number,
        requestBody: Engagement,
    ): CancelablePromise<Engagement> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/hcm/engagements/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee engagements.
     * @param id A unique integer value identifying this engagement.
     * @param requestBody
     * @returns Engagement
     * @throws ApiError
     */
    public static apiV1HcmEngagementsPartialUpdate(
        id: number,
        requestBody?: PatchedEngagement,
    ): CancelablePromise<Engagement> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/hcm/engagements/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee engagements.
     * @param id A unique integer value identifying this engagement.
     * @returns void
     * @throws ApiError
     */
    public static apiV1HcmEngagementsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/hcm/engagements/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee terminations.
     * @param employee
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param terminationReason
     * @returns PaginatedTerminationList
     * @throws ApiError
     */
    public static apiV1HcmTerminationsList(
        employee?: number,
        ordering?: string,
        page?: number,
        terminationReason?: number,
    ): CancelablePromise<PaginatedTerminationList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/hcm/terminations/',
            query: {
                'employee': employee,
                'ordering': ordering,
                'page': page,
                'termination_reason': terminationReason,
            },
        });
    }
    /**
     * ViewSet for employee terminations.
     * @param requestBody
     * @returns Termination
     * @throws ApiError
     */
    public static apiV1HcmTerminationsCreate(
        requestBody: Termination,
    ): CancelablePromise<Termination> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/hcm/terminations/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee terminations.
     * @param id A unique integer value identifying this termination.
     * @returns Termination
     * @throws ApiError
     */
    public static apiV1HcmTerminationsRetrieve(
        id: number,
    ): CancelablePromise<Termination> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/hcm/terminations/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee terminations.
     * @param id A unique integer value identifying this termination.
     * @param requestBody
     * @returns Termination
     * @throws ApiError
     */
    public static apiV1HcmTerminationsUpdate(
        id: number,
        requestBody: Termination,
    ): CancelablePromise<Termination> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/hcm/terminations/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee terminations.
     * @param id A unique integer value identifying this termination.
     * @param requestBody
     * @returns Termination
     * @throws ApiError
     */
    public static apiV1HcmTerminationsPartialUpdate(
        id: number,
        requestBody?: PatchedTermination,
    ): CancelablePromise<Termination> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/hcm/terminations/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee terminations.
     * @param id A unique integer value identifying this termination.
     * @returns void
     * @throws ApiError
     */
    public static apiV1HcmTerminationsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/hcm/terminations/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for position-based payroll components.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedPayrollComponentList
     * @throws ApiError
     */
    public static apiV1PayrollComponentsList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedPayrollComponentList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/payroll/components/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for position-based payroll components.
     * @param requestBody
     * @returns PayrollComponent
     * @throws ApiError
     */
    public static apiV1PayrollComponentsCreate(
        requestBody: PayrollComponent,
    ): CancelablePromise<PayrollComponent> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/payroll/components/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for position-based payroll components.
     * @param id A unique integer value identifying this payroll component.
     * @returns PayrollComponent
     * @throws ApiError
     */
    public static apiV1PayrollComponentsRetrieve(
        id: number,
    ): CancelablePromise<PayrollComponent> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/payroll/components/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for position-based payroll components.
     * @param id A unique integer value identifying this payroll component.
     * @param requestBody
     * @returns PayrollComponent
     * @throws ApiError
     */
    public static apiV1PayrollComponentsUpdate(
        id: number,
        requestBody: PayrollComponent,
    ): CancelablePromise<PayrollComponent> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/payroll/components/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for position-based payroll components.
     * @param id A unique integer value identifying this payroll component.
     * @param requestBody
     * @returns PayrollComponent
     * @throws ApiError
     */
    public static apiV1PayrollComponentsPartialUpdate(
        id: number,
        requestBody?: PatchedPayrollComponent,
    ): CancelablePromise<PayrollComponent> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/payroll/components/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for position-based payroll components.
     * @param id A unique integer value identifying this payroll component.
     * @returns void
     * @throws ApiError
     */
    public static apiV1PayrollComponentsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/payroll/components/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee payroll entries.
     * @param currency
     * @param employee
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedPayrollEntryList
     * @throws ApiError
     */
    public static apiV1PayrollEntriesList(
        currency?: string,
        employee?: number,
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedPayrollEntryList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/payroll/entries/',
            query: {
                'currency': currency,
                'employee': employee,
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for employee payroll entries.
     * @param requestBody
     * @returns PayrollEntry
     * @throws ApiError
     */
    public static apiV1PayrollEntriesCreate(
        requestBody: PayrollEntry,
    ): CancelablePromise<PayrollEntry> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/payroll/entries/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee payroll entries.
     * @param id A unique integer value identifying this payroll entry.
     * @returns PayrollEntry
     * @throws ApiError
     */
    public static apiV1PayrollEntriesRetrieve(
        id: number,
    ): CancelablePromise<PayrollEntry> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/payroll/entries/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee payroll entries.
     * @param id A unique integer value identifying this payroll entry.
     * @param requestBody
     * @returns PayrollEntry
     * @throws ApiError
     */
    public static apiV1PayrollEntriesUpdate(
        id: number,
        requestBody: PayrollEntry,
    ): CancelablePromise<PayrollEntry> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/payroll/entries/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee payroll entries.
     * @param id A unique integer value identifying this payroll entry.
     * @param requestBody
     * @returns PayrollEntry
     * @throws ApiError
     */
    public static apiV1PayrollEntriesPartialUpdate(
        id: number,
        requestBody?: PatchedPayrollEntry,
    ): CancelablePromise<PayrollEntry> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/payroll/entries/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee payroll entries.
     * @param id A unique integer value identifying this payroll entry.
     * @returns void
     * @throws ApiError
     */
    public static apiV1PayrollEntriesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/payroll/entries/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for Approval To Recruit forms.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedATRList
     * @throws ApiError
     */
    public static apiV1RecruitmentAtrsList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedATRList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/recruitment/atrs/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for Approval To Recruit forms.
     * @param requestBody
     * @returns ATR
     * @throws ApiError
     */
    public static apiV1RecruitmentAtrsCreate(
        requestBody: ATR,
    ): CancelablePromise<ATR> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/recruitment/atrs/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for Approval To Recruit forms.
     * @param id A unique integer value identifying this atr.
     * @returns ATR
     * @throws ApiError
     */
    public static apiV1RecruitmentAtrsRetrieve(
        id: number,
    ): CancelablePromise<ATR> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/recruitment/atrs/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for Approval To Recruit forms.
     * @param id A unique integer value identifying this atr.
     * @param requestBody
     * @returns ATR
     * @throws ApiError
     */
    public static apiV1RecruitmentAtrsUpdate(
        id: number,
        requestBody: ATR,
    ): CancelablePromise<ATR> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/recruitment/atrs/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for Approval To Recruit forms.
     * @param id A unique integer value identifying this atr.
     * @param requestBody
     * @returns ATR
     * @throws ApiError
     */
    public static apiV1RecruitmentAtrsPartialUpdate(
        id: number,
        requestBody?: PatchedATR,
    ): CancelablePromise<ATR> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/recruitment/atrs/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for Approval To Recruit forms.
     * @param id A unique integer value identifying this atr.
     * @returns void
     * @throws ApiError
     */
    public static apiV1RecruitmentAtrsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/recruitment/atrs/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for recruitment candidates and pipeline tracking.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedCandidateList
     * @throws ApiError
     */
    public static apiV1RecruitmentCandidatesList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedCandidateList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/recruitment/candidates/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * ViewSet for recruitment candidates and pipeline tracking.
     * @param requestBody
     * @returns Candidate
     * @throws ApiError
     */
    public static apiV1RecruitmentCandidatesCreate(
        requestBody: Candidate,
    ): CancelablePromise<Candidate> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/recruitment/candidates/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for recruitment candidates and pipeline tracking.
     * @param id A unique integer value identifying this candidate.
     * @returns Candidate
     * @throws ApiError
     */
    public static apiV1RecruitmentCandidatesRetrieve(
        id: number,
    ): CancelablePromise<Candidate> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/recruitment/candidates/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for recruitment candidates and pipeline tracking.
     * @param id A unique integer value identifying this candidate.
     * @param requestBody
     * @returns Candidate
     * @throws ApiError
     */
    public static apiV1RecruitmentCandidatesUpdate(
        id: number,
        requestBody: Candidate,
    ): CancelablePromise<Candidate> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/recruitment/candidates/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for recruitment candidates and pipeline tracking.
     * @param id A unique integer value identifying this candidate.
     * @param requestBody
     * @returns Candidate
     * @throws ApiError
     */
    public static apiV1RecruitmentCandidatesPartialUpdate(
        id: number,
        requestBody?: PatchedCandidate,
    ): CancelablePromise<Candidate> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/recruitment/candidates/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for recruitment candidates and pipeline tracking.
     * @param id A unique integer value identifying this candidate.
     * @returns void
     * @throws ApiError
     */
    public static apiV1RecruitmentCandidatesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/recruitment/candidates/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for compliance alerts and expiry notifications.
     * @param alertType * `TRAINING` - Training Expiry
     * * `MEDICAL` - Medical Expiry
     * * `PERMIT` - Permit Expiry
     * * `CONTRACT` - Contract Expiry
     * * `PROBATION` - Probation Due
     * @param employee
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param status * `ACTIVE` - Active
     * * `ACKNOWLEDGED` - Acknowledged
     * * `RESOLVED` - Resolved
     * @returns PaginatedComplianceAlertList
     * @throws ApiError
     */
    public static apiV1TrackingComplianceAlertsList(
        alertType?: 'CONTRACT' | 'MEDICAL' | 'PERMIT' | 'PROBATION' | 'TRAINING',
        employee?: number,
        ordering?: string,
        page?: number,
        status?: 'ACKNOWLEDGED' | 'ACTIVE' | 'RESOLVED',
    ): CancelablePromise<PaginatedComplianceAlertList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/tracking/compliance-alerts/',
            query: {
                'alert_type': alertType,
                'employee': employee,
                'ordering': ordering,
                'page': page,
                'status': status,
            },
        });
    }
    /**
     * ViewSet for compliance alerts and expiry notifications.
     * @param requestBody
     * @returns ComplianceAlert
     * @throws ApiError
     */
    public static apiV1TrackingComplianceAlertsCreate(
        requestBody: ComplianceAlert,
    ): CancelablePromise<ComplianceAlert> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/tracking/compliance-alerts/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for compliance alerts and expiry notifications.
     * @param id A unique integer value identifying this compliance alert.
     * @returns ComplianceAlert
     * @throws ApiError
     */
    public static apiV1TrackingComplianceAlertsRetrieve(
        id: number,
    ): CancelablePromise<ComplianceAlert> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/tracking/compliance-alerts/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for compliance alerts and expiry notifications.
     * @param id A unique integer value identifying this compliance alert.
     * @param requestBody
     * @returns ComplianceAlert
     * @throws ApiError
     */
    public static apiV1TrackingComplianceAlertsUpdate(
        id: number,
        requestBody: ComplianceAlert,
    ): CancelablePromise<ComplianceAlert> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/tracking/compliance-alerts/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for compliance alerts and expiry notifications.
     * @param id A unique integer value identifying this compliance alert.
     * @param requestBody
     * @returns ComplianceAlert
     * @throws ApiError
     */
    public static apiV1TrackingComplianceAlertsPartialUpdate(
        id: number,
        requestBody?: PatchedComplianceAlert,
    ): CancelablePromise<ComplianceAlert> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/tracking/compliance-alerts/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for compliance alerts and expiry notifications.
     * @param id A unique integer value identifying this compliance alert.
     * @returns void
     * @throws ApiError
     */
    public static apiV1TrackingComplianceAlertsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/tracking/compliance-alerts/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee medical records.
     * @param clearanceStatus
     * @param employee
     * @param medicalType
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @returns PaginatedMedicalList
     * @throws ApiError
     */
    public static apiV1TrackingMedicalsList(
        clearanceStatus?: string,
        employee?: number,
        medicalType?: number,
        ordering?: string,
        page?: number,
    ): CancelablePromise<PaginatedMedicalList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/tracking/medicals/',
            query: {
                'clearance_status': clearanceStatus,
                'employee': employee,
                'medical_type': medicalType,
                'ordering': ordering,
                'page': page,
            },
        });
    }
    /**
     * ViewSet for employee medical records.
     * @param requestBody
     * @returns Medical
     * @throws ApiError
     */
    public static apiV1TrackingMedicalsCreate(
        requestBody: Medical,
    ): CancelablePromise<Medical> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/tracking/medicals/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee medical records.
     * @param id A unique integer value identifying this medical.
     * @returns Medical
     * @throws ApiError
     */
    public static apiV1TrackingMedicalsRetrieve(
        id: number,
    ): CancelablePromise<Medical> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/tracking/medicals/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee medical records.
     * @param id A unique integer value identifying this medical.
     * @param requestBody
     * @returns Medical
     * @throws ApiError
     */
    public static apiV1TrackingMedicalsUpdate(
        id: number,
        requestBody: Medical,
    ): CancelablePromise<Medical> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/tracking/medicals/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee medical records.
     * @param id A unique integer value identifying this medical.
     * @param requestBody
     * @returns Medical
     * @throws ApiError
     */
    public static apiV1TrackingMedicalsPartialUpdate(
        id: number,
        requestBody?: PatchedMedical,
    ): CancelablePromise<Medical> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/tracking/medicals/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee medical records.
     * @param id A unique integer value identifying this medical.
     * @returns void
     * @throws ApiError
     */
    public static apiV1TrackingMedicalsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/tracking/medicals/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee permits.
     * @param employee
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param permitType
     * @param status * `PENDING` - Pending
     * * `ISSUED` - Issued
     * * `EXPIRED` - Expired
     * * `RENEWED` - Renewed
     * @returns PaginatedPermitList
     * @throws ApiError
     */
    public static apiV1TrackingPermitsList(
        employee?: number,
        ordering?: string,
        page?: number,
        permitType?: number,
        status?: 'EXPIRED' | 'ISSUED' | 'PENDING' | 'RENEWED',
    ): CancelablePromise<PaginatedPermitList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/tracking/permits/',
            query: {
                'employee': employee,
                'ordering': ordering,
                'page': page,
                'permit_type': permitType,
                'status': status,
            },
        });
    }
    /**
     * ViewSet for employee permits.
     * @param requestBody
     * @returns Permit
     * @throws ApiError
     */
    public static apiV1TrackingPermitsCreate(
        requestBody: Permit,
    ): CancelablePromise<Permit> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/tracking/permits/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee permits.
     * @param id A unique integer value identifying this permit.
     * @returns Permit
     * @throws ApiError
     */
    public static apiV1TrackingPermitsRetrieve(
        id: number,
    ): CancelablePromise<Permit> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/tracking/permits/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee permits.
     * @param id A unique integer value identifying this permit.
     * @param requestBody
     * @returns Permit
     * @throws ApiError
     */
    public static apiV1TrackingPermitsUpdate(
        id: number,
        requestBody: Permit,
    ): CancelablePromise<Permit> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/tracking/permits/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee permits.
     * @param id A unique integer value identifying this permit.
     * @param requestBody
     * @returns Permit
     * @throws ApiError
     */
    public static apiV1TrackingPermitsPartialUpdate(
        id: number,
        requestBody?: PatchedPermit,
    ): CancelablePromise<Permit> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/tracking/permits/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee permits.
     * @param id A unique integer value identifying this permit.
     * @returns void
     * @throws ApiError
     */
    public static apiV1TrackingPermitsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/tracking/permits/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee probation tracking.
     * @param decision * `APPROVED` - Approved
     * * `REJECTED` - Rejected
     * * `PENDING` - Pending
     * @param employee
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param status * `ACTIVE` - Active
     * * `COMPLETED` - Completed
     * * `FAILED` - Failed
     * * `EXTENDED` - Extended
     * @returns PaginatedProbationList
     * @throws ApiError
     */
    public static apiV1TrackingProbationsList(
        decision?: 'APPROVED' | 'PENDING' | 'REJECTED',
        employee?: number,
        ordering?: string,
        page?: number,
        status?: 'ACTIVE' | 'COMPLETED' | 'EXTENDED' | 'FAILED',
    ): CancelablePromise<PaginatedProbationList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/tracking/probations/',
            query: {
                'decision': decision,
                'employee': employee,
                'ordering': ordering,
                'page': page,
                'status': status,
            },
        });
    }
    /**
     * ViewSet for employee probation tracking.
     * @param requestBody
     * @returns Probation
     * @throws ApiError
     */
    public static apiV1TrackingProbationsCreate(
        requestBody: Probation,
    ): CancelablePromise<Probation> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/tracking/probations/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee probation tracking.
     * @param id A unique integer value identifying this probation.
     * @returns Probation
     * @throws ApiError
     */
    public static apiV1TrackingProbationsRetrieve(
        id: number,
    ): CancelablePromise<Probation> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/tracking/probations/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee probation tracking.
     * @param id A unique integer value identifying this probation.
     * @param requestBody
     * @returns Probation
     * @throws ApiError
     */
    public static apiV1TrackingProbationsUpdate(
        id: number,
        requestBody: Probation,
    ): CancelablePromise<Probation> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/tracking/probations/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee probation tracking.
     * @param id A unique integer value identifying this probation.
     * @param requestBody
     * @returns Probation
     * @throws ApiError
     */
    public static apiV1TrackingProbationsPartialUpdate(
        id: number,
        requestBody?: PatchedProbation,
    ): CancelablePromise<Probation> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/tracking/probations/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee probation tracking.
     * @param id A unique integer value identifying this probation.
     * @returns void
     * @throws ApiError
     */
    public static apiV1TrackingProbationsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/tracking/probations/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee training records.
     * @param employee
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @param status * `SCHEDULED` - Scheduled
     * * `IN_PROGRESS` - In Progress
     * * `COMPLETED` - Completed
     * * `CANCELLED` - Cancelled
     * @param trainingType
     * @returns PaginatedTrainingList
     * @throws ApiError
     */
    public static apiV1TrackingTrainingsList(
        employee?: number,
        ordering?: string,
        page?: number,
        search?: string,
        status?: 'CANCELLED' | 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED',
        trainingType?: number,
    ): CancelablePromise<PaginatedTrainingList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/tracking/trainings/',
            query: {
                'employee': employee,
                'ordering': ordering,
                'page': page,
                'search': search,
                'status': status,
                'training_type': trainingType,
            },
        });
    }
    /**
     * ViewSet for employee training records.
     * @param requestBody
     * @returns Training
     * @throws ApiError
     */
    public static apiV1TrackingTrainingsCreate(
        requestBody: Training,
    ): CancelablePromise<Training> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/tracking/trainings/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee training records.
     * @param id A unique integer value identifying this training.
     * @returns Training
     * @throws ApiError
     */
    public static apiV1TrackingTrainingsRetrieve(
        id: number,
    ): CancelablePromise<Training> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/tracking/trainings/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for employee training records.
     * @param id A unique integer value identifying this training.
     * @param requestBody
     * @returns Training
     * @throws ApiError
     */
    public static apiV1TrackingTrainingsUpdate(
        id: number,
        requestBody: Training,
    ): CancelablePromise<Training> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/tracking/trainings/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee training records.
     * @param id A unique integer value identifying this training.
     * @param requestBody
     * @returns Training
     * @throws ApiError
     */
    public static apiV1TrackingTrainingsPartialUpdate(
        id: number,
        requestBody?: PatchedTraining,
    ): CancelablePromise<Training> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/tracking/trainings/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for employee training records.
     * @param id A unique integer value identifying this training.
     * @returns void
     * @throws ApiError
     */
    public static apiV1TrackingTrainingsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/tracking/trainings/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
