/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Department } from './Department';
import type { EmployeeCategory } from './EmployeeCategory';
import type { EmploymentStatusEnum } from './EmploymentStatusEnum';
import type { EmploymentType } from './EmploymentType';
import type { GenderEnum } from './GenderEnum';
import type { ResidentialAreaEnum } from './ResidentialAreaEnum';
/**
 * Full employee details.
 */
export type EmployeeDetail = {
    readonly id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    readonly full_name: string;
    /**
     * National Registration Card
     */
    nrc: string;
    /**
     * NRC unique portion
     */
    nrc_number?: string;
    passport?: string;
    /**
     * Tax PIN
     */
    tpin?: string;
    /**
     * National Health Insurance Management Authority
     */
    nhima?: string;
    /**
     * S/S Number
     */
    sss_number?: string;
    /**
     * NAPSA membership number
     */
    napsa_number?: string;
    date_of_birth: string;
    gender: GenderEnum;
    nationality?: string;
    email: string;
    phone: string;
    house_address: string;
    residential_area?: ResidentialAreaEnum;
    employment_type: number;
    readonly employment_type_detail: EmploymentType;
    employment_status?: EmploymentStatusEnum;
    job_title: string;
    department?: number | null;
    readonly department_detail: Department;
    /**
     * Junior/Senior/Management
     */
    category?: number | null;
    readonly category_detail: EmployeeCategory;
    point_of_hire?: string;
    hire_date: string;
    next_of_kin_name?: string;
    next_of_kin_relationship?: string;
    next_of_kin_phone?: string;
    readonly created_at: string;
    readonly updated_at: string;
};

