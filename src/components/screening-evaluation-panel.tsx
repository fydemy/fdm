"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RECOMMENDED_NEXT_ACTIONS,
  REVIEW_STATUSES,
  REVIEW_STATUS_LABELS,
  SCORE_DEFINITIONS,
  SCORE_FIELDS,
  averageScore,
  parseScreeningPayload,
  screeningEvaluationSchema,
  type ScreeningEvaluation,
} from "@/lib/screening";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-neutral-50 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

const emptyRationales: ScreeningEvaluation["score_rationales"] = {
  score_founder: "",
  score_validation: "",
  score_tech: "",
  score_market: "",
  score_velocity: "",
  score_readiness: "",
};

const defaultEvaluation: ScreeningEvaluation = {
  scores: {
    score_founder: 3,
    score_validation: 3,
    score_tech: 3,
    score_market: 3,
    score_velocity: 3,
    score_readiness: 3,
  },
  score_rationales: emptyRationales,
  decision: {
    review_status: "Not ready yet",
    rationale: "",
    reviewer: "",
    review_date: "",
    follow_up_review_by_date: "",
    recommended_next_action: "Validate",
    next_action_owner: "",
    next_gating_milestone: "",
    internal_notes: "",
  },
};

function withDefaults(
  evaluation: ScreeningEvaluation | null | undefined,
): ScreeningEvaluation {
  if (!evaluation) return defaultEvaluation;
  return {
    ...evaluation,
    score_rationales: {
      ...emptyRationales,
      ...evaluation.score_rationales,
    },
    decision: {
      ...defaultEvaluation.decision,
      ...evaluation.decision,
      rationale: evaluation.decision.rationale ?? "",
      reviewer: evaluation.decision.reviewer ?? "",
      review_date: evaluation.decision.review_date ?? "",
      follow_up_review_by_date:
        evaluation.decision.follow_up_review_by_date ?? "",
      next_action_owner: evaluation.decision.next_action_owner ?? "",
    },
  };
}

export function ScreeningEvaluationPanel({
  applicationId,
  description,
}: {
  applicationId: string;
  description: string | null | undefined;
}) {
  const utils = trpc.useUtils();
  const [evaluation, setEvaluation] = useState<ScreeningEvaluation>(() =>
    withDefaults(parseScreeningPayload(description)?.evaluation),
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setEvaluation(withDefaults(parseScreeningPayload(description)?.evaluation));
  }, [description]);

  const save = trpc.review.saveEvaluation.useMutation({
    onSuccess: async () => {
      await utils.review.getApplication.invalidate({ id: applicationId });
      await utils.review.listApplications.invalidate();
      toast.success("Screening evaluation saved");
      setFormError(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const avg = averageScore(evaluation.scores);
  const milestoneRequired =
    evaluation.decision.review_status !== "Investor-ready";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internal screening</CardTitle>
        <CardDescription>
          Score 1–5 with a short rationale each. Routes are not sequential.
          Average: {avg.toFixed(1)} / 5
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          {SCORE_FIELDS.map(({ key, label }) => {
            const definitions = SCORE_DEFINITIONS[key];
            return (
              <div
                key={key}
                className="space-y-2 rounded-xl border bg-muted/10 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={key}>{label}</Label>
                  <select
                    id={key}
                    className={`${selectClassName} w-20`}
                    value={evaluation.scores[key]}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setEvaluation((prev) => ({
                        ...prev,
                        scores: { ...prev.scores, [key]: value },
                      }));
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {(["1", "2", "3", "4", "5"] as const).map((score) => (
                    <li key={score}>
                      <span className="font-medium text-foreground">
                        {score}:
                      </span>{" "}
                      {definitions[score]}
                    </li>
                  ))}
                </ul>
                <Textarea
                  id={`${key}_rationale`}
                  rows={2}
                  value={evaluation.score_rationales[key]}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEvaluation((prev) => ({
                      ...prev,
                      score_rationales: {
                        ...prev.score_rationales,
                        [key]: value,
                      },
                    }));
                    setFormError(null);
                  }}
                  placeholder="Evidence / rationale for this score"
                />
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="review_status">Review status (route)</Label>
            <select
              id="review_status"
              className={selectClassName}
              value={evaluation.decision.review_status}
              onChange={(event) => {
                const value = event.target
                  .value as ScreeningEvaluation["decision"]["review_status"];
                setEvaluation((prev) => ({
                  ...prev,
                  decision: { ...prev.decision, review_status: value },
                }));
                setFormError(null);
              }}
            >
              {REVIEW_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {REVIEW_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reviewer">Reviewer</Label>
            <Input
              id="reviewer"
              value={evaluation.decision.reviewer ?? ""}
              onChange={(event) => {
                setEvaluation((prev) => ({
                  ...prev,
                  decision: {
                    ...prev.decision,
                    reviewer: event.target.value,
                  },
                }));
                setFormError(null);
              }}
              placeholder="Reviewer name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review_date">Review date</Label>
            <Input
              id="review_date"
              type="date"
              value={evaluation.decision.review_date ?? ""}
              onChange={(event) => {
                setEvaluation((prev) => ({
                  ...prev,
                  decision: {
                    ...prev.decision,
                    review_date: event.target.value,
                  },
                }));
                setFormError(null);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="follow_up_review_by_date">
              Follow-up / review-by date
            </Label>
            <Input
              id="follow_up_review_by_date"
              type="date"
              value={evaluation.decision.follow_up_review_by_date ?? ""}
              onChange={(event) => {
                setEvaluation((prev) => ({
                  ...prev,
                  decision: {
                    ...prev.decision,
                    follow_up_review_by_date: event.target.value,
                  },
                }));
                setFormError(null);
              }}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="decision_rationale">Overall rationale</Label>
            <Textarea
              id="decision_rationale"
              rows={3}
              value={evaluation.decision.rationale ?? ""}
              onChange={(event) => {
                setEvaluation((prev) => ({
                  ...prev,
                  decision: {
                    ...prev.decision,
                    rationale: event.target.value,
                  },
                }));
                setFormError(null);
              }}
              placeholder="Why this route / readiness call"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recommended_next_action">
              Recommended next action
            </Label>
            <select
              id="recommended_next_action"
              className={selectClassName}
              value={evaluation.decision.recommended_next_action}
              onChange={(event) => {
                const value = event.target
                  .value as ScreeningEvaluation["decision"]["recommended_next_action"];
                setEvaluation((prev) => ({
                  ...prev,
                  decision: {
                    ...prev.decision,
                    recommended_next_action: value,
                  },
                }));
              }}
            >
              {RECOMMENDED_NEXT_ACTIONS.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="next_action_owner">Next-action owner</Label>
            <Input
              id="next_action_owner"
              value={evaluation.decision.next_action_owner ?? ""}
              onChange={(event) => {
                setEvaluation((prev) => ({
                  ...prev,
                  decision: {
                    ...prev.decision,
                    next_action_owner: event.target.value,
                  },
                }));
                setFormError(null);
              }}
              placeholder="Who owns the next step"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="next_gating_milestone">
              Next gating milestone
              {milestoneRequired ? "" : " (optional)"}
            </Label>
            <Input
              id="next_gating_milestone"
              value={evaluation.decision.next_gating_milestone ?? ""}
              onChange={(event) => {
                setEvaluation((prev) => ({
                  ...prev,
                  decision: {
                    ...prev.decision,
                    next_gating_milestone: event.target.value,
                  },
                }));
                setFormError(null);
              }}
              placeholder="Concrete next step before the next stage"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="internal_notes">Internal notes</Label>
            <Textarea
              id="internal_notes"
              rows={4}
              value={evaluation.decision.internal_notes ?? ""}
              onChange={(event) =>
                setEvaluation((prev) => ({
                  ...prev,
                  decision: {
                    ...prev.decision,
                    internal_notes: event.target.value,
                  },
                }))
              }
              placeholder="Private notes for reviewers"
            />
          </div>
        </div>

        {formError ? (
          <p className="text-sm text-destructive">{formError}</p>
        ) : null}

        <Button
          disabled={save.isPending}
          onClick={() => {
            const payload = {
              scores: evaluation.scores,
              score_rationales: evaluation.score_rationales,
              decision: {
                review_status: evaluation.decision.review_status,
                rationale: evaluation.decision.rationale?.trim() || "",
                reviewer: evaluation.decision.reviewer?.trim() || "",
                review_date: evaluation.decision.review_date?.trim() || "",
                follow_up_review_by_date:
                  evaluation.decision.follow_up_review_by_date?.trim() || "",
                recommended_next_action:
                  evaluation.decision.recommended_next_action,
                next_action_owner:
                  evaluation.decision.next_action_owner?.trim() || "",
                next_gating_milestone:
                  evaluation.decision.next_gating_milestone?.trim() ||
                  undefined,
                internal_notes:
                  evaluation.decision.internal_notes?.trim() || undefined,
              },
            };
            const parsed = screeningEvaluationSchema.safeParse(payload);
            if (!parsed.success) {
              setFormError(
                parsed.error.issues[0]?.message ??
                  "Fix evaluation fields before saving",
              );
              return;
            }
            save.mutate({ id: applicationId, evaluation: parsed.data });
          }}
        >
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save evaluation
        </Button>
      </CardContent>
    </Card>
  );
}
