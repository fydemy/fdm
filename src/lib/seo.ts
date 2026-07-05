const defaultUrl = "http://localhost:3000";

export const siteConfig = {
  name: "Fydemy",
  description:
    "Build what they can't live without. Product launches from the Fydemy community.",
  discordInviteUrl: "https://discord.gg/7FBpTEXqVj",
  links: {
    events: "https://luma.com/fydemy",
    github: "https://github.com/fydemy/fdm",
    instagram: "https://www.instagram.com/fydemy/",
    tiktok: "https://www.tiktok.com/@fydemy",
    linkedin: "https://www.linkedin.com/company/fydemy",
  },
  get url() {
    return process.env.BETTER_AUTH_URL ?? defaultUrl;
  },
};
