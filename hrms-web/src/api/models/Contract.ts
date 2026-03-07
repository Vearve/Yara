/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ContractStatusEnum } from './ContractStatusEnum';
export type Contract = {
    readonly id: number;
    employee: number;
    readonly employee_name: string;
    contract_type: number;
    readonly contract_type_name: string;
    contract_number: string;
    start_date: string;
    end_date?: string | null;
    duration_months?: number | null;
    status?: ContractStatusEnum;
    salary_currency?: string;
    basic_salary?: string | null;
    /**
     * Link to contract document
     */
    document_url?: string;
    readonly is_expired: boolean;
    readonly days_until_expiry: number;
    readonly created_at: string;
    readonly updated_at: string;
};

