/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MedicalStatusEnum } from './MedicalStatusEnum';
import type { MedicalType } from './MedicalType';
export type Medical = {
    readonly id: number;
    employee: number;
    readonly employee_name: string;
    medical_type: number;
    readonly medical_type_detail: MedicalType;
    scheduled_date: string;
    completion_date?: string | null;
    facility: string;
    status?: MedicalStatusEnum;
    clearance_status?: string;
    findings?: string;
    /**
     * Any work restrictions
     */
    restrictions?: string;
    report_document?: string;
    issue_date?: string | null;
    expiry_date?: string | null;
    readonly is_expired: boolean;
    readonly days_until_expiry: number;
    readonly created_at: string;
    readonly updated_at: string;
};

