const defaultUrl = "http://localhost:3000";

export const siteConfig = {
  name: "Fydemy",
  description:
    "Build what they can't live without. Product launches from the Fydemy community.",
  batchSeason: {
    number: 3,
    deadlineLabel: "end of August",
  },
  /** Set to true to re-enable the batch deposit flow (form, email, dashboard). */
  batchDepositRequired: false,
  depositPaymentUrl:
    "https://buy.polar.sh/polar_cl_Tk3KQeZcS1xSvzm59NlN72gkayjYLObKLymF53xZwmS",
  discordInviteUrl: "https://discord.gg/7FBpTEXqVj",
  links: {
    events: "https://luma.com/fydemy",
    github: "https://github.com/fydemy/fdm",
    instagram: "https://www.instagram.com/fydemy/",
    tiktok: "https://www.tiktok.com/@fydemy",
    linkedin: "https://www.linkedin.com/company/fydemy",
    ntuArticle:
      "https://www.ntu.edu.sg/honours-college/admissions/undergraduate/premier-scholar-programmes/renaissance-engineering-programme/achievements/year-2026/fydemy-accelerator",
    notion: "https://www.notion.com",
    boardy: "https://www.boardy.ai",
    liftoff: "https://joinliftoff.web.app",
  },
  get url() {
    return process.env.BETTER_AUTH_URL ?? defaultUrl;
  },
};
