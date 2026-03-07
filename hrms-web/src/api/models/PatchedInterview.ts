/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InterviewStatusEnum } from './InterviewStatusEnum';
export type PatchedInterview = {
    readonly id?: number;
    candidate_name?: string;
    candidate_nrc?: string;
    position?: string;
    interview_date?: string;
    interview_time?: string | null;
    status?: InterviewStatusEnum;
    /**
     * Names of committee members, comma-separated
     */
    committee_members?: string;
    /**
     * Interview questions, formatted as JSON or plain text
     */
    questions?: string;
    final_score?: number | null;
    recommendations?: string;
    interview_document?: string;
    readonly created_at?: string;
    readonly updated_at?: string;
};

