"use client";

import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ACQUISITION_CHANNELS,
  COMPANY_STAGES,
  CONNECTION_REQUESTS,
  CURRENCIES,
  DEMO_ASSET_TYPES,
  EQUITY_VALUATION_TYPES,
  FULL_TIME_STATUSES,
  FUNDING_INSTRUMENTS,
  LEGAL_STATUSES,
  PILOT_COMPENSATION,
  PILOT_STAGES,
  PILOT_VALUE_TYPES,
  PRICING_MODELS,
  PRODUCT_STAGES,
  RAISING_STATUSES,
  REGULATORY_STATUSES,
  SECTORS,
  SUBSECTORS_BY_SECTOR,
  YES_NO,
  demoLinkRequired,
  instrumentIsEquity,
  instrumentIsSafeOrNote,
  instrumentNeedsValuation,
  isCurrentlyRaising,
  isIdeaStage,
  isPartTimeFounder,
  showTransactionMetrics,
  type ApplicantForm,
} from "@/lib/screening";

type ScreeningFormValues = {
  screening: ApplicantForm;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-medium">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function MetricBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl border bg-muted/10 p-4 md:col-span-2">
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-3">{children}</div>
    </div>
  );
}

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-neutral-50 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

export function ApplicationScreeningFields({
  form,
  founderExtras,
  decisionMakerOptions = [],
}: {
  form: UseFormReturn<ScreeningFormValues & Record<string, unknown>>;
  founderExtras?: React.ReactNode;
  decisionMakerOptions?: Array<{ value: string; label: string }>;
}) {
  const errors = form.formState.errors.screening;
  const fullTimeStatus = form.watch("screening.founder.full_time_status");
  const sector = form.watch("screening.company.sector");
  const subsector = form.watch("screening.company.subsector");
  const legalStatus = form.watch("screening.company.legal_status");
  const productStage = form.watch("screening.company.product_stage");
  const demoAssetType = form.watch("screening.company.demo_asset_type");
  const pricingModel = form.watch("screening.company.pricing_model");
  const regulatoryStatus = form.watch("screening.company.regulatory_status");
  const acquisitionChannel = form.watch(
    "screening.validation.customer_acquisition_channel",
  );
  const currentlyRaising = form.watch("screening.fundraising.currently_raising");
  const instrument = form.watch("screening.fundraising.funding_instrument");
  const raising = isCurrentlyRaising(currentlyRaising);
  const needsCap = instrumentNeedsValuation(instrument);
  const isEquity = instrumentIsEquity(instrument);
  const isSafeNote = instrumentIsSafeOrNote(instrument);
  const needDemo = demoLinkRequired(productStage, demoAssetType);
  const ideaStage = isIdeaStage(productStage);
  const showTxnMetrics = showTransactionMetrics(sector, pricingModel);
  const pilotsCount = form.watch("screening.validation.pilots_count");
  const loisCount = form.watch("screening.validation.lois_count");
  const activeUsers = form.watch("screening.validation.active_users_count");
  const payingCustomers = form.watch(
    "screening.validation.paying_customers_count",
  );
  const retentionPercent = form.watch("screening.validation.retention_percent");
  const northStarValue = form.watch("screening.validation.north_star_value");
  const currentMrr = form.watch("screening.validation.current_mrr");
  const subsectorOptions = SUBSECTORS_BY_SECTOR[sector] ?? ["Other"];

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="font-medium">Founder</h3>
          <p className="text-sm text-muted-foreground">
            Who is applying, the team, and application assets.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="founder_name">Founder name</Label>
            <Input
              id="founder_name"
              {...form.register("screening.founder.founder_name")}
              placeholder="Jane Doe"
            />
            <FieldError message={errors?.founder?.founder_name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="founder_role">Your role</Label>
            <Input
              id="founder_role"
              {...form.register("screening.founder.founder_role")}
              placeholder="CEO / CTO"
            />
            <FieldError message={errors?.founder?.founder_role?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="founder_email">Founder email</Label>
            <Input
              id="founder_email"
              type="email"
              {...form.register("screening.founder.founder_email")}
              placeholder="jane@example.com"
            />
            <FieldError message={errors?.founder?.founder_email?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primary_decision_maker">
              Primary decision-maker / contact
            </Label>
            <select
              id="primary_decision_maker"
              className={selectClassName}
              {...form.register("screening.founder.primary_decision_maker")}
            >
              <option value="">Select from team</option>
              {decisionMakerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError
              message={errors?.founder?.primary_decision_maker?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_whatsapp">
              Phone / WhatsApp{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id="phone_whatsapp"
              {...form.register("screening.founder.phone_whatsapp")}
              placeholder="+62 …"
            />
            <FieldError message={errors?.founder?.phone_whatsapp?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="founder_count">Number of founders</Label>
            <Input
              id="founder_count"
              type="number"
              min={1}
              {...form.register("screening.founder.founder_count")}
            />
            <FieldError message={errors?.founder?.founder_count?.message} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="founder_experience">Founder experience</Label>
            <Textarea
              id="founder_experience"
              rows={3}
              {...form.register("screening.founder.founder_experience")}
              placeholder="Relevant background, prior startups, domain expertise"
            />
            <FieldError message={errors?.founder?.founder_experience?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="founder_contact">LinkedIn</Label>
            <Input
              id="founder_contact"
              type="url"
              {...form.register("screening.founder.founder_contact")}
              placeholder="https://linkedin.com/in/..."
            />
            <FieldError message={errors?.founder?.founder_contact?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_time_status">Full-time status</Label>
            <select
              id="full_time_status"
              className={selectClassName}
              {...form.register("screening.founder.full_time_status")}
            >
              {FULL_TIME_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <FieldError message={errors?.founder?.full_time_status?.message} />
          </div>
          {isPartTimeFounder(fullTimeStatus) ? (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="part_time_full_time_date">
                Expected date each part-time founder becomes full-time
              </Label>
              <Input
                id="part_time_full_time_date"
                type="date"
                {...form.register("screening.founder.part_time_full_time_date")}
              />
              <FieldError
                message={errors?.founder?.part_time_full_time_date?.message}
              />
            </div>
          ) : null}
        </div>
        {founderExtras}
      </section>

      <Section title="Company" description="What you are building.">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company name</Label>
          <Input
            id="company_name"
            {...form.register("screening.company.company_name")}
            placeholder="Acme"
          />
          <FieldError message={errors?.company?.company_name?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_website">
            Company website{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="company_website"
            type="url"
            {...form.register("screening.company.company_website")}
            placeholder="https://…"
          />
          <FieldError message={errors?.company?.company_website?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product_stage">Product stage</Label>
          <select
            id="product_stage"
            className={selectClassName}
            {...form.register("screening.company.product_stage")}
          >
            {PRODUCT_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <FieldError message={errors?.company?.product_stage?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sector">Sector</Label>
          <select
            id="sector"
            className={selectClassName}
            {...form.register("screening.company.sector", {
              onChange: () => {
                form.setValue("screening.company.subsector", "Other");
              },
            })}
          >
            {SECTORS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <FieldError message={errors?.company?.sector?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subsector">Subsector</Label>
          <select
            id="subsector"
            className={selectClassName}
            {...form.register("screening.company.subsector")}
          >
            {subsectorOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <FieldError message={errors?.company?.subsector?.message} />
        </div>
        {sector === "Other" ? (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="sector_other">Describe sector</Label>
            <Input
              id="sector_other"
              {...form.register("screening.company.sector_other")}
            />
            <FieldError message={errors?.company?.sector_other?.message} />
          </div>
        ) : null}
        {subsector === "Other" ? (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="subsector_other">Describe subsector</Label>
            <Input
              id="subsector_other"
              {...form.register("screening.company.subsector_other")}
            />
            <FieldError message={errors?.company?.subsector_other?.message} />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="operating_country">Operating country</Label>
          <Input
            id="operating_country"
            {...form.register("screening.company.operating_country")}
            placeholder="Indonesia"
          />
          <FieldError message={errors?.company?.operating_country?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="operating_city">Operating city</Label>
          <Input
            id="operating_city"
            {...form.register("screening.company.operating_city")}
            placeholder="Jakarta"
          />
          <FieldError message={errors?.company?.operating_city?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="legal_status">Legal status</Label>
          <select
            id="legal_status"
            className={selectClassName}
            {...form.register("screening.company.legal_status")}
          >
            {LEGAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <FieldError message={errors?.company?.legal_status?.message} />
        </div>
        {legalStatus !== "Not Incorporated" ? (
          <div className="space-y-2">
            <Label htmlFor="incorporation_jurisdiction">
              Incorporation jurisdiction
            </Label>
            <Input
              id="incorporation_jurisdiction"
              {...form.register("screening.company.incorporation_jurisdiction")}
              placeholder="e.g. Delaware, Singapore, Indonesia"
            />
            <FieldError
              message={errors?.company?.incorporation_jurisdiction?.message}
            />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="founder_ownership_percent">
            Aggregate founder ownership (%)
          </Label>
          <Input
            id="founder_ownership_percent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            {...form.register("screening.company.founder_ownership_percent")}
            placeholder="e.g. 85"
          />
          <FieldError
            message={errors?.company?.founder_ownership_percent?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownership_employees_percent">Employees / ESOP (%)</Label>
          <Input
            id="ownership_employees_percent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            {...form.register("screening.company.ownership_employees_percent")}
          />
          <FieldError
            message={errors?.company?.ownership_employees_percent?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownership_advisors_percent">Advisors (%)</Label>
          <Input
            id="ownership_advisors_percent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            {...form.register("screening.company.ownership_advisors_percent")}
          />
          <FieldError
            message={errors?.company?.ownership_advisors_percent?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownership_investors_percent">Investors (%)</Label>
          <Input
            id="ownership_investors_percent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            {...form.register("screening.company.ownership_investors_percent")}
          />
          <FieldError
            message={errors?.company?.ownership_investors_percent?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownership_unallocated_percent">
            Unallocated / other (%)
          </Label>
          <Input
            id="ownership_unallocated_percent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            {...form.register("screening.company.ownership_unallocated_percent")}
          />
          <FieldError
            message={errors?.company?.ownership_unallocated_percent?.message}
          />
          <p className="text-xs text-muted-foreground">
            All buckets default to 0 and must total 100%.
          </p>
        </div>
        {productStage === "Idea" ? (
          <div className="space-y-2">
            <Label htmlFor="demo_asset_type">What can you share today?</Label>
            <select
              id="demo_asset_type"
              className={selectClassName}
              {...form.register("screening.company.demo_asset_type")}
            >
              {DEMO_ASSET_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <FieldError message={errors?.company?.demo_asset_type?.message} />
          </div>
        ) : null}
        {needDemo || productStage !== "Idea" ? (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="demo_link">
              {productStage === "Idea"
                ? "Deck / mock-up / demo link"
                : "Demo link"}
            </Label>
            <Input
              id="demo_link"
              type="url"
              {...form.register("screening.company.demo_link")}
              placeholder="https://…"
            />
            <FieldError message={errors?.company?.demo_link?.message} />
          </div>
        ) : null}
        {ideaStage ? (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="written_brief">
              Concise written brief
              {demoAssetType === "None" ? "" : " (optional if you share a link)"}
            </Label>
            <Textarea
              id="written_brief"
              rows={4}
              {...form.register("screening.company.written_brief")}
              placeholder="Problem, solution, who it is for, and what you have built or learned so far"
            />
            <FieldError message={errors?.company?.written_brief?.message} />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="regulatory_status">Regulatory dependency</Label>
          <select
            id="regulatory_status"
            className={selectClassName}
            {...form.register("screening.company.regulatory_status")}
          >
            {REGULATORY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <FieldError message={errors?.company?.regulatory_status?.message} />
        </div>
        {regulatoryStatus === "Yes" ? (
          <>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="regulatory_authority">
                Regulator / licence / partner dependency
              </Label>
              <Input
                id="regulatory_authority"
                {...form.register("screening.company.regulatory_authority")}
                placeholder="e.g. OJK P2P licence, BPOM, carbon registry, custody partner"
              />
              <FieldError
                message={errors?.company?.regulatory_authority?.message}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="regulatory_explanation">
                Short explanation
              </Label>
              <Textarea
                id="regulatory_explanation"
                rows={2}
                {...form.register("screening.company.regulatory_explanation")}
                placeholder="What is required, status, and timeline"
              />
              <FieldError
                message={errors?.company?.regulatory_explanation?.message}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="regulatory_evidence_link">
                Evidence link (optional)
              </Label>
              <Input
                id="regulatory_evidence_link"
                type="url"
                {...form.register("screening.company.regulatory_evidence_link")}
                placeholder="https://…"
              />
              <FieldError
                message={errors?.company?.regulatory_evidence_link?.message}
              />
            </div>
          </>
        ) : null}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="product_description">
            One-line product description{" "}
            <span className="font-normal text-muted-foreground">(max 120)</span>
          </Label>
          <Input
            id="product_description"
            maxLength={120}
            {...form.register("screening.company.product_description")}
            placeholder="What you build in one sentence"
          />
          <FieldError message={errors?.company?.product_description?.message} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="problem_statement">
            Problem statement{" "}
            <span className="font-normal text-muted-foreground">(max 150)</span>
          </Label>
          <Textarea
            id="problem_statement"
            rows={3}
            maxLength={150}
            {...form.register("screening.company.problem_statement")}
            placeholder="Who has what painful problem?"
          />
          <FieldError message={errors?.company?.problem_statement?.message} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="who_pays">Who pays</Label>
          <Input
            id="who_pays"
            {...form.register("screening.company.who_pays")}
            placeholder="End user, enterprise buyer, marketplace take-rate, etc."
          />
          <FieldError message={errors?.company?.who_pays?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pricing_model">Pricing model</Label>
          <select
            id="pricing_model"
            className={selectClassName}
            {...form.register("screening.company.pricing_model")}
          >
            {PRICING_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <FieldError message={errors?.company?.pricing_model?.message} />
        </div>
        {pricingModel === "Other" ? (
          <div className="space-y-2">
            <Label htmlFor="pricing_model_other">Describe pricing model</Label>
            <Input
              id="pricing_model_other"
              {...form.register("screening.company.pricing_model_other")}
            />
            <FieldError
              message={errors?.company?.pricing_model_other?.message}
            />
          </div>
        ) : (
          <div />
        )}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="gross_margin_percent">
            Gross margin (%){" "}
            <span className="font-normal text-muted-foreground">
              (optional, where applicable)
            </span>
          </Label>
          <Input
            id="gross_margin_percent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            {...form.register("screening.company.gross_margin_percent")}
            placeholder="e.g. 70"
          />
          <FieldError message={errors?.company?.gross_margin_percent?.message} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="unit_economics">
            Other unit economics notes{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="unit_economics"
            rows={2}
            {...form.register("screening.company.unit_economics")}
            placeholder="Avg ticket, contribution margin, CAC payback, etc."
          />
          <FieldError message={errors?.company?.unit_economics?.message} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="competition_alternatives">
            Direct competition / alternatives
          </Label>
          <Textarea
            id="competition_alternatives"
            rows={3}
            {...form.register("screening.company.competition_alternatives")}
            placeholder="Who else solves this, including status quo / DIY"
          />
          <FieldError
            message={errors?.company?.competition_alternatives?.message}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="why_now_why_team">Why now / why this team</Label>
          <Textarea
            id="why_now_why_team"
            rows={3}
            {...form.register("screening.company.why_now_why_team")}
            placeholder="Timing and why you are the right team"
          />
          <FieldError message={errors?.company?.why_now_why_team?.message} />
        </div>
      </Section>

      <Section
        title="Validation"
        description="Evidence of demand and traction. Use one as-of date per metric. Active users = active in the last 30 days."
      >
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="customer_segment">Customer segment</Label>
          <Input
            id="customer_segment"
            {...form.register("screening.validation.customer_segment")}
            placeholder="Who buys / uses this?"
          />
          <FieldError message={errors?.validation?.customer_segment?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_acquisition_channel">
            Customer acquisition channel
          </Label>
          <select
            id="customer_acquisition_channel"
            className={selectClassName}
            {...form.register(
              "screening.validation.customer_acquisition_channel",
            )}
          >
            {ACQUISITION_CHANNELS.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
          <FieldError
            message={errors?.validation?.customer_acquisition_channel?.message}
          />
        </div>
        {acquisitionChannel === "Other" ? (
          <div className="space-y-2">
            <Label htmlFor="acquisition_channel_other">
              Describe acquisition channel
            </Label>
            <Input
              id="acquisition_channel_other"
              {...form.register("screening.validation.acquisition_channel_other")}
            />
            <FieldError
              message={errors?.validation?.acquisition_channel_other?.message}
            />
          </div>
        ) : (
          <div />
        )}

        <MetricBlock title="Customer interviews">
          <div className="space-y-2">
            <Label htmlFor="interview_count">Count</Label>
            <Input
              id="interview_count"
              type="number"
              min={0}
              {...form.register("screening.validation.interview_count")}
            />
            <FieldError message={errors?.validation?.interview_count?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interview_as_of">As of</Label>
            <Input
              id="interview_as_of"
              type="date"
              {...form.register("screening.validation.interview_as_of")}
            />
            <FieldError message={errors?.validation?.interview_as_of?.message} />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="interview_learnings">
              What you learned from interviews
            </Label>
            <Textarea
              id="interview_learnings"
              rows={3}
              {...form.register("screening.validation.interview_learnings")}
              placeholder="Key insights, not raw notes"
            />
            <FieldError
              message={errors?.validation?.interview_learnings?.message}
            />
          </div>
        </MetricBlock>

        <MetricBlock
          title="Active pilots"
          description="Paid or unpaid pilots currently running. Separate from LOIs."
        >
          <div className="space-y-2">
            <Label htmlFor="pilots_count">Count</Label>
            <Input
              id="pilots_count"
              type="number"
              min={0}
              {...form.register("screening.validation.pilots_count")}
            />
            <FieldError message={errors?.validation?.pilots_count?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pilots_as_of">As of</Label>
            <Input
              id="pilots_as_of"
              type="date"
              {...form.register("screening.validation.pilots_as_of")}
            />
            <FieldError message={errors?.validation?.pilots_as_of?.message} />
          </div>
          {Number(pilotsCount) > 0 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="pilots_compensation">Paid or unpaid</Label>
                <select
                  id="pilots_compensation"
                  className={selectClassName}
                  {...form.register("screening.validation.pilots_compensation")}
                >
                  <option value="">Select</option>
                  {PILOT_COMPENSATION.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <FieldError
                  message={errors?.validation?.pilots_compensation?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pilots_stage">Pilot stage</Label>
                <select
                  id="pilots_stage"
                  className={selectClassName}
                  {...form.register("screening.validation.pilots_stage")}
                >
                  <option value="">Select</option>
                  {PILOT_STAGES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <FieldError
                  message={errors?.validation?.pilots_stage?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pilots_contract_value">
                  Contract value{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="pilots_contract_value"
                  type="number"
                  min={0}
                  step="0.01"
                  {...form.register("screening.validation.pilots_contract_value")}
                />
                <FieldError
                  message={errors?.validation?.pilots_contract_value?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pilots_contract_value_type">
                  Contract value type
                </Label>
                <select
                  id="pilots_contract_value_type"
                  className={selectClassName}
                  {...form.register(
                    "screening.validation.pilots_contract_value_type",
                  )}
                >
                  <option value="">Select</option>
                  {PILOT_VALUE_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <FieldError
                  message={
                    errors?.validation?.pilots_contract_value_type?.message
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pilots_contract_currency">
                  Contract currency
                </Label>
                <select
                  id="pilots_contract_currency"
                  className={selectClassName}
                  {...form.register(
                    "screening.validation.pilots_contract_currency",
                  )}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pilots_expected_conversion_date">
                  Expected conversion date{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="pilots_expected_conversion_date"
                  type="date"
                  {...form.register(
                    "screening.validation.pilots_expected_conversion_date",
                  )}
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="pilots_evidence">
                  Evidence (link or short note)
                </Label>
                <Textarea
                  id="pilots_evidence"
                  rows={2}
                  {...form.register("screening.validation.pilots_evidence")}
                />
                <FieldError
                  message={errors?.validation?.pilots_evidence?.message}
                />
              </div>
            </>
          ) : null}
        </MetricBlock>

        <MetricBlock
          title="LOIs / design partners"
          description="Signed LOIs or committed design partners, separate from active pilots."
        >
          <div className="space-y-2">
            <Label htmlFor="lois_count">Count</Label>
            <Input
              id="lois_count"
              type="number"
              min={0}
              {...form.register("screening.validation.lois_count")}
            />
            <FieldError message={errors?.validation?.lois_count?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lois_as_of">As of</Label>
            <Input
              id="lois_as_of"
              type="date"
              {...form.register("screening.validation.lois_as_of")}
            />
            <FieldError message={errors?.validation?.lois_as_of?.message} />
          </div>
          {Number(loisCount) > 0 ? (
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="lois_evidence">
                Evidence (link or short note)
              </Label>
              <Textarea
                id="lois_evidence"
                rows={2}
                {...form.register("screening.validation.lois_evidence")}
              />
              <FieldError message={errors?.validation?.lois_evidence?.message} />
            </div>
          ) : null}
        </MetricBlock>

        <MetricBlock
          title="Active users"
          description="Users active in the last 30 days."
        >
          <div className="space-y-2">
            <Label htmlFor="active_users_count">Count</Label>
            <Input
              id="active_users_count"
              type="number"
              min={0}
              {...form.register("screening.validation.active_users_count")}
            />
            <FieldError
              message={errors?.validation?.active_users_count?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="active_users_as_of">As of</Label>
            <Input
              id="active_users_as_of"
              type="date"
              {...form.register("screening.validation.active_users_as_of")}
            />
            <FieldError
              message={errors?.validation?.active_users_as_of?.message}
            />
          </div>
          {Number(activeUsers) > 0 ? (
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="active_users_evidence">
                Evidence (link or short note)
              </Label>
              <Textarea
                id="active_users_evidence"
                rows={2}
                {...form.register("screening.validation.active_users_evidence")}
              />
              <FieldError
                message={errors?.validation?.active_users_evidence?.message}
              />
            </div>
          ) : null}
        </MetricBlock>

        <MetricBlock title="Paying customers">
          <div className="space-y-2">
            <Label htmlFor="paying_customers_count">Count</Label>
            <Input
              id="paying_customers_count"
              type="number"
              min={0}
              {...form.register("screening.validation.paying_customers_count")}
            />
            <FieldError
              message={errors?.validation?.paying_customers_count?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paying_customers_as_of">As of</Label>
            <Input
              id="paying_customers_as_of"
              type="date"
              {...form.register("screening.validation.paying_customers_as_of")}
            />
            <FieldError
              message={errors?.validation?.paying_customers_as_of?.message}
            />
          </div>
          {Number(payingCustomers) > 0 ? (
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="paying_customers_evidence">
                Evidence (link or short note)
              </Label>
              <Textarea
                id="paying_customers_evidence"
                rows={2}
                {...form.register(
                  "screening.validation.paying_customers_evidence",
                )}
              />
              <FieldError
                message={errors?.validation?.paying_customers_evidence?.message}
              />
            </div>
          ) : null}
        </MetricBlock>

        <MetricBlock title="Retention (optional)">
          <div className="space-y-2">
            <Label htmlFor="retention_percent">Retention (%)</Label>
            <Input
              id="retention_percent"
              type="number"
              min={0}
              max={100}
              step="0.01"
              {...form.register("screening.validation.retention_percent")}
              placeholder="e.g. 40"
            />
            <FieldError
              message={errors?.validation?.retention_percent?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retention_as_of">As of</Label>
            <Input
              id="retention_as_of"
              type="date"
              {...form.register("screening.validation.retention_as_of")}
            />
            <FieldError message={errors?.validation?.retention_as_of?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retention_measurement_window">
              Measurement window
            </Label>
            <Input
              id="retention_measurement_window"
              {...form.register(
                "screening.validation.retention_measurement_window",
              )}
              placeholder="e.g. D30, Week 4, Month 3"
            />
            <FieldError
              message={
                errors?.validation?.retention_measurement_window?.message
              }
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="retention_cohort_definition">
              Cohort / definition
            </Label>
            <Input
              id="retention_cohort_definition"
              {...form.register(
                "screening.validation.retention_cohort_definition",
              )}
              placeholder="e.g. users who completed onboarding in Jan 2026"
            />
            <FieldError
              message={
                errors?.validation?.retention_cohort_definition?.message
              }
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="revenue_retention">
              Repeat / revenue retention (optional)
            </Label>
            <Input
              id="revenue_retention"
              {...form.register("screening.validation.revenue_retention")}
              placeholder="e.g. 90% net revenue retention"
            />
            <FieldError
              message={errors?.validation?.revenue_retention?.message}
            />
          </div>
          {retentionPercent !== undefined &&
          retentionPercent !== null &&
          String(retentionPercent) !== "" &&
          !Number.isNaN(Number(retentionPercent)) ? (
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="retention_evidence">
                Evidence (link or short note)
              </Label>
              <Textarea
                id="retention_evidence"
                rows={2}
                {...form.register("screening.validation.retention_evidence")}
              />
              <FieldError
                message={errors?.validation?.retention_evidence?.message}
              />
            </div>
          ) : null}
        </MetricBlock>

        {showTxnMetrics ? (
          <MetricBlock
            title="GMV / TPV & take rate"
            description="Optional for marketplaces, fintech, and transaction businesses."
          >
            <div className="space-y-2">
              <Label htmlFor="gmv_tpv">GMV / TPV</Label>
              <Input
                id="gmv_tpv"
                type="number"
                min={0}
                step="0.01"
                {...form.register("screening.validation.gmv_tpv")}
              />
              <FieldError message={errors?.validation?.gmv_tpv?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gmv_tpv_currency">Currency</Label>
              <select
                id="gmv_tpv_currency"
                className={selectClassName}
                {...form.register("screening.validation.gmv_tpv_currency")}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction_reporting_period">
                Reporting period
              </Label>
              <Input
                id="transaction_reporting_period"
                {...form.register(
                  "screening.validation.transaction_reporting_period",
                )}
                placeholder="e.g. last 30 days, Q2 2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="net_revenue">Net revenue</Label>
              <Input
                id="net_revenue"
                type="number"
                min={0}
                step="0.01"
                {...form.register("screening.validation.net_revenue")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="net_revenue_currency">Net revenue currency</Label>
              <select
                id="net_revenue_currency"
                className={selectClassName}
                {...form.register("screening.validation.net_revenue_currency")}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="take_rate_percent">Take rate (%)</Label>
              <Input
                id="take_rate_percent"
                type="number"
                min={0}
                max={100}
                step="0.01"
                {...form.register("screening.validation.take_rate_percent")}
              />
            </div>
          </MetricBlock>
        ) : null}

        <MetricBlock
          title="Most important metric"
          description="The signal that matters most for your sector (e.g. GMV, pipeline, deployments, engagement, pilot conversion)."
        >
          <div className="space-y-2">
            <Label htmlFor="north_star_metric">Metric</Label>
            <Input
              id="north_star_metric"
              {...form.register("screening.validation.north_star_metric")}
              placeholder="e.g. Monthly GMV"
            />
            <FieldError
              message={errors?.validation?.north_star_metric?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="north_star_value">Value</Label>
            <Input
              id="north_star_value"
              {...form.register("screening.validation.north_star_value")}
              placeholder="e.g. $120k"
            />
            <FieldError
              message={errors?.validation?.north_star_value?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="north_star_as_of">As of</Label>
            <Input
              id="north_star_as_of"
              type="date"
              {...form.register("screening.validation.north_star_as_of")}
            />
            <FieldError
              message={errors?.validation?.north_star_as_of?.message}
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="north_star_why">
              Why this is the most important metric
            </Label>
            <Textarea
              id="north_star_why"
              rows={2}
              {...form.register("screening.validation.north_star_why")}
              placeholder="e.g. Users are not the signal yet — pipeline / deployments / qualified design partners matter more"
            />
            <FieldError message={errors?.validation?.north_star_why?.message} />
          </div>
          {northStarValue?.trim() &&
          !/^(0+|0+(\.0+)?|0+%|\$?0+(\.0+)?)$/i.test(northStarValue.trim()) ? (
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="north_star_evidence">
                Data source / evidence
              </Label>
              <Textarea
                id="north_star_evidence"
                rows={2}
                {...form.register("screening.validation.north_star_evidence")}
                placeholder="Dashboard link, CRM export, or short note"
              />
              <FieldError
                message={errors?.validation?.north_star_evidence?.message}
              />
            </div>
          ) : null}
        </MetricBlock>

        <MetricBlock title="MRR">
          <div className="space-y-2">
            <Label htmlFor="current_mrr">Amount</Label>
            <Input
              id="current_mrr"
              type="number"
              min={0}
              step="0.01"
              {...form.register("screening.validation.current_mrr")}
            />
            <FieldError message={errors?.validation?.current_mrr?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mrr_currency">Currency</Label>
            <select
              id="mrr_currency"
              className={selectClassName}
              {...form.register("screening.validation.mrr_currency")}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            <FieldError message={errors?.validation?.mrr_currency?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mrr_as_of">As of</Label>
            <Input
              id="mrr_as_of"
              type="date"
              {...form.register("screening.validation.mrr_as_of")}
            />
            <FieldError message={errors?.validation?.mrr_as_of?.message} />
          </div>
          {Number(currentMrr) > 0 ? (
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="mrr_evidence">
                Evidence (link or short note)
              </Label>
              <Textarea
                id="mrr_evidence"
                rows={2}
                {...form.register("screening.validation.mrr_evidence")}
                placeholder="Stripe, invoices, contracts, dashboard…"
              />
              <FieldError message={errors?.validation?.mrr_evidence?.message} />
            </div>
          ) : null}
        </MetricBlock>
      </Section>

      <Section title="Fundraising" description="Company stage and raise plans.">
        <div className="space-y-2">
          <Label htmlFor="company_stage">Company stage</Label>
          <select
            id="company_stage"
            className={selectClassName}
            {...form.register("screening.fundraising.company_stage")}
          >
            {COMPANY_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <FieldError message={errors?.fundraising?.company_stage?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currently_raising">Currently raising?</Label>
          <select
            id="currently_raising"
            className={selectClassName}
            {...form.register("screening.fundraising.currently_raising")}
          >
            {RAISING_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldError
            message={errors?.fundraising?.currently_raising?.message}
          />
          <p className="text-xs text-muted-foreground">
            Choose “Not raising / seeking non-dilutive support only” if you are
            not running an equity or convertible round.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="capital_raised_to_date">Capital raised to date</Label>
          <Input
            id="capital_raised_to_date"
            type="number"
            min={0}
            step="0.01"
            {...form.register("screening.fundraising.capital_raised_to_date")}
          />
          <FieldError
            message={errors?.fundraising?.capital_raised_to_date?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capital_raised_currency">
            Capital raised currency
          </Label>
          <select
            id="capital_raised_currency"
            className={selectClassName}
            {...form.register("screening.fundraising.capital_raised_currency")}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <FieldError
            message={errors?.fundraising?.capital_raised_currency?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capital_raised_as_of">Capital raised as of</Label>
          <Input
            id="capital_raised_as_of"
            type="date"
            {...form.register("screening.fundraising.capital_raised_as_of")}
          />
          <FieldError
            message={errors?.fundraising?.capital_raised_as_of?.message}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="prior_investors_grants">
            Prior investors / grants (if any)
          </Label>
          <Textarea
            id="prior_investors_grants"
            rows={2}
            {...form.register("screening.fundraising.prior_investors_grants")}
            placeholder="Optional"
          />
          <FieldError
            message={errors?.fundraising?.prior_investors_grants?.message}
          />
        </div>
        {raising ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="funding_instrument">Funding instrument</Label>
              <select
                id="funding_instrument"
                className={selectClassName}
                {...form.register("screening.fundraising.funding_instrument")}
              >
                {FUNDING_INSTRUMENTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <FieldError
                message={errors?.fundraising?.funding_instrument?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="runway_months">Runway (months)</Label>
              <Input
                id="runway_months"
                type="number"
                min={0}
                {...form.register("screening.fundraising.runway_months")}
              />
              <FieldError
                message={errors?.fundraising?.runway_months?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="raising_amount">Raise amount</Label>
              <Input
                id="raising_amount"
                type="number"
                min={0}
                step="0.01"
                {...form.register("screening.fundraising.raising_amount")}
              />
              <FieldError
                message={errors?.fundraising?.raising_amount?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="raise_currency">Raise currency</Label>
              <select
                id="raise_currency"
                className={selectClassName}
                {...form.register("screening.fundraising.raise_currency")}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              <FieldError
                message={errors?.fundraising?.raise_currency?.message}
              />
            </div>
            {needsCap ? (
              <>
                {isEquity ? (
                  <div className="space-y-2">
                    <Label htmlFor="equity_valuation_type">
                      Equity valuation type
                    </Label>
                    <select
                      id="equity_valuation_type"
                      className={selectClassName}
                      {...form.register(
                        "screening.fundraising.equity_valuation_type",
                      )}
                    >
                      <option value="">Select</option>
                      {EQUITY_VALUATION_TYPES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <FieldError
                      message={
                        errors?.fundraising?.equity_valuation_type?.message
                      }
                    />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="valuation_amount">
                    {isSafeNote
                      ? "Valuation cap"
                      : isEquity
                        ? "Valuation"
                        : "Valuation / cap"}
                  </Label>
                  <Input
                    id="valuation_amount"
                    type="number"
                    min={0}
                    step="0.01"
                    {...form.register("screening.fundraising.valuation_amount")}
                  />
                  <FieldError
                    message={errors?.fundraising?.valuation_amount?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valuation_currency">
                    {isSafeNote ? "Cap currency" : "Valuation currency"}
                  </Label>
                  <select
                    id="valuation_currency"
                    className={selectClassName}
                    {...form.register(
                      "screening.fundraising.valuation_currency",
                    )}
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                  <FieldError
                    message={errors?.fundraising?.valuation_currency?.message}
                  />
                </div>
              </>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="target_investor_geography">
                Target investor geography
              </Label>
              <Input
                id="target_investor_geography"
                {...form.register(
                  "screening.fundraising.target_investor_geography",
                )}
                placeholder="e.g. SEA, US, Europe"
              />
              <FieldError
                message={
                  errors?.fundraising?.target_investor_geography?.message
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_check_size">Target check size</Label>
              <Input
                id="target_check_size"
                type="number"
                min={0}
                step="0.01"
                {...form.register("screening.fundraising.target_check_size")}
              />
              <FieldError
                message={errors?.fundraising?.target_check_size?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_check_size_currency">
                Check size currency
              </Label>
              <select
                id="target_check_size_currency"
                className={selectClassName}
                {...form.register(
                  "screening.fundraising.target_check_size_currency",
                )}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              <FieldError
                message={
                  errors?.fundraising?.target_check_size_currency?.message
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_close_date">Target close date</Label>
              <Input
                id="target_close_date"
                type="date"
                {...form.register("screening.fundraising.target_close_date")}
              />
              <FieldError
                message={errors?.fundraising?.target_close_date?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead_dependent">Round is lead-dependent?</Label>
              <select
                id="lead_dependent"
                className={selectClassName}
                {...form.register("screening.fundraising.lead_dependent")}
              >
                {YES_NO.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <FieldError
                message={errors?.fundraising?.lead_dependent?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="committed_soft_circled_amount">
                Committed / soft-circled amount
              </Label>
              <Input
                id="committed_soft_circled_amount"
                type="number"
                min={0}
                step="0.01"
                {...form.register(
                  "screening.fundraising.committed_soft_circled_amount",
                )}
              />
              <FieldError
                message={
                  errors?.fundraising?.committed_soft_circled_amount?.message
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="committed_soft_circled_currency">
                Committed / soft-circled currency
              </Label>
              <select
                id="committed_soft_circled_currency"
                className={selectClassName}
                {...form.register(
                  "screening.fundraising.committed_soft_circled_currency",
                )}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              <FieldError
                message={
                  errors?.fundraising?.committed_soft_circled_currency?.message
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="use_of_funds">Use of funds</Label>
              <Textarea
                id="use_of_funds"
                rows={3}
                {...form.register("screening.fundraising.use_of_funds")}
                placeholder="How will the raise be used?"
              />
              <FieldError
                message={errors?.fundraising?.use_of_funds?.message}
              />
            </div>
          </>
        ) : null}
      </Section>

      <Section
        title="Priority ask (next 30 days)"
        description="Name one singular ask we can match: one counterpart type, geography, and outcome."
      >
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="goal_30_days">30-day goal</Label>
          <Textarea
            id="goal_30_days"
            rows={3}
            {...form.register("screening.progress_and_ask.goal_30_days")}
            placeholder="What will be true in 30 days?"
          />
          <FieldError
            message={errors?.progress_and_ask?.goal_30_days?.message}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="key_blockers">Key blockers</Label>
          <Textarea
            id="key_blockers"
            rows={3}
            {...form.register("screening.progress_and_ask.key_blockers")}
            placeholder="What is slowing you down?"
          />
          <FieldError
            message={errors?.progress_and_ask?.key_blockers?.message}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="target_milestone">Target milestone</Label>
          <Textarea
            id="target_milestone"
            rows={3}
            {...form.register("screening.progress_and_ask.target_milestone")}
            placeholder="Milestone that unlocks the next stage"
          />
          <FieldError
            message={errors?.progress_and_ask?.target_milestone?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority_counterpart_type">
            Priority counterpart type
          </Label>
          <select
            id="priority_counterpart_type"
            className={selectClassName}
            {...form.register(
              "screening.progress_and_ask.priority_counterpart_type",
            )}
          >
            {CONNECTION_REQUESTS.map((request) => (
              <option key={request} value={request}>
                {request}
              </option>
            ))}
          </select>
          <FieldError
            message={
              errors?.progress_and_ask?.priority_counterpart_type?.message
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="connection_geography">Geography</Label>
          <Input
            id="connection_geography"
            {...form.register("screening.progress_and_ask.connection_geography")}
            placeholder="e.g. SEA, US, Europe"
          />
          <FieldError
            message={errors?.progress_and_ask?.connection_geography?.message}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="counterpart_profile">
            Specific counterpart profile
          </Label>
          <Textarea
            id="counterpart_profile"
            rows={2}
            {...form.register("screening.progress_and_ask.counterpart_profile")}
            placeholder="e.g. Indonesian B2B fintech seed investor with payments experience"
          />
          <FieldError
            message={errors?.progress_and_ask?.counterpart_profile?.message}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="connection_outcome">
            One desired outcome from an introduction
          </Label>
          <Textarea
            id="connection_outcome"
            rows={2}
            {...form.register("screening.progress_and_ask.connection_outcome")}
            placeholder="What would make this introduction a success?"
          />
          <FieldError
            message={errors?.progress_and_ask?.connection_outcome?.message}
          />
        </div>
      </Section>

      <Section
        title="Consent & sharing"
        description="Applications are reviewed privately. Sensitive customer/financial evidence stays access-controlled."
      >
        <p className="text-sm text-muted-foreground md:col-span-2">
          Fydemy’s internal review is separate from any sharing with Boardy or
          an external counterpart. No introduction or assessment outcome is
          guaranteed. External sharing requires separate approval.
        </p>
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-start gap-3">
            <Controller
              control={form.control}
              name="screening.consent.accelerator_review_consent"
              render={({ field }) => (
                <Checkbox
                  id="accelerator_review_consent"
                  checked={field.value}
                  className="bg-secondary"
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  aria-invalid={Boolean(
                    errors?.consent?.accelerator_review_consent,
                  )}
                />
              )}
            />
            <Label
              htmlFor="accelerator_review_consent"
              className="font-normal leading-snug"
            >
              I understand Fydemy may conduct a private internal review of this
              application.
            </Label>
          </div>
          <FieldError
            message={errors?.consent?.accelerator_review_consent?.message}
          />
        </div>
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-start gap-3">
            <Controller
              control={form.control}
              name="screening.consent.share_after_approval"
              render={({ field }) => (
                <Checkbox
                  id="share_after_approval"
                  checked={field.value}
                  className="bg-secondary"
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                />
              )}
            />
            <Label
              htmlFor="share_after_approval"
              className="font-normal leading-snug"
            >
              Share my deck, metrics, and contact details with Boardy or an
              external counterpart only after my separate approval (default).
            </Label>
          </div>
        </div>
      </Section>
    </div>
  );
}

export const defaultScreeningValues: ApplicantForm = {
  founder: {
    founder_name: "",
    founder_role: "",
    founder_email: "",
    founder_experience: "",
    founder_contact: "",
    primary_decision_maker: "",
    phone_whatsapp: "",
    founder_count: 1,
    team_members: [],
    full_time_status: "Full-time",
    part_time_full_time_date: "",
  },
  company: {
    company_name: "",
    company_website: "",
    sector: "SaaS / B2B",
    sector_other: "",
    subsector: "Horizontal SaaS",
    subsector_other: "",
    operating_country: "",
    operating_city: "",
    legal_status: "Not Incorporated",
    incorporation_jurisdiction: "",
    founder_ownership_percent: 0,
    ownership_employees_percent: 0,
    ownership_advisors_percent: 0,
    ownership_investors_percent: 0,
    ownership_unallocated_percent: 0,
    product_stage: "Idea",
    demo_asset_type: "None",
    demo_link: "",
    regulatory_status: "None",
    regulatory_authority: "",
    regulatory_explanation: "",
    regulatory_evidence_link: "",
    product_description: "",
    problem_statement: "",
    written_brief: "",
    who_pays: "",
    pricing_model: "Subscription",
    pricing_model_other: "",
    gross_margin_percent: undefined,
    unit_economics: "",
    competition_alternatives: "",
    why_now_why_team: "",
  },
  validation: {
    customer_segment: "",
    customer_acquisition_channel: "Organic / SEO",
    acquisition_channel_other: "",
    interview_count: 0,
    interview_as_of: "",
    interview_learnings: "",
    pilots_count: undefined,
    pilots_as_of: "",
    pilots_compensation: undefined,
    pilots_stage: undefined,
    pilots_contract_value: undefined,
    pilots_contract_value_type: undefined,
    pilots_contract_currency: "USD",
    pilots_expected_conversion_date: "",
    pilots_evidence: "",
    lois_count: undefined,
    lois_as_of: "",
    lois_evidence: "",
    active_users_count: 0,
    active_users_as_of: "",
    active_users_evidence: "",
    paying_customers_count: 0,
    paying_customers_as_of: "",
    paying_customers_evidence: "",
    retention_percent: undefined,
    retention_as_of: "",
    retention_measurement_window: "",
    retention_cohort_definition: "",
    retention_evidence: "",
    revenue_retention: "",
    north_star_metric: "",
    north_star_value: "",
    north_star_as_of: "",
    north_star_why: "",
    north_star_evidence: "",
    gmv_tpv: undefined,
    gmv_tpv_currency: "USD",
    net_revenue: undefined,
    net_revenue_currency: "USD",
    take_rate_percent: undefined,
    transaction_reporting_period: "",
    current_mrr: 0,
    mrr_currency: "USD",
    mrr_as_of: "",
    mrr_evidence: "",
  },
  fundraising: {
    company_stage: "Bootstrapped",
    currently_raising: "No",
    funding_instrument: undefined,
    raising_amount: undefined,
    raise_currency: "USD",
    valuation_amount: undefined,
    valuation_currency: "USD",
    equity_valuation_type: undefined,
    capital_raised_to_date: 0,
    capital_raised_currency: "USD",
    capital_raised_as_of: "",
    prior_investors_grants: "",
    runway_months: undefined,
    use_of_funds: "",
    target_investor_geography: "",
    target_check_size: undefined,
    target_check_size_currency: "USD",
    target_close_date: "",
    committed_soft_circled_amount: undefined,
    committed_soft_circled_currency: "USD",
    lead_dependent: undefined,
  },
  progress_and_ask: {
    goal_30_days: "",
    key_blockers: "",
    target_milestone: "",
    priority_counterpart_type: "Angels / VCs / Investors",
    counterpart_profile: "",
    connection_geography: "",
    connection_outcome: "",
  },
  consent: {
    accelerator_review_consent: false,
    share_after_approval: true,
  },
};
