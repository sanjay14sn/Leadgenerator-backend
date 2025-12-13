import Lead from "../models/Lead.js";

export async function runFollowupCron() {
  console.log("🔁 Running Follow-up Cron...");

  try {
    const leads = await Lead.find({
      "followup.last_whatsapp_sent": { $ne: null },
    });

    const now = Date.now();

    for (const lead of leads) {
      // ✅ SAFETY GUARD
      if (!lead.followup || !lead.followup.last_whatsapp_sent) continue;

      const last = new Date(lead.followup.last_whatsapp_sent).getTime();
      const diffDays = Math.floor(
        (now - last) / (1000 * 60 * 60 * 24)
      );

      // Day 1
      if (diffDays >= 1 && !lead.followup.day1_done) {
        lead.followup.day1_done = true;
        lead.followup.history.push({
          action: "FOLLOWUP_DUE_DAY1",
          message: "Day 1 follow-up reminder",
          timestamp: new Date(),
        });
      }

      // Day 3
      if (diffDays >= 3 && !lead.followup.day3_done) {
        lead.followup.day3_done = true;
        lead.followup.history.push({
          action: "FOLLOWUP_DUE_DAY3",
          message: "Day 3 follow-up reminder",
          timestamp: new Date(),
        });
      }

      // Day 7
      if (diffDays >= 7 && !lead.followup.day7_done) {
        lead.followup.day7_done = true;
        lead.followup.history.push({
          action: "FOLLOWUP_DUE_DAY7",
          message: "Day 7 final follow-up reminder",
          timestamp: new Date(),
        });
      }

      await lead.save();
    }

    console.log("✅ Follow-up cron finished");
  } catch (err) {
    console.error("❌ Follow-up cron error:", err.message);
  }
}
