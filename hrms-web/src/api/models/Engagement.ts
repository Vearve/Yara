/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Engagement = {
    readonly id: number;
    employee: number;
    readonly employee_name: string;
    engagement_date: string;
    contract_type?: number | null;
    readonly contract_type_name: string;
    contract_duration_months?: number | null;
    initial_contract_end_date?: string | null;
    notes?: string;
    readonly created_at: string;
    readonly updated_at: string;
};

