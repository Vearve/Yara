/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FrequencyEnum } from './FrequencyEnum';
import type { KpiTypeEnum } from './KpiTypeEnum';
export type PatchedKPI = {
    readonly id?: number;
    employee?: number;
    readonly employee_name?: string;
    kpi_name?: string;
    kpi_type?: KpiTypeEnum;
    description?: string;
    frequency?: FrequencyEnum;
    start_date?: string;
    end_date?: string;
    target_value?: number;
    actual_value?: number | null;
    /**
     * e.g., units, %, hours
     */
    unit?: string;
    achieved?: boolean;
    readonly achievement_percentage?: number;
    comments?: string;
    readonly created_at?: string;
    readonly updated_at?: string;
};

