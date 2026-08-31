export const APPLICATION_COHORTS = ["S26", "F26"] as const;

export type ApplicationCohort = (typeof APPLICATION_COHORTS)[number];

export const DEFAULT_APPLICATION_COHORT: ApplicationCohort = "F26";

export const S26_APPLICATION_IDS = ["1", "2", "3", "4"] as const;
