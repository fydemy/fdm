import {
  parseScreeningPayload,
  type ApplicantForm,
} from "@/lib/screening";

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function LinkField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="space-y-1 sm:col-span-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">
        {URL.canParse(value) ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            {value}
          </a>
        ) : (
          <span className="whitespace-pre-wrap">{value}</span>
        )}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function MetricFields({
  label,
  count,
  extras,
  asOf,
  evidence,
}: {
  label: string;
  count: string | number | null | undefined;
  extras?: string;
  asOf?: string;
  evidence?: string;
}) {
  if (
    count === null ||
    count === undefined ||
    count === "" ||
    (typeof count === "number" && Number.isNaN(count))
  ) {
    return null;
  }
  return (
    <div className="space-y-1 sm:col-span-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="space-y-1 text-sm">
        <p>
          {count}
          {extras ? ` · ${extras}` : ""}
          {asOf ? ` · as of ${asOf}` : ""}
        </p>
        {evidence ? (
          <p className="whitespace-pre-wrap text-muted-foreground">
            Evidence: {evidence}
          </p>
        ) : null}
      </dd>
    </div>
  );
}

function formatDecisionMaker(value: string) {
  if (value.startsWith("founder:")) {
    return `${value.slice("founder:".length)} (applicant)`;
  }
  if (value.startsWith("member:")) {
    const rest = value.slice("member:".length);
    const [name, email] = rest.split(":");
    return email ? `${name} (${email})` : name;
  }
  return value;
}

function ApplicantFormView({ form }: { form: ApplicantForm }) {
  const sectorLabel =
    form.company.sector === "Other" && form.company.sector_other
      ? `Other (${form.company.sector_other})`
      : form.company.sector;
  const subsectorLabel =
    form.company.subsector === "Other" && form.company.subsector_other
      ? `Other (${form.company.subsector_other})`
      : form.company.subsector;
  const channelLabel =
    form.validation.customer_acquisition_channel === "Other" &&
    form.validation.acquisition_channel_other
      ? `Other (${form.validation.acquisition_channel_other})`
      : form.validation.customer_acquisition_channel;
  const pricingLabel =
    form.company.pricing_model === "Other" && form.company.pricing_model_other
      ? `Other (${form.company.pricing_model_other})`
      : form.company.pricing_model;

  return (
    <div className="space-y-8">
      <Section title="Founder">
        <Field label="Name" value={form.founder.founder_name} />
        <Field label="Role" value={form.founder.founder_role} />
        <Field label="Email" value={form.founder.founder_email} />
        <Field
          label="Primary decision-maker"
          value={formatDecisionMaker(form.founder.primary_decision_maker)}
        />
        <Field label="Phone / WhatsApp" value={form.founder.phone_whatsapp} />
        <Field label="Founder count" value={form.founder.founder_count} />
        <Field label="Experience" value={form.founder.founder_experience} />
        <LinkField label="LinkedIn" value={form.founder.founder_contact} />
        <Field label="Full-time status" value={form.founder.full_time_status} />
        <Field
          label="Expected full-time date"
          value={form.founder.part_time_full_time_date}
        />
      </Section>

      {form.founder.team_members.length > 0 ? (
        <Section title="Team members">
          {form.founder.team_members.map((member) => (
            <div key={`${member.email}-${member.name}`} className="contents">
              <Field
                label={`${member.name} · role`}
                value={member.role}
              />
              <Field label={`${member.name} · email`} value={member.email} />
              <LinkField
                label={`${member.name} · LinkedIn`}
                value={member.linkedin}
              />
              <Field
                label={`${member.name} · full-time`}
                value={member.full_time_status}
              />
            </div>
          ))}
        </Section>
      ) : null}

      <Section title="Company">
        <Field label="Company" value={form.company.company_name} />
        <LinkField label="Website" value={form.company.company_website} />
        <Field label="Product stage" value={form.company.product_stage} />
        <Field label="Sector" value={sectorLabel} />
        <Field label="Subsector" value={subsectorLabel} />
        <Field label="Operating country" value={form.company.operating_country} />
        <Field label="Operating city" value={form.company.operating_city} />
        <Field label="Legal status" value={form.company.legal_status} />
        <Field
          label="Incorporation jurisdiction"
          value={form.company.incorporation_jurisdiction}
        />
        <Field
          label="Aggregate founder ownership"
          value={`${form.company.founder_ownership_percent}%`}
        />
        <Field
          label="Employees / ESOP"
          value={`${form.company.ownership_employees_percent}%`}
        />
        <Field
          label="Advisors"
          value={`${form.company.ownership_advisors_percent}%`}
        />
        <Field
          label="Investors"
          value={`${form.company.ownership_investors_percent}%`}
        />
        <Field
          label="Unallocated / other"
          value={`${form.company.ownership_unallocated_percent}%`}
        />
        <Field label="Demo asset" value={form.company.demo_asset_type} />
        <LinkField label="Demo / deck link" value={form.company.demo_link} />
        <Field label="Written brief" value={form.company.written_brief} />
        <Field
          label="Regulatory dependency"
          value={form.company.regulatory_status}
        />
        <Field
          label="Regulator / licence / partner"
          value={form.company.regulatory_authority}
        />
        <Field
          label="Regulatory explanation"
          value={form.company.regulatory_explanation}
        />
        <LinkField
          label="Regulatory evidence"
          value={form.company.regulatory_evidence_link}
        />
        <Field
          label="Product description"
          value={form.company.product_description}
        />
        <Field
          label="Problem statement"
          value={form.company.problem_statement}
        />
        <Field label="Who pays" value={form.company.who_pays} />
        <Field label="Pricing model" value={pricingLabel} />
        <Field
          label="Gross margin"
          value={
            form.company.gross_margin_percent !== undefined
              ? `${form.company.gross_margin_percent}%`
              : undefined
          }
        />
        <Field label="Unit economics notes" value={form.company.unit_economics} />
        <Field
          label="Competition / alternatives"
          value={form.company.competition_alternatives}
        />
        <Field
          label="Why now / why this team"
          value={form.company.why_now_why_team}
        />
      </Section>

      <Section title="Validation">
        <Field label="Customer segment" value={form.validation.customer_segment} />
        <Field label="Acquisition channel" value={channelLabel} />
        <MetricFields
          label="Interviews"
          count={form.validation.interview_count}
          asOf={form.validation.interview_as_of}
        />
        <Field
          label="Interview learnings"
          value={form.validation.interview_learnings}
        />
        <MetricFields
          label="Active pilots"
          count={form.validation.pilots_count}
          asOf={form.validation.pilots_as_of}
          evidence={form.validation.pilots_evidence}
          extras={[
            form.validation.pilots_compensation,
            form.validation.pilots_stage,
            form.validation.pilots_contract_value !== undefined
              ? `${form.validation.pilots_contract_value_type ? `${form.validation.pilots_contract_value_type}: ` : ""}${form.validation.pilots_contract_value} ${form.validation.pilots_contract_currency ?? ""}`.trim()
              : undefined,
            form.validation.pilots_expected_conversion_date
              ? `convert by ${form.validation.pilots_expected_conversion_date}`
              : undefined,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
        <MetricFields
          label="LOIs / design partners"
          count={form.validation.lois_count}
          asOf={form.validation.lois_as_of}
          evidence={form.validation.lois_evidence}
        />
        <MetricFields
          label="Active users (last 30 days)"
          count={form.validation.active_users_count}
          asOf={form.validation.active_users_as_of}
          evidence={form.validation.active_users_evidence}
        />
        <MetricFields
          label="Paying customers"
          count={form.validation.paying_customers_count}
          asOf={form.validation.paying_customers_as_of}
          evidence={form.validation.paying_customers_evidence}
        />
        <MetricFields
          label="User retention"
          count={
            form.validation.retention_percent !== undefined
              ? `${form.validation.retention_percent}%`
              : undefined
          }
          asOf={form.validation.retention_as_of}
          evidence={form.validation.retention_evidence}
          extras={[
            form.validation.retention_measurement_window,
            form.validation.retention_cohort_definition,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
        <Field
          label="Repeat / revenue retention"
          value={form.validation.revenue_retention}
        />
        <MetricFields
          label="GMV / TPV"
          count={form.validation.gmv_tpv}
          extras={[
            form.validation.gmv_tpv_currency,
            form.validation.transaction_reporting_period,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
        <MetricFields
          label="Net revenue"
          count={form.validation.net_revenue}
          extras={form.validation.net_revenue_currency}
        />
        <Field
          label="Take rate"
          value={
            form.validation.take_rate_percent !== undefined
              ? `${form.validation.take_rate_percent}%`
              : undefined
          }
        />
        <MetricFields
          label={`Most important metric (${form.validation.north_star_metric})`}
          count={form.validation.north_star_value}
          asOf={form.validation.north_star_as_of}
          evidence={form.validation.north_star_evidence}
        />
        <Field
          label="Why this metric"
          value={form.validation.north_star_why}
        />
        <MetricFields
          label="MRR"
          count={form.validation.current_mrr}
          extras={form.validation.mrr_currency}
          asOf={form.validation.mrr_as_of}
          evidence={form.validation.mrr_evidence}
        />
      </Section>

      <Section title="Fundraising">
        <Field label="Company stage" value={form.fundraising.company_stage} />
        <Field
          label="Currently raising"
          value={form.fundraising.currently_raising}
        />
        <Field
          label="Capital raised to date"
          value={
            form.fundraising.capital_raised_to_date !== undefined
              ? `${form.fundraising.capital_raised_to_date} ${form.fundraising.capital_raised_currency}${form.fundraising.capital_raised_as_of ? ` · as of ${form.fundraising.capital_raised_as_of}` : ""}`
              : undefined
          }
        />
        <Field
          label="Prior investors / grants"
          value={form.fundraising.prior_investors_grants}
        />
        <Field
          label="Instrument"
          value={form.fundraising.funding_instrument}
        />
        <Field
          label="Raising"
          value={
            form.fundraising.raising_amount !== undefined
              ? `${form.fundraising.raising_amount} ${form.fundraising.raise_currency ?? ""}`
              : undefined
          }
        />
        <Field
          label="Valuation"
          value={
            form.fundraising.valuation_amount !== undefined
              ? [
                  form.fundraising.equity_valuation_type,
                  `${form.fundraising.valuation_amount} ${form.fundraising.valuation_currency ?? ""}`,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : undefined
          }
        />
        <Field label="Runway (months)" value={form.fundraising.runway_months} />
        <Field
          label="Target investor geography"
          value={form.fundraising.target_investor_geography}
        />
        <Field
          label="Target check size"
          value={
            form.fundraising.target_check_size !== undefined
              ? `${form.fundraising.target_check_size} ${form.fundraising.target_check_size_currency ?? ""}`
              : undefined
          }
        />
        <Field
          label="Target close date"
          value={form.fundraising.target_close_date}
        />
        <Field
          label="Committed / soft-circled"
          value={
            form.fundraising.committed_soft_circled_amount !== undefined
              ? `${form.fundraising.committed_soft_circled_amount} ${form.fundraising.committed_soft_circled_currency ?? ""}`
              : undefined
          }
        />
        <Field
          label="Lead-dependent"
          value={form.fundraising.lead_dependent}
        />
        <Field label="Use of funds" value={form.fundraising.use_of_funds} />
      </Section>

      <Section title="Priority ask">
        <Field label="30-day goal" value={form.progress_and_ask.goal_30_days} />
        <Field label="Key blockers" value={form.progress_and_ask.key_blockers} />
        <Field
          label="Target milestone"
          value={form.progress_and_ask.target_milestone}
        />
        <Field
          label="Counterpart type"
          value={form.progress_and_ask.priority_counterpart_type}
        />
        <Field
          label="Counterpart profile"
          value={form.progress_and_ask.counterpart_profile}
        />
        <Field
          label="Geography"
          value={form.progress_and_ask.connection_geography}
        />
        <Field
          label="Desired outcome"
          value={form.progress_and_ask.connection_outcome}
        />
      </Section>

      <Section title="Consent">
        <Field
          label="Private Fydemy internal review"
          value={form.consent.accelerator_review_consent ? "Yes" : "No"}
        />
        <Field
          label="Share after approval"
          value={
            form.consent.share_after_approval
              ? "Deck/metrics/contact may be shared with Boardy or an external counterpart only after separate approval"
              : "Do not share deck/metrics/contact externally"
          }
        />
        <Field
          label="Note"
          value="Fydemy’s internal review is separate from Boardy or external sharing. No introduction or assessment outcome is guaranteed."
        />
      </Section>
    </div>
  );
}

export function ApplicationScreeningView({
  description,
}: {
  description: string | null | undefined;
}) {
  const payload = parseScreeningPayload(description);

  if (!payload) {
    return (
      <p className="text-sm whitespace-pre-wrap text-muted-foreground">
        {description || "No description."}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <ApplicantFormView form={payload.form} />
    </div>
  );
}
