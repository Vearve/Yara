/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CategoryEnum } from './CategoryEnum';
export type TrainingType = {
    readonly id: number;
    name: string;
    category: CategoryEnum;
    description?: string;
    requires_certification?: boolean;
    default_validity_months?: number | null;
};

