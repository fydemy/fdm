import { z } from "zod";

export const FULL_TIME_STATUSES = [
  "Full-time",
  "Part-time (transitioning)",
  "Part-time / Student",
] as const;

export const LEGAL_STATUSES = [
  "Incorporated",
  "In Progress",
  "Not Incorporated",
] as const;

export const PRODUCT_STAGES = [
  "Idea",
  "Prototype",
  "Beta",
  "Live",
] as const;

export const DEMO_ASSET_TYPES = [
  "Deck",
  "Mock-up",
  "Live demo",
  "None",
] as const;

export const SECTORS = [
  "Fintech",
  "Healthtech",
  "Edtech",
  "SaaS / B2B",
  "Consumer",
  "Marketplace",
  "AI / ML",
  "Climate",
  "Other",
] as const;

export const SUBSECTORS_BY_SECTOR: Record<
  (typeof SECTORS)[number],
  readonly string[]
> = {
  Fintech: ["Payments", "Lending", "Insurance", "Wealth / investing", "Other"],
  Healthtech: ["Digital health", "Medtech", "Biotech", "Other"],
  Edtech: ["K-12", "Higher education", "Corporate learning", "Other"],
  "SaaS / B2B": ["Horizontal SaaS", "Vertical SaaS", "Devtools", "Other"],
  Consumer: ["Social", "Content", "E-commerce", "Other"],
  Marketplace: ["B2C marketplace", "B2B marketplace", "Services", "Other"],
  "AI / ML": ["Infrastructure", "Application layer", "Data / labeling", "Other"],
  Climate: ["Energy", "Carbon", "Agriculture", "Other"],
  Other: ["Other"],
};

export const COMPANY_STAGES = [
  "Bootstrapped",
  "Idea / Pre-Seed",
  "Seed",
  "Series A+",
] as const;

export const FUNDING_INSTRUMENTS = [
  "SAFE / Convertible Note",
  "Equity",
  "Grant / Non-dilutive",
  "Other",
] as const;

export const YES_NO = ["Yes", "No"] as const;

export const RAISING_STATUSES = [
  "Yes",
  "No",
  "Not raising / seeking non-dilutive support only",
] as const;

export const CONNECTION_REQUESTS = [
  "Angels / VCs / Investors",
  "Operators / Mentors",
  "Strategic Partners",
] as const;

export const ACQUISITION_CHANNELS = [
  "Organic / SEO",
  "Paid ads",
  "Sales / outbound",
  "Partnerships",
  "Community / referrals",
  "Product-led",
  "Other",
] as const;

export const CURRENCIES = ["USD", "IDR", "SGD", "EUR", "Other"] as const;

export const PRICING_MODELS = [
  "Subscription",
  "Transaction / take-rate",
  "Usage-based",
  "One-time",
  "Marketplace",
  "Enterprise contract",
  "Freemium",
  "Other",
] as const;

export const PILOT_COMPENSATION = [
  "Paid",
  "Unpaid",
  "Mixed",
] as const;

export const PILOT_STAGES = [
  "Exploratory",
  "Active",
  "Expanding",
  "Converting to paid",
  "Other",
] as const;

export const PILOT_VALUE_TYPES = [
  "Total contract value",
  "Monthly value",
  "Expected annual value",
] as const;

export const EQUITY_VALUATION_TYPES = [
  "Pre-money",
  "Post-money",
] as const;

export const REGULATORY_STATUSES = ["None", "Yes"] as const;

export const REVIEW_STATUSES = [
  "Not ready yet",
  "Operator/partner-ready",
  "Angel-ready",
  "Investor-ready",
] as const;

export const RECOMMENDED_NEXT_ACTIONS = [
  "Validate",
  "Refine fundraising materials",
  "Operator conversation",
  "Partner introduction",
  "Investor review",
] as const;

export const REVIEW_STATUS_LABELS: Record<
  (typeof REVIEW_STATUSES)[number],
  string
> = {
  "Not ready yet": "Not ready yet",
  "Operator/partner-ready": "Operator- or partner-ready",
  "Angel-ready":
    "Angel-ready — MVP/prototype plus credible early validation and a specific raise",
  "Investor-ready":
    "Investor-ready — MVP/live product, early traction appropriate to the sector, evidence, and a complete, targeted round",
};

const scoreSchema = z.number().int().min(1).max(5);
const nonEmpty = (message: string) => z.string().trim().min(1, message);
const optionalUrl = z
  .string()
  .optional()
  .refine((value) => !value?.trim() || URL.canParse(value.trim()), {
    message: "Enter a valid URL",
  });
const optionalText = z.string().optional();
const nonNegInt = z.coerce.number().int().min(0);
const nonNegNumber = z.coerce.number().min(0);
const percentOptional = z.coerce.number().min(0).max(100).optional();
const percentRequired = z.coerce
  .number()
  .min(0, "Must be 0–100")
  .max(100, "Must be 0–100");

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined
        ? undefined
        : value,
    z.enum(values).optional(),
  );

function isPartTime(
  status: (typeof FULL_TIME_STATUSES)[number] | "" | undefined,
) {
  return Boolean(status && status !== "Full-time");
}

function needsDemoLink(
  stage: (typeof PRODUCT_STAGES)[number] | "" | undefined,
  demoAsset: (typeof DEMO_ASSET_TYPES)[number] | "" | undefined,
) {
  if (!stage || stage === "Idea") {
    return demoAsset === "Deck" || demoAsset === "Mock-up" || demoAsset === "Live demo";
  }
  return true;
}

function needsValuationCap(
  instrument: (typeof FUNDING_INSTRUMENTS)[number] | "" | undefined,
) {
  return (
    instrument === "SAFE / Convertible Note" || instrument === "Equity"
  );
}

function isEquityInstrument(
  instrument: (typeof FUNDING_INSTRUMENTS)[number] | "" | undefined,
) {
  return instrument === "Equity";
}

function isSafeOrNote(
  instrument: (typeof FUNDING_INSTRUMENTS)[number] | "" | undefined,
) {
  return instrument === "SAFE / Convertible Note";
}

function isTransactionOrientedSector(
  sector: (typeof SECTORS)[number] | "" | undefined,
) {
  return (
    sector === "Fintech" ||
    sector === "Marketplace" ||
    sector === "Consumer"
  );
}

function requireEvidence(
  ctx: z.RefinementCtx,
  count: number | undefined,
  evidence: string | undefined,
  path: (string | number)[],
  label: string,
) {
  if (count !== undefined && !Number.isNaN(count) && count > 0 && !evidence?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: `${label} evidence (link or short note) is required when the value is greater than 0`,
      path,
    });
  }
}

export const applicantFormSchema = z
  .object({
    founder: z.object({
      founder_name: nonEmpty("Founder name is required"),
      founder_role: nonEmpty("Founder role is required"),
      founder_email: z.string().email("Valid email required"),
      founder_experience: nonEmpty("Experience is required"),
      founder_contact: z.string().url("Valid LinkedIn URL required"),
      primary_decision_maker: nonEmpty("Select the primary decision-maker"),
      phone_whatsapp: optionalText,
      founder_count: z.coerce.number().int().min(1, "At least 1 founder"),
      team_members: z.preprocess(
        (value) => {
          if (!Array.isArray(value)) return [];
          return value.filter((member) => {
            if (!member || typeof member !== "object") return false;
            const row = member as Record<string, unknown>;
            return [row.name, row.role, row.email, row.linkedin].some(
              (field) => typeof field === "string" && field.trim(),
            );
          });
        },
        z
          .array(
            z.object({
              name: nonEmpty("Name is required"),
              role: nonEmpty("Role is required"),
              email: z.string().email("Valid email required"),
              linkedin: z.string().url("Valid LinkedIn URL required"),
              full_time_status: z.enum(FULL_TIME_STATUSES),
            }),
          )
          .default([]),
      ),
      full_time_status: z.enum(FULL_TIME_STATUSES),
      part_time_full_time_date: z.string().optional(),
    }),
    company: z.object({
      company_name: nonEmpty("Company name is required"),
      company_website: optionalUrl,
      sector: z.enum(SECTORS),
      sector_other: optionalText,
      subsector: nonEmpty("Subsector is required"),
      subsector_other: optionalText,
      operating_country: nonEmpty("Operating country is required"),
      operating_city: nonEmpty("Operating city is required"),
      legal_status: z.enum(LEGAL_STATUSES),
      incorporation_jurisdiction: optionalText,
      founder_ownership_percent: percentRequired,
      ownership_employees_percent: percentRequired,
      ownership_advisors_percent: percentRequired,
      ownership_investors_percent: percentRequired,
      ownership_unallocated_percent: percentRequired,
      product_stage: z.enum(PRODUCT_STAGES),
      demo_asset_type: z.enum(DEMO_ASSET_TYPES).optional(),
      demo_link: optionalText,
      regulatory_status: z.enum(REGULATORY_STATUSES),
      regulatory_authority: optionalText,
      regulatory_explanation: optionalText,
      regulatory_evidence_link: optionalUrl,
      product_description: z
        .string()
        .trim()
        .min(1, "Product description is required")
        .max(120, "Max 120 characters"),
      problem_statement: z
        .string()
        .trim()
        .min(1, "Problem statement is required")
        .max(150, "Max 150 characters"),
      written_brief: optionalText,
      who_pays: nonEmpty("Who pays is required"),
      pricing_model: z.enum(PRICING_MODELS),
      pricing_model_other: optionalText,
      gross_margin_percent: percentOptional,
      unit_economics: optionalText,
      competition_alternatives: nonEmpty(
        "Competition / alternatives are required",
      ),
      why_now_why_team: nonEmpty("Why now / why this team is required"),
    }),
    validation: z.object({
      customer_segment: nonEmpty("Customer segment is required"),
      customer_acquisition_channel: z.enum(ACQUISITION_CHANNELS),
      acquisition_channel_other: optionalText,
      interview_count: nonNegInt,
      interview_as_of: optionalText,
      interview_learnings: nonEmpty(
        "Share what you learned from interviews",
      ),
      pilots_count: nonNegInt.optional(),
      pilots_as_of: optionalText,
      pilots_compensation: optionalEnum(PILOT_COMPENSATION),
      pilots_stage: optionalEnum(PILOT_STAGES),
      pilots_contract_value: nonNegNumber.optional(),
      pilots_contract_value_type: optionalEnum(PILOT_VALUE_TYPES),
      pilots_contract_currency: z.enum(CURRENCIES),
      pilots_expected_conversion_date: optionalText,
      pilots_evidence: optionalText,
      lois_count: nonNegInt.optional(),
      lois_as_of: optionalText,
      lois_evidence: optionalText,
      active_users_count: nonNegInt,
      active_users_as_of: optionalText,
      active_users_evidence: optionalText,
      paying_customers_count: nonNegInt,
      paying_customers_as_of: optionalText,
      paying_customers_evidence: optionalText,
      retention_percent: percentOptional,
      retention_as_of: optionalText,
      retention_measurement_window: optionalText,
      retention_cohort_definition: optionalText,
      retention_evidence: optionalText,
      revenue_retention: optionalText,
      north_star_metric: nonEmpty("North-star metric is required"),
      north_star_value: nonEmpty("North-star value is required"),
      north_star_as_of: optionalText,
      north_star_why: nonEmpty(
        "Explain why this is the most important metric",
      ),
      north_star_evidence: optionalText,
      gmv_tpv: nonNegNumber.optional(),
      gmv_tpv_currency: z.enum(CURRENCIES),
      net_revenue: nonNegNumber.optional(),
      net_revenue_currency: z.enum(CURRENCIES),
      take_rate_percent: percentOptional,
      transaction_reporting_period: optionalText,
      current_mrr: nonNegNumber,
      mrr_currency: z.enum(CURRENCIES),
      mrr_as_of: optionalText,
      mrr_evidence: optionalText,
    }),
    fundraising: z.object({
      company_stage: z.enum(COMPANY_STAGES),
      currently_raising: z.enum(RAISING_STATUSES),
      funding_instrument: z.enum(FUNDING_INSTRUMENTS).optional(),
      raising_amount: nonNegNumber.optional(),
      raise_currency: z.enum(CURRENCIES),
      valuation_amount: nonNegNumber.optional(),
      valuation_currency: z.enum(CURRENCIES),
      equity_valuation_type: optionalEnum(EQUITY_VALUATION_TYPES),
      capital_raised_to_date: nonNegNumber,
      capital_raised_currency: z.enum(CURRENCIES),
      capital_raised_as_of: optionalText,
      prior_investors_grants: optionalText,
      runway_months: nonNegInt.optional(),
      use_of_funds: optionalText,
      target_investor_geography: optionalText,
      target_check_size: nonNegNumber.optional(),
      target_check_size_currency: z.enum(CURRENCIES),
      target_close_date: optionalText,
      committed_soft_circled_amount: nonNegNumber.optional(),
      committed_soft_circled_currency: z.enum(CURRENCIES),
      lead_dependent: z.enum(YES_NO).optional(),
    }),
    progress_and_ask: z.object({
      goal_30_days: nonEmpty("30-day goal is required"),
      key_blockers: nonEmpty("Key blockers are required"),
      target_milestone: nonEmpty("Target milestone is required"),
      priority_counterpart_type: z.enum(CONNECTION_REQUESTS),
      counterpart_profile: nonEmpty("Counterpart profile is required"),
      connection_geography: nonEmpty("Connection geography is required"),
      connection_outcome: nonEmpty(
        "Describe the one outcome you want from an introduction",
      ),
    }),
    consent: z.object({
      accelerator_review_consent: z.boolean().refine((value) => value, {
        message: "Consent for private Fydemy review is required",
      }),
      share_after_approval: z.boolean().default(true),
    }),
  })
  .superRefine((data, ctx) => {
    const requiredTeammates = Math.max(0, data.founder.founder_count - 1);
    if (data.founder.team_members.length < requiredTeammates) {
      ctx.addIssue({
        code: "custom",
        message: `Add at least ${requiredTeammates} cofounder${requiredTeammates === 1 ? "" : "s"} when number of founders is ${data.founder.founder_count}`,
        path: ["founder", "team_members"],
      });
    }

    const ownershipTotal =
      data.company.founder_ownership_percent +
      data.company.ownership_employees_percent +
      data.company.ownership_advisors_percent +
      data.company.ownership_investors_percent +
      data.company.ownership_unallocated_percent;
    if (Math.abs(ownershipTotal - 100) > 0.01) {
      ctx.addIssue({
        code: "custom",
        message:
          "Founder + employees/ESOP + advisors + investors + unallocated/other must total 100%",
        path: ["company", "founder_ownership_percent"],
      });
    }

    if (
      data.company.sector === "Other" &&
      !data.company.sector_other?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Describe your sector",
        path: ["company", "sector_other"],
      });
    }

    if (
      data.company.subsector === "Other" &&
      !data.company.subsector_other?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Describe your subsector",
        path: ["company", "subsector_other"],
      });
    }

    if (
      data.company.legal_status !== "Not Incorporated" &&
      !data.company.incorporation_jurisdiction?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Incorporation jurisdiction is required",
        path: ["company", "incorporation_jurisdiction"],
      });
    }

    if (data.company.product_stage === "Idea") {
      if (!data.company.demo_asset_type) {
        ctx.addIssue({
          code: "custom",
          message: "Select what you can share for an idea-stage product",
          path: ["company", "demo_asset_type"],
        });
      }
      if (
        data.company.demo_asset_type === "None" &&
        !data.company.written_brief?.trim()
      ) {
        ctx.addIssue({
          code: "custom",
          message:
            "Provide a concise written brief when you have no deck or mock-up",
          path: ["company", "written_brief"],
        });
      }

      const hasBrief = Boolean(data.company.written_brief?.trim());
      const demoLink = data.company.demo_link?.trim();
      const hasDemoOrMockup = Boolean(demoLink && URL.canParse(demoLink));
      if (!hasBrief && !hasDemoOrMockup) {
        ctx.addIssue({
          code: "custom",
          message:
            "Idea-stage applicants must provide a written brief or a demo/mock-up link",
          path: ["company", "written_brief"],
        });
        ctx.addIssue({
          code: "custom",
          message:
            "Idea-stage applicants must provide a written brief or a demo/mock-up link",
          path: ["company", "demo_link"],
        });
      }
    }

    if (
      needsDemoLink(data.company.product_stage, data.company.demo_asset_type)
    ) {
      const link = data.company.demo_link?.trim();
      if (!link || !URL.canParse(link)) {
        ctx.addIssue({
          code: "custom",
          message: "A valid demo / deck / mock-up link is required",
          path: ["company", "demo_link"],
        });
      }
    } else if (
      data.company.demo_link?.trim() &&
      !URL.canParse(data.company.demo_link.trim())
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid URL",
        path: ["company", "demo_link"],
      });
    }

    if (data.company.regulatory_status === "Yes") {
      if (!data.company.regulatory_authority?.trim()) {
        ctx.addIssue({
          code: "custom",
          message:
            "Name the regulator, licence, or partner dependency",
          path: ["company", "regulatory_authority"],
        });
      }
      if (!data.company.regulatory_explanation?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Explain the regulatory dependency",
          path: ["company", "regulatory_explanation"],
        });
      }
    }

    if (
      data.company.pricing_model === "Other" &&
      !data.company.pricing_model_other?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Describe your pricing model",
        path: ["company", "pricing_model_other"],
      });
    }

    if (
      data.validation.customer_acquisition_channel === "Other" &&
      !data.validation.acquisition_channel_other?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Describe your acquisition channel",
        path: ["validation", "acquisition_channel_other"],
      });
    }

    const pilots = data.validation.pilots_count;
    if (pilots !== undefined && !Number.isNaN(pilots) && pilots > 0) {
      if (!data.validation.pilots_compensation) {
        ctx.addIssue({
          code: "custom",
          message: "Indicate whether pilots are paid, unpaid, or mixed",
          path: ["validation", "pilots_compensation"],
        });
      }
      if (!data.validation.pilots_stage) {
        ctx.addIssue({
          code: "custom",
          message: "Pilot stage is required when pilots > 0",
          path: ["validation", "pilots_stage"],
        });
      }
      requireEvidence(
        ctx,
        pilots,
        data.validation.pilots_evidence,
        ["validation", "pilots_evidence"],
        "Pilots",
      );
    }

    if (
      data.validation.pilots_contract_value !== undefined &&
      !Number.isNaN(data.validation.pilots_contract_value) &&
      data.validation.pilots_contract_value > 0 &&
      !data.validation.pilots_contract_value_type
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "Specify whether contract value is total, monthly, or expected annual",
        path: ["validation", "pilots_contract_value_type"],
      });
    }

    const lois = data.validation.lois_count;
    if (lois !== undefined && !Number.isNaN(lois) && lois > 0) {
      requireEvidence(
        ctx,
        lois,
        data.validation.lois_evidence,
        ["validation", "lois_evidence"],
        "LOIs / design partners",
      );
    }

    requireEvidence(
      ctx,
      data.validation.active_users_count,
      data.validation.active_users_evidence,
      ["validation", "active_users_evidence"],
      "Active users",
    );
    requireEvidence(
      ctx,
      data.validation.paying_customers_count,
      data.validation.paying_customers_evidence,
      ["validation", "paying_customers_evidence"],
      "Paying customers",
    );

    if (
      data.validation.retention_percent !== undefined &&
      !Number.isNaN(data.validation.retention_percent)
    ) {
      if (!data.validation.retention_measurement_window?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Retention measurement window is required",
          path: ["validation", "retention_measurement_window"],
        });
      }
      if (!data.validation.retention_cohort_definition?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Retention cohort / definition is required",
          path: ["validation", "retention_cohort_definition"],
        });
      }
      if (
        data.validation.retention_percent > 0 &&
        !data.validation.retention_evidence?.trim()
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Retention evidence is required when retention is greater than 0",
          path: ["validation", "retention_evidence"],
        });
      }
    }

    const northStarValue = data.validation.north_star_value.trim();
    const northStarLooksZero = /^(0+|0+(\.0+)?|0+%|\$?0+(\.0+)?)$/i.test(
      northStarValue,
    );
    if (northStarValue && !northStarLooksZero) {
      if (!data.validation.north_star_evidence?.trim()) {
        ctx.addIssue({
          code: "custom",
          message:
            "Data source / evidence is required when the most important metric value is non-zero",
          path: ["validation", "north_star_evidence"],
        });
      }
    }

    if (data.validation.current_mrr > 0) {
      requireEvidence(
        ctx,
        data.validation.current_mrr,
        data.validation.mrr_evidence,
        ["validation", "mrr_evidence"],
        "MRR",
      );
    }

    if (data.fundraising.currently_raising === "Yes") {
      if (!data.fundraising.funding_instrument) {
        ctx.addIssue({
          code: "custom",
          message: "Funding instrument is required when raising",
          path: ["fundraising", "funding_instrument"],
        });
      }
      if (
        data.fundraising.raising_amount === undefined ||
        Number.isNaN(data.fundraising.raising_amount)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Raise amount is required when raising",
          path: ["fundraising", "raising_amount"],
        });
      }
      if (!data.fundraising.raise_currency) {
        ctx.addIssue({
          code: "custom",
          message: "Raise currency is required when raising",
          path: ["fundraising", "raise_currency"],
        });
      }
      if (
        data.fundraising.runway_months === undefined ||
        Number.isNaN(data.fundraising.runway_months)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Runway is required when raising",
          path: ["fundraising", "runway_months"],
        });
      }
      if (!data.fundraising.use_of_funds?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Use of funds is required when raising",
          path: ["fundraising", "use_of_funds"],
        });
      }
      if (!data.fundraising.target_investor_geography?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Target investor geography is required when raising",
          path: ["fundraising", "target_investor_geography"],
        });
      }
      if (
        data.fundraising.target_check_size === undefined ||
        Number.isNaN(data.fundraising.target_check_size)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Target check size is required when raising",
          path: ["fundraising", "target_check_size"],
        });
      }
      if (!data.fundraising.target_check_size_currency) {
        ctx.addIssue({
          code: "custom",
          message: "Target check size currency is required when raising",
          path: ["fundraising", "target_check_size_currency"],
        });
      }
      if (
        data.fundraising.committed_soft_circled_amount === undefined ||
        Number.isNaN(data.fundraising.committed_soft_circled_amount)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Committed / soft-circled amount is required when raising",
          path: ["fundraising", "committed_soft_circled_amount"],
        });
      }
      if (!data.fundraising.committed_soft_circled_currency) {
        ctx.addIssue({
          code: "custom",
          message:
            "Committed / soft-circled currency is required when raising",
          path: ["fundraising", "committed_soft_circled_currency"],
        });
      }
      if (!data.fundraising.lead_dependent) {
        ctx.addIssue({
          code: "custom",
          message: "Lead dependency is required when raising",
          path: ["fundraising", "lead_dependent"],
        });
      }
      if (
        needsValuationCap(data.fundraising.funding_instrument) &&
        (data.fundraising.valuation_amount === undefined ||
          Number.isNaN(data.fundraising.valuation_amount))
      ) {
        ctx.addIssue({
          code: "custom",
          message: isSafeOrNote(data.fundraising.funding_instrument)
            ? "Valuation cap is required for SAFE / convertible notes"
            : "Valuation is required for equity rounds",
          path: ["fundraising", "valuation_amount"],
        });
      }
      if (
        needsValuationCap(data.fundraising.funding_instrument) &&
        !data.fundraising.valuation_currency
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Valuation currency is required",
          path: ["fundraising", "valuation_currency"],
        });
      }
      if (
        isEquityInstrument(data.fundraising.funding_instrument) &&
        !data.fundraising.equity_valuation_type
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Select pre-money or post-money valuation",
          path: ["fundraising", "equity_valuation_type"],
        });
      }
    }
  });

export type ApplicantForm = z.infer<typeof applicantFormSchema>;

export function normalizeApplicantForm(form: ApplicantForm): ApplicantForm {
  const emptyToUndef = (value: string | undefined) =>
    value?.trim() ? value.trim() : undefined;

  const cleanNumber = (value: number | undefined) =>
    value === undefined || Number.isNaN(value) ? undefined : value;

  return applicantFormSchema.parse({
    ...form,
    founder: {
      ...form.founder,
      part_time_full_time_date: emptyToUndef(
        form.founder.part_time_full_time_date,
      ),
      phone_whatsapp: emptyToUndef(form.founder.phone_whatsapp),
    },
    company: {
      ...form.company,
      company_website: emptyToUndef(form.company.company_website),
      sector_other: emptyToUndef(form.company.sector_other),
      subsector_other: emptyToUndef(form.company.subsector_other),
      incorporation_jurisdiction: emptyToUndef(
        form.company.incorporation_jurisdiction,
      ),
      ownership_employees_percent: form.company.ownership_employees_percent,
      ownership_advisors_percent: form.company.ownership_advisors_percent,
      ownership_investors_percent: form.company.ownership_investors_percent,
      ownership_unallocated_percent: form.company.ownership_unallocated_percent,
      demo_link: emptyToUndef(form.company.demo_link),
      regulatory_authority: emptyToUndef(form.company.regulatory_authority),
      regulatory_explanation: emptyToUndef(form.company.regulatory_explanation),
      regulatory_evidence_link: emptyToUndef(
        form.company.regulatory_evidence_link,
      ),
      written_brief: emptyToUndef(form.company.written_brief),
      pricing_model_other: emptyToUndef(form.company.pricing_model_other),
      gross_margin_percent: cleanNumber(form.company.gross_margin_percent),
      unit_economics: emptyToUndef(form.company.unit_economics),
    },
    validation: {
      ...form.validation,
      acquisition_channel_other: emptyToUndef(
        form.validation.acquisition_channel_other,
      ),
      pilots_count: cleanNumber(form.validation.pilots_count),
      pilots_as_of: emptyToUndef(form.validation.pilots_as_of),
      pilots_contract_value: cleanNumber(form.validation.pilots_contract_value),
      pilots_expected_conversion_date: emptyToUndef(
        form.validation.pilots_expected_conversion_date,
      ),
      pilots_evidence: emptyToUndef(form.validation.pilots_evidence),
      lois_count: cleanNumber(form.validation.lois_count),
      lois_as_of: emptyToUndef(form.validation.lois_as_of),
      lois_evidence: emptyToUndef(form.validation.lois_evidence),
      active_users_evidence: emptyToUndef(form.validation.active_users_evidence),
      paying_customers_evidence: emptyToUndef(
        form.validation.paying_customers_evidence,
      ),
      retention_percent: cleanNumber(form.validation.retention_percent),
      retention_as_of: emptyToUndef(form.validation.retention_as_of),
      retention_measurement_window: emptyToUndef(
        form.validation.retention_measurement_window,
      ),
      retention_cohort_definition: emptyToUndef(
        form.validation.retention_cohort_definition,
      ),
      retention_evidence: emptyToUndef(form.validation.retention_evidence),
      revenue_retention: emptyToUndef(form.validation.revenue_retention),
      north_star_evidence: emptyToUndef(form.validation.north_star_evidence),
      gmv_tpv: cleanNumber(form.validation.gmv_tpv),
      net_revenue: cleanNumber(form.validation.net_revenue),
      take_rate_percent: cleanNumber(form.validation.take_rate_percent),
      transaction_reporting_period: emptyToUndef(
        form.validation.transaction_reporting_period,
      ),
      mrr_evidence: emptyToUndef(form.validation.mrr_evidence),
    },
    fundraising: {
      ...form.fundraising,
      raising_amount: cleanNumber(form.fundraising.raising_amount),
      valuation_amount: cleanNumber(form.fundraising.valuation_amount),
      runway_months: cleanNumber(form.fundraising.runway_months),
      use_of_funds: emptyToUndef(form.fundraising.use_of_funds),
      prior_investors_grants: emptyToUndef(
        form.fundraising.prior_investors_grants,
      ),
      target_investor_geography: emptyToUndef(
        form.fundraising.target_investor_geography,
      ),
      target_check_size: cleanNumber(form.fundraising.target_check_size),
      target_close_date: emptyToUndef(form.fundraising.target_close_date),
      committed_soft_circled_amount: cleanNumber(
        form.fundraising.committed_soft_circled_amount,
      ),
    },
  });
}

export const screeningEvaluationSchema = z
  .object({
    scores: z.object({
      score_founder: scoreSchema,
      score_validation: scoreSchema,
      score_tech: scoreSchema,
      score_market: scoreSchema,
      score_velocity: scoreSchema,
      score_readiness: scoreSchema,
    }),
    score_rationales: z
      .object({
        score_founder: z.string().max(500).default(""),
        score_validation: z.string().max(500).default(""),
        score_tech: z.string().max(500).default(""),
        score_market: z.string().max(500).default(""),
        score_velocity: z.string().max(500).default(""),
        score_readiness: z.string().max(500).default(""),
      })
      .default({
        score_founder: "",
        score_validation: "",
        score_tech: "",
        score_market: "",
        score_velocity: "",
        score_readiness: "",
      }),
    decision: z.object({
      review_status: z.enum(REVIEW_STATUSES),
      rationale: nonEmpty("Overall review rationale is required").max(5000),
      reviewer: nonEmpty("Reviewer name is required"),
      review_date: nonEmpty("Review date is required"),
      follow_up_review_by_date: nonEmpty(
        "Follow-up / review-by date is required",
      ),
      recommended_next_action: z
        .enum(RECOMMENDED_NEXT_ACTIONS)
        .default("Validate"),
      next_action_owner: nonEmpty("Next-action owner is required"),
      next_gating_milestone: z.string().max(2000).optional(),
      internal_notes: z.string().max(5000).optional(),
    }),
  })
  .superRefine((data, ctx) => {
    for (const key of [
      "score_founder",
      "score_validation",
      "score_tech",
      "score_market",
      "score_velocity",
      "score_readiness",
    ] as const) {
      if (!data.score_rationales[key]?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: `${key.replace("score_", "")} score rationale is required`,
          path: ["score_rationales", key],
        });
      }
    }

    if (
      data.decision.review_status !== "Investor-ready" &&
      !data.decision.next_gating_milestone?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Next gating milestone is required for this status",
        path: ["decision", "next_gating_milestone"],
      });
    }
  });

export type ScreeningEvaluation = z.infer<typeof screeningEvaluationSchema>;

/** Lenient parse shape so older evaluations without rationales still load. */
const screeningEvaluationStoredSchema = z.object({
  scores: z.object({
    score_founder: scoreSchema,
    score_validation: scoreSchema,
    score_tech: scoreSchema,
    score_market: scoreSchema,
    score_velocity: scoreSchema,
    score_readiness: scoreSchema,
  }),
  score_rationales: z
    .object({
      score_founder: z.string().max(500).default(""),
      score_validation: z.string().max(500).default(""),
      score_tech: z.string().max(500).default(""),
      score_market: z.string().max(500).default(""),
      score_velocity: z.string().max(500).default(""),
      score_readiness: z.string().max(500).default(""),
    })
    .default({
      score_founder: "",
      score_validation: "",
      score_tech: "",
      score_market: "",
      score_velocity: "",
      score_readiness: "",
    }),
  decision: z.object({
    review_status: z.enum(REVIEW_STATUSES),
    rationale: z.string().max(5000).optional().default(""),
    reviewer: z.string().max(200).optional().default(""),
    review_date: z.string().max(40).optional().default(""),
    follow_up_review_by_date: z.string().max(40).optional().default(""),
    recommended_next_action: z
      .enum(RECOMMENDED_NEXT_ACTIONS)
      .default("Validate"),
    next_action_owner: z.string().max(200).optional().default(""),
    next_gating_milestone: z.string().max(2000).optional(),
    internal_notes: z.string().max(5000).optional(),
  }),
});

export type ScreeningPayload = {
  version: 1;
  form: ApplicantForm;
  evaluation?: ScreeningEvaluation | null;
};

const payloadSchema = z.object({
  version: z.literal(1),
  form: applicantFormSchema,
  evaluation: screeningEvaluationStoredSchema.nullish(),
});

export function encodeScreeningPayload(payload: ScreeningPayload): string {
  return JSON.stringify(payload);
}

export function parseScreeningPayload(
  description: string | null | undefined,
): ScreeningPayload | null {
  if (!description) return null;

  try {
    const parsed: unknown = JSON.parse(description);
    const result = payloadSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function getApplicationSummary(
  description: string | null | undefined,
): string {
  const payload = parseScreeningPayload(description);
  if (payload) return payload.form.company.problem_statement;
  return description ?? "";
}

export function averageScore(scores: ScreeningEvaluation["scores"]): number {
  const values = Object.values(scores);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function isCurrentlyRaising(
  value: (typeof RAISING_STATUSES)[number] | "" | undefined,
) {
  return value === "Yes";
}

export function isIdeaStage(
  stage: (typeof PRODUCT_STAGES)[number] | "" | undefined,
) {
  return stage === "Idea";
}

/** Idea-stage applicants may skip a pitch-deck file if they share a mock-up/demo link or written brief. */
export function ideaStageHasDeckAlternative(
  company: Pick<
    ApplicantForm["company"],
    "demo_asset_type" | "demo_link" | "written_brief"
  >,
) {
  if (company.written_brief?.trim()) return true;
  const link = company.demo_link?.trim();
  return Boolean(
    company.demo_asset_type &&
      company.demo_asset_type !== "None" &&
      link &&
      URL.canParse(link),
  );
}

export function instrumentNeedsValuation(
  instrument: (typeof FUNDING_INSTRUMENTS)[number] | "" | undefined,
) {
  return needsValuationCap(instrument);
}

export function instrumentIsEquity(
  instrument: (typeof FUNDING_INSTRUMENTS)[number] | "" | undefined,
) {
  return isEquityInstrument(instrument);
}

export function instrumentIsSafeOrNote(
  instrument: (typeof FUNDING_INSTRUMENTS)[number] | "" | undefined,
) {
  return isSafeOrNote(instrument);
}

export function showTransactionMetrics(
  sector: (typeof SECTORS)[number] | "" | undefined,
  pricingModel: (typeof PRICING_MODELS)[number] | "" | undefined,
) {
  return (
    isTransactionOrientedSector(sector) ||
    pricingModel === "Transaction / take-rate" ||
    pricingModel === "Marketplace" ||
    pricingModel === "Usage-based"
  );
}

export function isPartTimeFounder(
  status: (typeof FULL_TIME_STATUSES)[number] | "" | undefined,
) {
  return isPartTime(status);
}

export function demoLinkRequired(
  stage: (typeof PRODUCT_STAGES)[number] | "" | undefined,
  demoAsset: (typeof DEMO_ASSET_TYPES)[number] | "" | undefined,
) {
  return needsDemoLink(stage, demoAsset);
}

export const SCORE_FIELDS = [
  {
    key: "score_founder",
    label: "Founder",
  },
  {
    key: "score_validation",
    label: "Validation",
  },
  {
    key: "score_tech",
    label: "Technical defensibility / execution",
  },
  {
    key: "score_market",
    label: "Market",
  },
  {
    key: "score_velocity",
    label: "Velocity",
  },
  {
    key: "score_readiness",
    label: "Readiness",
  },
] as const satisfies ReadonlyArray<{
  key: keyof ScreeningEvaluation["scores"];
  label: string;
}>;

/** One-line definitions for each 1–5 score, for consistent reviewer calibration. */
export const SCORE_DEFINITIONS: Record<
  keyof ScreeningEvaluation["scores"],
  Record<"1" | "2" | "3" | "4" | "5", string>
> = {
  score_founder: {
    "1": "Weak or mismatched founder fit for this problem",
    "2": "Incomplete team or unclear relevant experience",
    "3": "Credible team with some relevant domain or execution background",
    "4": "Strong domain insight plus evidence of execution ability",
    "5": "Exceptional founder–market fit and proven high-agency execution",
  },
  score_validation: {
    "1": "No meaningful customer or demand evidence",
    "2": "Anecdotes only; weak or unverifiable signals",
    "3": "Some interviews, pilots, or usage with partial proof",
    "4": "Clear demand signal with credible evidence",
    "5": "Compelling, recent proof of pull (conversion, retention, or revenue)",
  },
  score_tech: {
    "1": "Approach unclear or not feasible as described",
    "2": "Vague path; high execution or defensibility risk",
    "3": "Plausible product path with limited defensibility",
    "4": "Credible technical edge or hard-to-copy execution plan",
    "5": "Clear, durable technical advantage or rare execution capability",
  },
  score_market: {
    "1": "Market too small, unclear, or poorly timed",
    "2": "Thin opportunity or weak why-now",
    "3": "Real market with moderate timing and size",
    "4": "Strong timing with a meaningful expanding opportunity",
    "5": "Large, timely market with a sharp wedge",
  },
  score_velocity: {
    "1": "Stalled or no meaningful recent progress",
    "2": "Slow progress relative to stage",
    "3": "Steady shipping and learning cadence",
    "4": "Fast iteration with visible weekly progress",
    "5": "Outstanding pace of learning and shipping for stage",
  },
  score_readiness: {
    "1": "Not ready for any external intro",
    "2": "Materials or ask too weak for intros",
    "3": "Ready for a narrow, staged conversation",
    "4": "Intro-ready with a clear ask and usable materials",
    "5": "Fully packaged for the intended counterpart route",
  },
};

/** @deprecated Prefer SCORE_DEFINITIONS; kept for any 2/3/4 summary UIs. */
export const SCORE_ANCHORS: Record<
  keyof ScreeningEvaluation["scores"],
  { "2": string; "3": string; "4": string }
> = {
  score_founder: {
    "2": SCORE_DEFINITIONS.score_founder["2"],
    "3": SCORE_DEFINITIONS.score_founder["3"],
    "4": SCORE_DEFINITIONS.score_founder["4"],
  },
  score_validation: {
    "2": SCORE_DEFINITIONS.score_validation["2"],
    "3": SCORE_DEFINITIONS.score_validation["3"],
    "4": SCORE_DEFINITIONS.score_validation["4"],
  },
  score_tech: {
    "2": SCORE_DEFINITIONS.score_tech["2"],
    "3": SCORE_DEFINITIONS.score_tech["3"],
    "4": SCORE_DEFINITIONS.score_tech["4"],
  },
  score_market: {
    "2": SCORE_DEFINITIONS.score_market["2"],
    "3": SCORE_DEFINITIONS.score_market["3"],
    "4": SCORE_DEFINITIONS.score_market["4"],
  },
  score_velocity: {
    "2": SCORE_DEFINITIONS.score_velocity["2"],
    "3": SCORE_DEFINITIONS.score_velocity["3"],
    "4": SCORE_DEFINITIONS.score_velocity["4"],
  },
  score_readiness: {
    "2": SCORE_DEFINITIONS.score_readiness["2"],
    "3": SCORE_DEFINITIONS.score_readiness["3"],
    "4": SCORE_DEFINITIONS.score_readiness["4"],
  },
};
