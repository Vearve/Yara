/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TrainingStatusEnum } from './TrainingStatusEnum';
import type { TrainingType } from './TrainingType';
export type Training = {
    readonly id: number;
    employee: number;
    readonly employee_name: string;
    training_type: number;
    readonly training_type_detail: TrainingType;
    provider: string;
    status?: TrainingStatusEnum;
    scheduled_date: string;
    completion_date?: string | null;
    issue_date?: string | null;
    expiry_date?: string | null;
    certificate_number?: string;
    certificate_document?: string;
    cost?: string | null;
    notes?: string;
    readonly is_expired: boolean;
    readonly days_until_expiry: number;
    readonly created_at: string;
    readonly updated_at: string;
};

