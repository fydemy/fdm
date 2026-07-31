"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { PublicSiteFooter } from "@/components/public-site-footer";
import { ProfileImage } from "@/components/ui/optimized-image";

interface Mentor {
  name: string;
  role: string;
  image: string;
  linkedin: string;
}

const mentors: Mentor[] = [
  {
    name: "Arsyi R. Fatah",
    role: "Boardy, Antler",
    image: "/profile/mentor/arsyi.jpeg",
    linkedin: "https://www.linkedin.com/in/arsyifatah/",
  },
  {
    name: "M. Daffa",
    role: "Kredivo, Tiket.com",
    image: "/profile/mentor/daffa.jpeg",
    linkedin: "https://www.linkedin.com/in/m-daffa-badran-thoriq/",
  },
  {
    name: "Joenathan Haganta",
    role: "Highbrow Inc",
    image: "/profile/mentor/joenathan.webp",
    linkedin: "https://www.linkedin.com/in/joenathan-haganta-ginting/",
  },
  {
    name: "Riza Herzego",
    role: "Akal (Hasan VC)",
    image: "/profile/mentor/riza.jpeg",
    linkedin: "https://www.linkedin.com/in/rizaherzego/",
  },
  {
    name: "Rully Saputra",
    role: "Tiket.com, Traveloka",
    image: "/profile/mentor/rully.jpeg",
    linkedin: "https://www.linkedin.com/in/rully-saputra/",
  },
  {
    name: "Dennis James",
    role: "Telkom University",
    image: "/profile/mentor/dennis.jpeg",
    linkedin: "https://www.linkedin.com/in/dennis-michael-andrew/",
  },
  {
    name: "Oki Taruna",
    role: "Fydemy, Dicoding",
    image: "/profile/mentor/oki.png",
    linkedin: "https://www.linkedin.com/in/otaruram/",
  },
  {
    name: "Wahyu Ikbal",
    role: "Insignia",
    image: "/profile/mentor/wahyu.jpeg",
    linkedin: "https://www.linkedin.com/in/wahyuikbalmaulana/",
  },
];

export default function MentorsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicSiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-20 space-y-16">
          <h1 className="text-4xl font-semibold tracking-tighter text-center">
            Our Mentors
          </h1>

          <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {mentors.map((mentor) => (
              <article
                key={mentor.name}
                className="relative aspect-[4/5] overflow-hidden rounded-xl"
              >
                <ProfileImage
                  src={mentor.image}
                  name={mentor.name}
                  className="size-full"
                />
                <div className="absolute inset-x-0 bottom-0 overflow-hidden">
                  <div className="flex items-end justify-between gap-2 bg-black/40 px-3 py-3 backdrop-blur-md">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {mentor.name}
                      </p>
                      <p className="truncate text-xs text-white/80">
                        {mentor.role}
                      </p>
                    </div>
                    <a
                      href={mentor.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${mentor.name} on LinkedIn`}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                    >
                      <ArrowUpRight className="size-4" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}