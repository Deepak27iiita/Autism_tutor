import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  analyticsApi,
  parseError,
  sessionApi,
  wordsApi,
} from "../services/api";
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
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const stageStartRef = useRef(Date.now());
  const cardRef = useRef(null);

  const currentWord = words[wordIndex];
  const currentStage = STAGES[stageIndex];
  const animationIntensity = user?.preferences?.animationIntensity || "medium";
  const soundEnabled = user?.preferences?.soundEnabled ?? true;
  const autoAdvance = user?.preferences?.autoAdvance ?? false;

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

    try {
      const pickedWords = await wordsApi.list({ limit: 5 });

      if (!pickedWords.length) {
        throw new Error("No words available. Please add words first.");
      }

      const created = await sessionApi.create({
        sessionType: "training",
        words: pickedWords.map((item) => item._id),
        animationIntensity,
      });

      setWords(pickedWords);
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

  const completeSession = async (nextStats) => {
    if (!sessionId) {
      return;
    }

    const pre = nextStats.total
      ? Math.round((nextStats.correct / nextStats.total) * 100)
      : 0;
    const post = pre;

    await sessionApi.complete(sessionId, {
      preTestScore: pre,
      postTestScore: post,
    });

    await analyticsApi.create({
      userId: user.id || user._id,
      metrics: {
        wordsLearned: words.length,
        accuracyRate: post,
        averageTimePerWord: 8,
        sessionsCompleted: 1,
      },
      animationMetrics: {
        averageIntensity: animationIntensity,
      },
      wordProgress: words.map((word) => ({
        wordId: word._id,
        masteryLevel: post,
        timesPracticed: 1,
        lastPracticed: new Date(),
      })),
    });

    setFinished(true);
  };

  const submitResult = async (correct) => {
    if (!sessionId || !currentWord) {
      return;
    }

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

      const isLastStage = stageIndex === STAGES.length - 1;
      const isLastWord = wordIndex === words.length - 1;

      if (isLastStage && isLastWord) {
        await completeSession(nextStats);
        return;
      }

      const advanceStage = () => {
        if (isLastWord) {
          setStageIndex((prev) => prev + 1);
          setWordIndex(0);
        } else {
          setWordIndex((prev) => prev + 1);
        }
        stageStartRef.current = Date.now();
      };

      if (autoAdvance) {
        setTimeout(advanceStage, 350);
      } else {
        advanceStage();
      }
    } catch (err) {
      setError(parseError(err, "Failed to submit stage result"));
    }
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
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {sessionId && currentWord && !finished && (
        <article className="card learning-card" ref={cardRef}>
          <div className="stage-pill">{currentStage.toUpperCase()}</div>
          <h3>{currentWord.word}</h3>
          <img
            src={currentWord.imageUrl}
            alt={currentWord.word}
            className="learning-image"
            onError={(event) => {
              event.currentTarget.src =
                "https://via.placeholder.com/760x480?text=Image+Unavailable";
            }}
          />
          <p>
            Category: {currentWord.category} • Difficulty:{" "}
            {currentWord.difficulty} • PECS {currentWord.pecsPhase}
          </p>

          <div className="row-wrap center">
            <button
              className="btn btn-success"
              onClick={() => submitResult(true)}
            >
              Correct
            </button>
            <button
              className="btn btn-danger"
              onClick={() => submitResult(false)}
            >
              Incorrect
            </button>
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
