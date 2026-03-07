/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReportStatusEnum } from './ReportStatusEnum';
import type { ReportType } from './ReportType';
import type { SeverityEnum } from './SeverityEnum';
export type PatchedReport = {
    readonly id?: number;
    report_number?: string;
    report_type?: number;
    readonly report_type_detail?: ReportType;
    reported_by?: number | null;
    readonly reported_by_name?: string;
    reported_employee?: number | null;
    readonly reported_employee_name?: string;
    title?: string;
    description?: string;
    location?: string;
    incident_date?: string;
    incident_time?: string | null;
    status?: ReportStatusEnum;
    severity?: SeverityEnum;
    attachments?: string;
    is_escalated?: boolean;
    escalated_to_case?: boolean;
    readonly created_at?: string;
    readonly updated_at?: string;
};

