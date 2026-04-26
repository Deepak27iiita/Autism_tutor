const express = require("express");
const Word = require("../models/Word");
const Session = require("../models/Session");
const { buildAdaptiveModel } = require("../utils/adaptiveLearning");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/words
// @desc    Get all words (with optional filters)
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { category, difficulty, pecsPhase, limit } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (pecsPhase) filter.pecsPhase = parseInt(pecsPhase);

    let query = Word.find(filter).sort({ word: 1 });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const words = await query;
    res.json(words);
  } catch (error) {
    console.error("Get words error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/words/recommended
// @desc    Get personalized recommended words using adaptive model
// @access  Private
router.get("/recommended", auth, async (req, res) => {
  try {
    const limit = Math.max(
      1,
      Math.min(20, parseInt(req.query.limit || "5", 10)),
    );
    const allWords = await Word.find({}).lean();

    if (!allWords.length) {
      return res.json([]);
    }

    const sessions = await Session.find({
      userId: req.user.userId,
      completed: true,
    })
      .select("results")
      .lean();

    if (!sessions.length) {
      const randomized = [...allWords].sort(() => Math.random() - 0.5);
      return res.json(randomized.slice(0, limit));
    }

    const model = buildAdaptiveModel(sessions);
    const masteryByWordId = new Map(
      model.wordPerformance.map((item) => [item.wordId, item.mastery]),
    );

    const ranked = [...allWords].sort((a, b) => {
      const aScore = masteryByWordId.has(String(a._id))
        ? masteryByWordId.get(String(a._id))
        : 45;
      const bScore = masteryByWordId.has(String(b._id))
        ? masteryByWordId.get(String(b._id))
        : 45;
      return aScore - bScore;
    });

    // Keep 70% focus on weak words and 30% exploratory variety.
    const weakPoolCount = Math.max(1, Math.round(limit * 0.7));
    const weakPool = ranked.slice(0, weakPoolCount);
    const remainingPool = ranked
      .slice(weakPoolCount)
      .sort(() => Math.random() - 0.5);

    const recommended = [...weakPool, ...remainingPool].slice(0, limit);
    res.json(recommended);
  } catch (error) {
    console.error("Get recommended words error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/words/:id
// @desc    Get word by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const word = await Word.findById(req.params.id);
    if (!word) {
      return res.status(404).json({ message: "Word not found" });
    }
    res.json(word);
  } catch (error) {
    console.error("Get word error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/words
// @desc    Create a new word (Admin/Teacher only)
// @access  Private (Admin/Teacher)
router.post("/", auth, async (req, res) => {
  try {
    // In production, add authorization check
    const word = new Word(req.body);
    await word.save();
    res.status(201).json(word);
  } catch (error) {
    console.error("Create word error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/words/:id
// @desc    Update a word
// @access  Private (Admin/Teacher)
router.put("/:id", auth, async (req, res) => {
  try {
    const word = await Word.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!word) {
      return res.status(404).json({ message: "Word not found" });
    }
    res.json(word);
  } catch (error) {
    console.error("Update word error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/words/:id
// @desc    Delete a word
// @access  Private (Admin/Teacher)
router.delete("/:id", auth, async (req, res) => {
  try {
    const word = await Word.findByIdAndDelete(req.params.id);
    if (!word) {
      return res.status(404).json({ message: "Word not found" });
    }
    res.json({ message: "Word deleted successfully" });
  } catch (error) {
    console.error("Delete word error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
