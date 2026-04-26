const express = require("express");
const Session = require("../models/Session");
const User = require("../models/User");
const Analytics = require("../models/Analytics");
const { auth } = require("../middleware/auth");

const router = express.Router();

const calculateStageScore = (results, stageName) => {
  const stageResults = (results || []).filter(
    (item) => item.stage === stageName,
  );
  if (!stageResults.length) {
    return 0;
  }

  const correctCount = stageResults.filter((item) => item.correct).length;
  return Math.round((correctCount / stageResults.length) * 100);
};

const calculateAverageTimePerWord = (results, wordsCount) => {
  if (!results || !results.length || !wordsCount) {
    return 0;
  }

  const totalTime = results.reduce(
    (sum, item) => sum + (item.timeSpent || 0),
    0,
  );
  return Math.round(totalTime / wordsCount);
};

// @route   POST /api/sessions
// @desc    Create a new learning session
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { sessionType, words, animationIntensity } = req.body;

    const session = new Session({
      userId: req.user.userId,
      sessionType,
      words: words || [],
      animationIntensity: animationIntensity || "medium",
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/sessions
// @desc    Get user's sessions
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.userId })
      .populate("words")
      .sort({ startedAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/sessions/:id
// @desc    Get session by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("words")
      .populate("results.wordId");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if user owns this session
    if (session.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(session);
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/sessions/:id/results
// @desc    Add result to session (with server-side spelling validation)
// @access  Private
router.put("/:id/results", auth, async (req, res) => {
  try {
    const { stage, wordId, correct, timeSpent, attempts, animationLevel, spokenWord, targetWord } =
      req.body;

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Server-side spelling validation for spelling/elicitation stages
    let isSpellingCorrect = null;
    let resolvedCorrect = correct;
    if ((stage === "spelling" || stage === "elicitation") && spokenWord !== undefined && targetWord) {
      isSpellingCorrect =
        spokenWord.trim().toLowerCase() === targetWord.trim().toLowerCase();
      resolvedCorrect = isSpellingCorrect; // override client-sent value for accuracy
    }

    session.results.push({
      stage,
      wordId,
      correct: resolvedCorrect,
      timeSpent,
      attempts,
      animationLevel,
    });

    await session.save();
    res.json({ session, isSpellingCorrect });
  } catch (error) {
    console.error("Add result error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/sessions/:id/complete
// @desc    Complete a session
// @access  Private
router.put("/:id/complete", auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const wasAlreadyCompleted = session.completed;
    const calculatedPreTestScore = calculateStageScore(
      session.results,
      "pre-test",
    );
    const calculatedPostTestScore = calculateStageScore(
      session.results,
      "post-test",
    );

    let calculatedImprovement = 0;
    if (calculatedPreTestScore === 0) {
      calculatedImprovement = calculatedPostTestScore > 0 ? 100 : 0;
    } else {
      calculatedImprovement =
        ((calculatedPostTestScore - calculatedPreTestScore) /
          calculatedPreTestScore) *
        100;
    }

    session.completed = true;
    session.completedAt = new Date();
    session.preTestScore = calculatedPreTestScore;
    session.postTestScore = calculatedPostTestScore;
    session.improvement = Math.round(calculatedImprovement * 100) / 100;

    // Calculate duration
    session.duration = Math.floor(
      (session.completedAt - session.startedAt) / 1000,
    );

    await session.save();

    // Update user learning stats
    const user = await User.findById(req.user.userId);
    if (user) {
      if (!wasAlreadyCompleted) {
        user.learningStats.totalSessions += 1;
      }

      const completedSessions = await Session.find({
        userId: req.user.userId,
        completed: true,
      });
      const totalWordsLearned = completedSessions.reduce(
        (sum, item) => sum + ((item.words && item.words.length) || 0),
        0,
      );
      const averageAccuracy = completedSessions.length
        ? completedSessions.reduce(
            (sum, item) => sum + (item.postTestScore || 0),
            0,
          ) / completedSessions.length
        : 0;

      user.learningStats.totalWordsLearned = totalWordsLearned;
      user.learningStats.averageAccuracy =
        Math.round(averageAccuracy * 100) / 100;
      user.learningStats.lastSessionDate = new Date();
      await user.save();
    }

    if (!wasAlreadyCompleted) {
      const averageTimePerWord = calculateAverageTimePerWord(
        session.results,
        (session.words || []).length,
      );

      await Analytics.create({
        userId: session.userId,
        metrics: {
          wordsLearned: (session.words || []).length,
          accuracyRate: session.postTestScore,
          averageTimePerWord,
          sessionsCompleted: 1,
          retentionRate: 0,
        },
        animationMetrics: {
          averageIntensity: session.animationIntensity,
          animationAssistedImprovement: session.improvement,
        },
        wordProgress: (session.words || []).map((wordId) => ({
          wordId,
          masteryLevel: session.postTestScore,
          lastPracticed: session.completedAt,
          timesPracticed: 1,
        })),
      });
    }

    res.json(session);
  } catch (error) {
    console.error("Complete session error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
