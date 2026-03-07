/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CaseStudyStatusEnum } from './CaseStudyStatusEnum';
import type { VerdictEnum } from './VerdictEnum';
export type PatchedCaseStudy = {
    readonly id?: number;
    case_number?: string;
    related_report?: number;
    readonly related_report_number?: string;
    related_employee?: number;
    readonly related_employee_name?: string;
    status?: CaseStudyStatusEnum;
    verdict?: VerdictEnum;
    charges_document?: string;
    charges_text?: string;
    readonly hearings_count?: string;
    readonly investigations_count?: string;
    final_verdict_text?: string;
    sanctions_imposed?: string;
    appeal_status?: string;
    readonly case_opened_date?: string;
    case_closed_date?: string | null;
    readonly created_at?: string;
    readonly updated_at?: string;
};

