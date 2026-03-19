import cron from "node-cron";
import { reconcileDailyAnalytics } from "./analytics.reconcile.service.js";
import { ANALYTICS_CRON_SCHEDULE } from "../constant/analytics.constants.js";

let analyticsCronTask = null;

export function startAnalyticsCron() {
  if (analyticsCronTask) return;
  if (process.env.ANALYTICS_CRON_ENABLED === "false") return;

  analyticsCronTask = cron.schedule(ANALYTICS_CRON_SCHEDULE, async () => {
    try {
      const target = new Date();
      target.setDate(target.getDate() - 1);
      const result = await reconcileDailyAnalytics(target);
      console.log("[analytics-cron] Reconciled daily aggregates", result);
    } catch (error) {
      console.error("[analytics-cron] Reconciliation failed", error.message);
    }
  });

  console.log("[analytics-cron] Scheduled", ANALYTICS_CRON_SCHEDULE);
}

export function stopAnalyticsCron() {
  if (!analyticsCronTask) return;
  analyticsCronTask.stop();
  analyticsCronTask = null;
}
