
import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import nodemailer from "nodemailer";

import Result from "../Schema/ResultSchema.js";
import User from "../Schema/UserSchema.js";

import requireAuth from "../utils/authMiddleware.js";
import requireRole from "../utils/roleMiddleware.js";

dotenv.config();

const router = express.Router();


// =====================================================
// EMAIL CONFIG
// =====================================================

const FROM_EMAIL = process.env.FROM_EMAIL;
const FROM_PASSWORD = process.env.FROM_PASSWORD;


// =====================================================
// REMINDER TIMING
// =====================================================

// First reminder after 72 hours
const FIRST_REMINDER_AFTER_MS =
  72 * 60 * 60 * 1000;


// Then every 24 hours
const REPEAT_EVERY_MS =
  24 * 60 * 60 * 1000;


// =====================================================
// DIFFICULTY THRESHOLDS
// =====================================================

const DIFFICULTY_THRESHOLDS = {
  easy: 90,
  medium: 80,
  hard: 70,
};


// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: FROM_EMAIL,
    pass: FROM_PASSWORD,
  },
});


// =====================================================
// SEND REMINDER EMAIL
// =====================================================

async function sendReminderEmail(
  email,
  userName,
  stillLockedTopics,
  failingExam,
  reminderNumber
) {

  const topicList =
    stillLockedTopics.join(", ");


  const mailOptions = {

    from: FROM_EMAIL,

    to: email,

    subject:
      `⚠️ Quiz Reminder #${reminderNumber}: Restricted topics still incomplete`,

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 650px;
          margin: auto;
          padding: 20px;
          background: #f8f9fa;
        "
      >

        <div
          style="
            background: white;
            padding: 25px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
          "
        >

          <h2 style="color:#2563eb;">
            Practice Reminder
          </h2>


          ${
            userName
              ? `
                <p>
                  Hello <strong>${userName}</strong>,
                </p>
              `
              : ""
          }


          <p>
            It has been more than
            <strong>72 hours</strong>
            and you still have uncleared sub-topics.
          </p>


          <h3>
            Failing Exam Details
          </h3>


          <ul>

            <li>
              <strong>Difficulty:</strong>
              ${failingExam.difficulty || "medium"}
            </li>

            <li>
              <strong>Score:</strong>
              ${failingExam.percentage}%
            </li>

            <li>
              <strong>Exam Date:</strong>
              ${new Date(
                failingExam.createdAt
              ).toLocaleString()}
            </li>

          </ul>


          <h3>
            Remaining Topics
          </h3>


          <div
            style="
              background:#fff3cd;
              padding:15px;
              border-radius:8px;
              border:1px solid #ffe69c;
              font-weight:600;
              color:#664d03;
            "
          >
            ${topicList}
          </div>


          <p style="margin-top:20px;">
            Please practice these topics again and improve your score.
          </p>


          <p
            style="
              color:#6b7280;
              font-size:14px;
            "
          >
            This reminder will repeat every 24 hours
            until these topics are cleared.
          </p>


          <hr
            style="
              margin-top:25px;
              border:none;
              border-top:1px solid #e5e7eb;
            "
          />


          <p
            style="
              color:#9ca3af;
              font-size:12px;
            "
          >
            This is an automated reminder from your Mock Test system.
          </p>

        </div>

      </div>
    `,
  };


  await transporter.sendMail(
    mailOptions
  );


  console.log(
    `✅ Reminder #${reminderNumber} sent to ${email}`
  );
}


// =====================================================
// REMINDER LOGIC
// =====================================================

async function checkAndSendReminder() {

  try {

    // -------------------------------------------------
    // GET ALL RESULTS
    // -------------------------------------------------

    const results =
      await Result.find()
        .sort({ createdAt: -1 })
        .lean();


    if (!results.length) {

      console.log(
        "No exams found. Skip reminder."
      );

      return;
    }


    // -------------------------------------------------
    // FIND LATEST EXAM DATE
    // -------------------------------------------------

    const latestDate =
      new Date(
        results[0].createdAt
      )
        .toISOString()
        .slice(0, 10);


    // -------------------------------------------------
    // GET EXAMS FROM LATEST DAY
    // -------------------------------------------------

    const sameDayExams =
      results.filter(
        (exam) =>
          new Date(
            exam.createdAt
          )
            .toISOString()
            .slice(0, 10) === latestDate
      );


    // -------------------------------------------------
    // FIND FAILING EXAM
    // -------------------------------------------------

    let failingExam = null;

    let failingIndex = -1;


    for (
      let i = 0;
      i < sameDayExams.length;
      i++
    ) {

      const exam =
        sameDayExams[i];


      const pct =
        parseFloat(
          exam.percentage
        );


      const diff =
        (
          exam.difficulty ||
          "medium"
        ).toLowerCase();


      const threshold =
        DIFFICULTY_THRESHOLDS[diff] ??
        70;


      if (
        !Number.isNaN(pct) &&
        pct < threshold
      ) {

        failingExam =
          exam;

        failingIndex =
          i;

        break;
      }
    }


    // -------------------------------------------------
    // NO FAILING EXAM
    // -------------------------------------------------

    if (!failingExam) {

      console.log(
        "No failing exam on latest day. No reminder."
      );

      return;
    }


    // -------------------------------------------------
    // GET USER FROM RESULT.userId
    // -------------------------------------------------

    if (!failingExam.userId) {

      console.log(
        `❌ Result ${failingExam._id} does not contain userId.`
      );

      return;
    }


    const user =
      await User.findById(
        failingExam.userId
      )
        .select("email name")
        .lean();


    if (!user) {

      console.log(
        `❌ User not found for userId: ${failingExam.userId}`
      );

      return;
    }


    if (!user.email) {

      console.log(
        `❌ User ${failingExam.userId} does not have an email.`
      );

      return;
    }


    console.log(
      `👤 Student: ${user.name || "Unknown"}`
    );

    console.log(
      `📧 Student email: ${user.email}`
    );


    // -------------------------------------------------
    // GET RESTRICTED TOPICS
    // -------------------------------------------------

    const restrictedTopics =
      (failingExam.topic || "")
        .split(",")
        .map(
          (t) => t.trim()
        )
        .filter(Boolean);


    if (!restrictedTopics.length) {

      console.log(
        "No topics found in failing exam. No reminder."
      );

      return;
    }


    // -------------------------------------------------
    // FIND EXAMS PRACTICED AFTER FAILING EXAM
    // -------------------------------------------------

    const laterSameDay =
      sameDayExams.slice(
        0,
        failingIndex
      );


    const practicedAfter =
      new Set();


    laterSameDay.forEach(
      (exam) => {

        (
          exam.topic || ""
        )
          .split(",")
          .map(
            (t) => t.trim()
          )
          .filter(Boolean)
          .forEach(
            (t) =>
              practicedAfter.add(t)
          );

      }
    );


    // -------------------------------------------------
    // FIND STILL LOCKED TOPICS
    // -------------------------------------------------

    const stillLocked =
      restrictedTopics.filter(
        (topic) =>
          !practicedAfter.has(topic)
      );


    if (!stillLocked.length) {

      console.log(
        "All restricted topics cleared. No reminder."
      );

      return;
    }


    console.log(
      "🔒 Still locked topics:",
      stillLocked
    );


    // -------------------------------------------------
    // CHECK 72 HOURS
    // -------------------------------------------------

    const createdAtMs =
      new Date(
        failingExam.createdAt
      ).getTime();


    const now =
      Date.now();


    const elapsed =
      now -
      createdAtMs;


    if (
      elapsed <
      FIRST_REMINDER_AFTER_MS
    ) {

      const hoursLeft =
        (
          (
            FIRST_REMINDER_AFTER_MS -
            elapsed
          ) /
          (60 * 60 * 1000)
        ).toFixed(1);


      console.log(
        `⏳ Too early. First reminder in ~${hoursLeft} hours.`
      );

      return;
    }


    // -------------------------------------------------
    // CALCULATE REMINDER SLOT
    // -------------------------------------------------

    const msAfter72 =
      elapsed -
      FIRST_REMINDER_AFTER_MS;


    const currentSlot =
      Math.floor(
        msAfter72 /
        REPEAT_EVERY_MS
      );


    // -------------------------------------------------
    // GET LAST SENT SLOT
    // -------------------------------------------------

    const lastSentSlot =
      failingExam.lastReminderSlot ===
        undefined ||
      failingExam.lastReminderSlot ===
        null
        ? -1
        : failingExam.lastReminderSlot;


    // -------------------------------------------------
    // ALREADY SENT
    // -------------------------------------------------

    if (
      currentSlot <=
      lastSentSlot
    ) {

      console.log(
        `📭 Reminder slot ${currentSlot} already sent.`
      );

      return;
    }


    // -------------------------------------------------
    // REMINDER NUMBER
    // -------------------------------------------------

    const reminderNumber =
      currentSlot + 1;


    // -------------------------------------------------
    // SEND EMAIL TO USER EMAIL
    // -------------------------------------------------

    await sendReminderEmail(

      user.email,

      user.name,

      stillLocked,

      failingExam,

      reminderNumber

    );


    // -------------------------------------------------
    // UPDATE RESULT
    // -------------------------------------------------

    await Result.findByIdAndUpdate(

      failingExam._id,

      {

        lastReminderSlot:
          currentSlot,

        lastReminderSentAt:
          new Date(),

      }

    );


    console.log(
      `✅ Reminder status updated for result ${failingExam._id}`
    );


  } catch (error) {

    console.error(
      "❌ Reminder job failed:",
      error
    );

  }
}


// =====================================================
// CRON JOB
// =====================================================

cron.schedule(
  "0 * * * *",
  () => {

    console.log(
      "⏰ Hourly reminder check..."
    );


    checkAndSendReminder();

  }
);


console.log(
  "📧 Reminder cron registered"
);


// =====================================================
// MANUAL TEST REMINDER
// =====================================================

router.post(
  "/test-reminder",

  requireAuth,

  requireRole("teacher"),

  async (req, res) => {

    try {

      await checkAndSendReminder();


      return res.json({

        success: true,

        message:
          "Reminder check completed",

      });


    } catch (error) {

      console.error(
        "Manual reminder error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  }
);

router.post(
  "/test-reminder-no-auth",
  async (req, res) => {
    try {
      await checkAndSendReminder();

      return res.json({
        success: true,
        message: "Reminder check completed",
      });

    } catch (error) {
      console.error("Manual reminder error:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/*
  GET /api/result/restricted-exam

  Logic:
  1. Find the user's most recent result date (nearest last day they gave an exam).
  2. Only consider results from that single day.
  3. Among those, collect every examId whose percentage is below the
     difficulty threshold for that result.
  4. Return all such examIds (can be multiple).
*/
router.get("/restricted-exam", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Latest result just to know the most recent calendar day
    const latestResult = await Result.findOne({ userId })
      .sort({ createdAt: -1 })
      .select("createdAt")
      .lean();

    if (!latestResult) {
      return res.status(200).json({
        success: true,
        locked: false,
        examIds: [],
        failedExams: [],
        message: "No previous exam found.",
      });
    }

    // 2. Start & end of that UTC day
    const latestDate = new Date(latestResult.createdAt);
    const startOfDay = new Date(latestDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(latestDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // 3. All results of this user on that day (newest first)
    const dayResults = await Result.find({
      userId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    // 4. Find still-locked failing exams
    //    A failing exam stays locked only if none of its topics
    //    appear in a *later* exam on the same day.
    const failedExams = [];

    for (let i = 0; i < dayResults.length; i++) {
      const result = dayResults[i];

      const percentage = Number(result.percentage || 0);
      const difficulty = String(result.difficulty || "medium").toLowerCase();
      const threshold = DIFFICULTY_THRESHOLDS[difficulty] ?? 70;

      if (percentage >= threshold) continue; // not a failing exam

      // Topics from this failing exam
      const restrictedTopics = (result.topic || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (!restrictedTopics.length) continue;

      // Exams that happened *after* this one (newer = lower index)
      const laterExams = dayResults.slice(0, i);

      // Collect every topic that was practiced after this failing exam
      const practicedAfter = new Set();
      laterExams.forEach((exam) => {
        (exam.topic || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .forEach((t) => practicedAfter.add(t));
      });

      // Still locked topics = restricted topics that never appeared again
      const stillLocked = restrictedTopics.filter(
        (topic) => !practicedAfter.has(topic)
      );

      // Only treat this exam as restricting if some of its topics are still locked
      if (stillLocked.length > 0) {
        failedExams.push({
          examId: result.examId,
          percentage,
          threshold,
          difficulty,
          topic: result.topic || null,
          stillLockedTopics: stillLocked,
          createdAt: result.createdAt,
        });
      }
    }

    // 5. Response
    if (failedExams.length > 0) {
      return res.status(200).json({
        success: true,
        locked: true,
        examIds: failedExams.map((e) => e.examId),
        failedExams,
        message: `You have ${failedExams.length} exam(s) with uncleared topics on your latest exam day. Clear them before attempting a new exam.`,
      });
    }

    return res.status(200).json({
      success: true,
      locked: false,
      examIds: [],
      failedExams: [],
      message: "Latest exam day cleared. You can attempt new exams.",
    });
  } catch (error) {
    console.error("Restricted exam API error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check exam restriction.",
      error: error.message,
    });
  }
});


export default router;

