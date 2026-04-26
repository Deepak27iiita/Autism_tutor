import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { parseError, sessionApi, wordsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const STAGES = [
  "pre-test",
  "presentation",
  "recognition",
  "reading",
  "spelling",
  "imitation",
  "elicitation",
  "post-test",
];

const SESSION_WORD_COUNT = 5;
const RECENT_WORDS_WINDOW = 15;
const QUIZ_OPTION_COUNT = 4;

const getRecentWordsKey = (userId) => `recentSessionWords:${userId || "guest"}`;

const shuffleArray = (items) => {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

const pickWordsForSession = (allWords, recentWordIds) => {
  const shuffled = shuffleArray(allWords);
  const recentSet = new Set(recentWordIds || []);
  const freshWords = shuffled.filter((item) => !recentSet.has(item._id));

  if (freshWords.length >= SESSION_WORD_COUNT) {
    return freshWords.slice(0, SESSION_WORD_COUNT);
  }

  const selectedIds = new Set(freshWords.map((item) => item._id));
  const fallbackWords = shuffled.filter((item) => !selectedIds.has(item._id));
  return [...freshWords, ...fallbackWords].slice(0, SESSION_WORD_COUNT);
};

const buildQuestionOptions = (targetWord, catalogWords, sessionWords) => {
  if (!targetWord) {
    return [];
  }

  const normalizedCatalog = (catalogWords || []).filter(
    (item) => item?._id && item.imageUrl,
  );
  const uniqueById = new Map();
  normalizedCatalog.forEach((item) => {
    uniqueById.set(item._id, item);
  });

  const distractors = [];
  const targetId = targetWord._id;

  const sameCategory = shuffleArray(
    normalizedCatalog.filter(
      (item) => item._id !== targetId && item.category === targetWord.category,
    ),
  );
  sameCategory.forEach((item) => {
    if (distractors.length < QUIZ_OPTION_COUNT - 1) {
      distractors.push(item);
    }
  });

  const remainingPool = shuffleArray(
    normalizedCatalog.filter(
      (item) =>
        item._id !== targetId && !distractors.some((d) => d._id === item._id),
    ),
  );
  remainingPool.forEach((item) => {
    if (distractors.length < QUIZ_OPTION_COUNT - 1) {
      distractors.push(item);
    }
  });

  if (distractors.length < QUIZ_OPTION_COUNT - 1) {
    const sessionFallback = shuffleArray(
      (sessionWords || []).filter(
        (item) =>
          item._id !== targetId && !distractors.some((d) => d._id === item._id),
      ),
    );
    sessionFallback.forEach((item) => {
      if (distractors.length < QUIZ_OPTION_COUNT - 1) {
        distractors.push(item);
      }
    });
  }

  const options = shuffleArray([targetWord, ...distractors]).slice(
    0,
    QUIZ_OPTION_COUNT,
  );

  // Ensure no duplicates even in fallback-heavy scenarios.
  const deduped = [];
  options.forEach((item) => {
    if (!deduped.some((entry) => entry._id === item._id)) {
      deduped.push(item);
    }
  });

  if (!deduped.some((item) => item._id === targetId)) {
    deduped[0] = targetWord;
  }

  return shuffleArray(deduped);
};

const speak = (text, enabled) => {
  if (!enabled || !window.speechSynthesis || !text) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85;
  utterance.pitch = 1;
  utterance.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

const LearningSessionPage = () => {
  const { user } = useAuth();
  const [words, setWords] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [stageIndex, setStageIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [catalogWords, setCatalogWords] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const stageStartRef = useRef(Date.now());
  const cardRef = useRef(null);

  const currentWord = words[wordIndex];
  const currentStage = STAGES[stageIndex];
  const animationIntensity = user?.preferences?.animationIntensity || "medium";
  const soundEnabled = user?.preferences?.soundEnabled ?? true;
  const autoAdvance = user?.preferences?.autoAdvance ?? false;
  const currentOptions = useMemo(
    () => buildQuestionOptions(currentWord, catalogWords, words),
    [currentWord, catalogWords, words, stageIndex, wordIndex],
  );

  useEffect(() => {
    if (!cardRef.current) {
      return;
    }

    const duration =
      animationIntensity === "high"
        ? 0.45
        : animationIntensity === "low"
          ? 1.2
          : 0.75;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 18, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration, ease: "power2.out" },
    );
  }, [stageIndex, wordIndex, animationIntensity]);

  useEffect(() => {
    if (currentStage === "presentation" && currentWord) {
      speak(`This is ${currentWord.word}`, soundEnabled);
    }
  }, [currentStage, currentWord, soundEnabled]);

  const startSession = async () => {
    setError("");
    setFinished(false);
    setIsLoading(true);
    setStats({ correct: 0, total: 0 });
    setLastFeedback(null);

    try {
      const [allCatalogWords, recommendedWords] = await Promise.all([
        wordsApi.list(),
        wordsApi.recommended(SESSION_WORD_COUNT).catch(() => []),
      ]);

      const sourceWords = recommendedWords.length
        ? recommendedWords
        : allCatalogWords;

      const recentWordsKey = getRecentWordsKey(user?.id || user?._id);
      const recentWordIds = JSON.parse(
        localStorage.getItem(recentWordsKey) || "[]",
      );

      const pickedWords = pickWordsForSession(sourceWords, recentWordIds);

      if (!pickedWords.length) {
        throw new Error("No words available. Please add words first.");
      }

      const created = await sessionApi.create({
        sessionType: "training",
        words: pickedWords.map((item) => item._id),
        animationIntensity,
      });

      setWords(pickedWords);
      setCatalogWords(allCatalogWords);
      setSelectedOptionId("");
      setLastFeedback(null);

      const nextRecentWords = [
        ...pickedWords.map((item) => item._id),
        ...recentWordIds,
      ].slice(0, RECENT_WORDS_WINDOW);
      localStorage.setItem(recentWordsKey, JSON.stringify(nextRecentWords));

      setSessionId(created._id);
      setStageIndex(0);
      setWordIndex(0);
      stageStartRef.current = Date.now();
    } catch (err) {
      setError(parseError(err, "Failed to start session"));
    } finally {
      setIsLoading(false);
    }
  };

  const completeSession = async () => {
    if (!sessionId) {
      return;
    }

    await sessionApi.complete(sessionId, {});

    setFinished(true);
  };

  const submitResult = async (correct) => {
    if (!sessionId || !currentWord || isSubmittingAnswer) {
      return;
    }

    setIsSubmittingAnswer(true);

    const timeSpent = Math.max(
      1,
      Math.round((Date.now() - stageStartRef.current) / 1000),
    );

    try {
      await sessionApi.addResult(sessionId, {
        stage: currentStage,
        wordId: currentWord._id,
        correct,
        timeSpent,
        attempts: 1,
        animationLevel: animationIntensity,
      });

      const nextStats = {
        correct: stats.correct + (correct ? 1 : 0),
        total: stats.total + 1,
      };
      setStats(nextStats);
      setLastFeedback(correct ? "correct" : "incorrect");

      const isLastStage = stageIndex === STAGES.length - 1;
      const isLastWord = wordIndex === words.length - 1;

      if (isLastStage && isLastWord) {
        await completeSession();
        return;
      }

      const advanceStage = () => {
        if (isLastWord) {
          setStageIndex((prev) => prev + 1);
          setWordIndex(0);
        } else {
          setWordIndex((prev) => prev + 1);
        }
        setSelectedOptionId("");
        setLastFeedback(null);
        stageStartRef.current = Date.now();
      };

      setTimeout(advanceStage, autoAdvance ? 350 : 160);
    } catch (err) {
      setError(parseError(err, "Failed to submit stage result"));
      setSelectedOptionId("");
      setLastFeedback(null);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const onSelectOption = async (option) => {
    if (!currentWord || !option || isSubmittingAnswer) {
      return;
    }

    setSelectedOptionId(option._id);
    await submitResult(option._id === currentWord._id);
  };

  const progressText = useMemo(() => {
    if (!words.length) {
      return "No session started";
    }

    return `Stage ${stageIndex + 1}/${STAGES.length} • Word ${wordIndex + 1}/${words.length}`;
  }, [words.length, stageIndex, wordIndex]);

  return (
    <section className="stack-lg">
      <div className="card">
        <h2>8-Stage Learning Session</h2>
        <p>
          Run the complete PECS-inspired sequence from pre-test to post-test.
        </p>
        <div className="row-wrap">
          <button
            className="btn btn-primary"
            onClick={startSession}
            disabled={isLoading}
          >
            {isLoading ? "Starting..." : "Start New Session"}
          </button>
          <span className="helper-text">{progressText}</span>
          {words.length > 0 && (
            <span className="helper-text">
              Live Accuracy:{" "}
              {stats.total
                ? Math.round((stats.correct / stats.total) * 100)
                : 0}
              %
            </span>
          )}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {sessionId && currentWord && !finished && (
        <article className="card learning-card" ref={cardRef}>
          <div className="stage-pill">{currentStage.toUpperCase()}</div>
          <h3>Select the correct image: {currentWord.word}</h3>
          <div className="quiz-grid">
            {currentOptions.map((option) => (
              <button
                key={option._id}
                type="button"
                className={`quiz-option ${
                  selectedOptionId === option._id ? "is-selected" : ""
                }`}
                onClick={() => onSelectOption(option)}
                disabled={isSubmittingAnswer || Boolean(lastFeedback)}
              >
                <img
                  src={option.imageUrl}
                  alt={option.word}
                  className="learning-image"
                  onError={(event) => {
                    event.currentTarget.src =
                      "https://via.placeholder.com/760x480?text=Image+Unavailable";
                  }}
                />
                <div className="quiz-option-label">{option.word}</div>
              </button>
            ))}
          </div>
          {lastFeedback && (
            <div
              className={`feedback-banner ${
                lastFeedback === "correct"
                  ? "feedback-correct"
                  : "feedback-wrong"
              }`}
            >
              {lastFeedback === "correct"
                ? `Correct! ${currentWord.word} was selected.`
                : `Incorrect. The correct answer was ${currentWord.word}.`}
            </div>
          )}
          <p>
            Category: {currentWord.category} • Difficulty:{" "}
            {currentWord.difficulty} • PECS {currentWord.pecsPhase}
          </p>

          <div className="row-wrap center">
            <button
              className="btn btn-secondary"
              onClick={() => speak(currentWord.word, soundEnabled)}
              type="button"
            >
              Replay Audio Cue
            </button>
          </div>
        </article>
      )}

      {finished && (
        <article className="card success-card">
          <h3>Session Completed</h3>
          <p>
            Accuracy:{" "}
            {stats.total ? Math.round((stats.correct / stats.total) * 100) : 0}%
            ({stats.correct}/{stats.total})
          </p>
          <p>
            Analytics record created successfully. You can review details in the
            Analytics page.
          </p>
        </article>
      )}
    </section>
  );
};

export default LearningSessionPage;
