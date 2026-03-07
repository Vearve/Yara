/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MedicalTypeNameEnum } from './MedicalTypeNameEnum';
export type MedicalType = {
    readonly id: number;
    name: MedicalTypeNameEnum;
    description?: string;
    /**
     * Frequency in months for mandatory re-tests
     */
    frequency_months?: number | null;
};

