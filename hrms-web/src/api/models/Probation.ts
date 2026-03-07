/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DecisionEnum } from './DecisionEnum';
import type { ProbationStatusEnum } from './ProbationStatusEnum';
export type Probation = {
    readonly id: number;
    employee: number;
    readonly employee_name: string;
    start_date: string;
    end_date: string;
    status?: ProbationStatusEnum;
    decision?: DecisionEnum;
    decision_date?: string | null;
    decision_remarks?: string;
    decided_by?: string;
    extension_end_date?: string | null;
    extension_reason?: string;
    readonly is_active: boolean;
    readonly days_remaining: number;
    readonly created_at: string;
    readonly updated_at: string;
};

