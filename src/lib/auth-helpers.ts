export function isReviewer(email: string | null | undefined, role?: string | null) {
  if (role === "reviewer") return true;
  if (!email) return false;

  const reviewers = (process.env.REVIEWER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return reviewers.includes(email.toLowerCase());
}
