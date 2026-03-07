/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PermitStatusEnum } from './PermitStatusEnum';
import type { PermitType } from './PermitType';
export type PatchedPermit = {
    readonly id?: number;
    employee?: number;
    readonly employee_name?: string;
    permit_type?: number;
    readonly permit_type_detail?: PermitType;
    status?: PermitStatusEnum;
    issue_date?: string;
    expiry_date?: string;
    permit_number?: string;
    document?: string;
    issued_by?: string;
    readonly is_expired?: boolean;
    readonly days_until_expiry?: number;
    readonly created_at?: string;
    readonly updated_at?: string;
};

