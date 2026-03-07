/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmploymentStatusEnum } from './EmploymentStatusEnum';
/**
 * Lightweight serializer for lists.
 */
export type EmployeeList = {
    readonly id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    readonly full_name: string;
    email: string;
    phone: string;
    job_title: string;
    department?: number | null;
    readonly department_name: string;
    employment_type: number;
    readonly employment_type_name: string;
    /**
     * Junior/Senior/Management
     */
    category?: number | null;
    readonly category_name: string;
    employment_status?: EmploymentStatusEnum;
    hire_date: string;
    readonly created_at: string;
};

