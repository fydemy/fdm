import { t } from "@/lib/trpc/trpc";
import { helloRouter } from "./routes/hello";
import { applicationRouter } from "./routes/application";
import { reviewRouter } from "./routes/review";
import { launchRouter } from "./routes/launch";
import { materialRouter } from "./routes/material";
import { mentorRouter } from "./routes/mentor";
import { userRouter } from "./routes/user";
import { tractionOrDieRouter } from "./routes/traction-or-die";

export const appRouter = t.router({
  hello: helloRouter,
  user: userRouter,
  application: applicationRouter,
  review: reviewRouter,
  mentor: mentorRouter,
  launch: launchRouter,
  material: materialRouter,
  tractionOrDie: tractionOrDieRouter,
});

export type AppRouter = typeof appRouter;
