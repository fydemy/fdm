import { t } from "@/lib/trpc/trpc";
import { helloRouter } from "./routes/hello";
import { applicationRouter } from "./routes/application";
import { reviewRouter } from "./routes/review";
import { launchRouter } from "./routes/launch";
import { materialRouter } from "./routes/material";
import { mentorRouter } from "./routes/mentor";
import { userRouter } from "./routes/user";

export const appRouter = t.router({
  hello: helloRouter,
  user: userRouter,
  application: applicationRouter,
  review: reviewRouter,
  mentor: mentorRouter,
  launch: launchRouter,
  material: materialRouter,
});

export type AppRouter = typeof appRouter;
