/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlertTypeEnum } from './AlertTypeEnum';
import type { ComplianceAlertStatusEnum } from './ComplianceAlertStatusEnum';
export type ComplianceAlert = {
    readonly id: number;
    employee: number;
    readonly employee_name: string;
    alert_type: AlertTypeEnum;
    status?: ComplianceAlertStatusEnum;
    title: string;
    description: string;
    due_date: string;
    content_type?: string;
    object_id?: number | null;
    readonly acknowledged_at: string | null;
    acknowledged_by?: string;
    readonly resolved_at: string | null;
    readonly created_at: string;
};

