/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PatchedTermination = {
    readonly id?: number;
    employee?: number;
    readonly employee_name?: string;
    termination_date?: string;
    termination_reason?: number;
    readonly termination_reason_name?: string;
    /**
     * Final payroll processed
     */
    payroll_final?: boolean;
    comments?: string;
    readonly created_at?: string;
    readonly updated_at?: string;
};

