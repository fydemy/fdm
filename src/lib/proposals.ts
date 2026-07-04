import path from "path";
import { mkdir, readFile, writeFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { isReviewer } from "@/lib/auth-helpers";

export const PROPOSALS_DIR = path.join(process.cwd(), "storage", "proposals");

type ProposalMeta = {
  userId: string;
  originalName: string;
};

export function proposalUrlFor(filename: string) {
  return `/api/proposals/${filename}`;
}

export function assertSafeProposalFilename(filename: string) {
  if (
    !filename ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return false;
  }
  return /^[a-zA-Z0-9._-]+$/.test(filename);
}

export function proposalFilePath(filename: string) {
  return path.join(PROPOSALS_DIR, filename);
}

function proposalMetaPath(filename: string) {
  return path.join(PROPOSALS_DIR, `${filename}.meta.json`);
}

export async function saveProposalFile(input: {
  filename: string;
  userId: string;
  originalName: string;
  data: Buffer;
}) {
  await mkdir(PROPOSALS_DIR, { recursive: true });
  await writeFile(proposalFilePath(input.filename), input.data);
  const meta: ProposalMeta = {
    userId: input.userId,
    originalName: input.originalName,
  };
  await writeFile(proposalMetaPath(input.filename), JSON.stringify(meta));
}

export async function readProposalMeta(
  filename: string,
): Promise<ProposalMeta | null> {
  try {
    const raw = await readFile(proposalMetaPath(filename), "utf8");
    return JSON.parse(raw) as ProposalMeta;
  } catch {
    return null;
  }
}

export async function canAccessProposal(input: {
  filename: string;
  userId: string;
  email: string;
  role: string;
}) {
  if (!assertSafeProposalFilename(input.filename)) return false;

  const application = await prisma.application.findFirst({
    where: {
      OR: [
        { proposalUrl: proposalUrlFor(input.filename) },
        { proposalUrl: `/uploads/${input.filename}` },
      ],
    },
    select: { userId: true },
  });

  if (application) {
    return (
      application.userId === input.userId ||
      isReviewer(input.email, input.role)
    );
  }

  // Unsubmitted upload: only the sender who uploaded it.
  const meta = await readProposalMeta(input.filename);
  return meta?.userId === input.userId;
}

export function contentTypeForFilename(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".txt":
      return "text/plain";
    case ".md":
      return "text/markdown";
    default:
      return "application/octet-stream";
  }
}
