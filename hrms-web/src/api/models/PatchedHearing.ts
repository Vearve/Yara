/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HearingStatusEnum } from './HearingStatusEnum';
export type PatchedHearing = {
    readonly id?: number;
    hearing_number?: string;
    related_employee?: number;
    readonly related_employee_name?: string;
    related_report?: number | null;
    readonly related_report_number?: string;
    hearing_date?: string;
    hearing_time?: string | null;
    location?: string;
    status?: HearingStatusEnum;
    /**
     * Names of committee members
     */
    committee_members?: string;
    chairperson?: string;
    charges?: string;
    /**
     * Employee's response/statement
     */
    employee_statement?: string;
    committee_findings?: string;
    recommendations?: string;
    /**
     * Recommended sanctions if any
     */
    sanctions?: string;
    hearing_document?: string;
    readonly created_at?: string;
    readonly updated_at?: string;
};

