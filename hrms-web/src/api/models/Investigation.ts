/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvestigationStatusEnum } from './InvestigationStatusEnum';
export type Investigation = {
    readonly id: number;
    investigation_number: string;
    related_report?: number | null;
    readonly related_report_number: string;
    related_employee: number;
    readonly related_employee_name: string;
    title: string;
    description: string;
    investigation_date: string;
    status?: InvestigationStatusEnum;
    investigator: string;
    evidence_collected?: string;
    findings?: string;
    conclusions?: string;
    recommendations?: string;
    investigation_document?: string;
    readonly created_at: string;
    readonly updated_at: string;
};

