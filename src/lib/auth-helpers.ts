export const USER_ROLES = [
  "applicant",
  "founder",
  "reviewer",
  "mentor",
  "partner",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function getUserRole(role?: string | null): UserRole {
  if (
    role === "founder" ||
    role === "reviewer" ||
    role === "mentor" ||
    role === "partner"
  ) {
    return role;
  }
  return "applicant";
}

export function isReviewer(role?: string | null) {
  return getUserRole(role) === "reviewer";
}

export function isMentor(role?: string | null) {
  return getUserRole(role) === "mentor";
}

export function isPartner(role?: string | null) {
  return getUserRole(role) === "partner";
}

export function isFounder(role?: string | null) {
  return getUserRole(role) === "founder";
}

export function isStaff(role?: string | null) {
  const userRole = getUserRole(role);
  return (
    userRole === "reviewer" || userRole === "mentor" || userRole === "partner"
  );
}

export function staffHomePath(role?: string | null) {
  if (isReviewer(role)) return "/dashboard/review";
  if (isMentor(role)) return "/dashboard/mentor";
  if (isPartner(role)) return "/dashboard/partner";
  return "/";
}

export function canAccessApplicantWorkspace(role?: string | null) {
  const userRole = getUserRole(role);
  return userRole === "applicant" || userRole === "founder";
}

export function roleLabel(role?: string | null) {
  switch (getUserRole(role)) {
    case "reviewer":
      return "Reviewer";
    case "mentor":
      return "Mentor";
    case "partner":
      return "Partner";
    case "founder":
      return "Founder";
    default:
      return "Applicant";
  }
}
