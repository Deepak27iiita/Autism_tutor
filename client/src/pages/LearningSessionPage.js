import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { parseError, sessionApi, wordsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ─── Constants ────────────────────────────────────────────────────── */
const STAGES = [
  { id: "pre-test",     label: "Pre-Test",     color: "#7c3aed", type: "text-mcq",   desc: "Pick the word that matches the image" },
  { id: "presentation", label: "Presentation", color: "#0284c7", type: "passive",    desc: "Watch and listen carefully" },
  { id: "recognition",  label: "Recognition",  color: "#0d9488", type: "image-mcq",  desc: "Pick the image that matches the word" },
  { id: "reading",      label: "Reading",      color: "#ea580c", type: "letter-tiles",desc: "Tap letters to spell the word" },
  { id: "spelling",     label: "Spelling",     color: "#dc2626", type: "spelling",   desc: "Type the word you see in the image" },
  { id: "imitation",    label: "Imitation",    color: "#16a34a", type: "imitation",  desc: "Say the word out loud" },
  { id: "elicitation",  label: "Elicitation",  color: "#b45309", type: "elicitation",desc: "Look at the image and type what it is" },
  { id: "post-test",    label: "Post-Test",    color: "#7c3aed", type: "text-mcq",   desc: "Pick the word that matches the image" },
];
const SESSION_WORD_COUNT = 5;

/* ─── Helpers ───────────────────────────────────────────────────────── */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const speak = (text, enabled) => {
  if (!enabled || !window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.8; u.pitch = 1.1; u.lang = "en-US";
  window.speechSynthesis.speak(u);
};

const buildOptions = (target, allWords) => {
  const others = shuffle(allWords.filter((w) => w._id !== target._id)).slice(0, 3);
  return shuffle([target, ...others]);
};

/* ─── Stage Components ─────────────────────────────────────────────── */

/* Pre/Post Test — image shown, pick word text */
const StageTextMCQ = ({ word, allWords, onAnswer, soundEnabled }) => {
  const options = useMemo(() => buildOptions(word, allWords), [word, allWords]);
  useEffect(() => { speak(`Which word matches this image?`, soundEnabled); }, [word, soundEnabled]);
  return (
    <div className="stage-area">
      <img src={word.imageUrl} alt="?" className="stage-main-image" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300?text=Image"; }} />
      <p className="stage-question">Which word matches this image?</p>
      <div className="text-mcq-grid">
        {options.map((o) => (
          <button key={o._id} className="text-option-btn" onClick={() => onAnswer(o._id === word._id, o.word)}>{o.word}</button>
        ))}
      </div>
    </div>
  );
};

/* Presentation — passive, auto-advance with countdown */
const StagePresentation = ({ word, onDone, soundEnabled, animationIntensity }) => {
  const [countdown, setCountdown] = useState(4);
  useEffect(() => {
    speak(`This is ${word.word}`, soundEnabled);
    const iv = setInterval(() => setCountdown((c) => c - 1), 1000);
    const tm = setTimeout(onDone, 4000);
    return () => { clearInterval(iv); clearTimeout(tm); };
  }, [word, soundEnabled, onDone]);
  return (
    <div className="stage-area">
      <div className="presentation-word">{word.word}</div>
      <img src={word.imageUrl} alt={word.word} className="stage-main-image" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300?text=Image"; }} />
      <div className="countdown-bar"><div className="countdown-fill" style={{ animation: `countdown-shrink 4s linear forwards` }} /></div>
      <p className="stage-question" style={{ opacity: 0.7 }}>Auto-advancing in {countdown}s…</p>
      <button className="btn btn-secondary" style={{ marginTop: "0.5rem" }} onClick={() => { speak(word.word, soundEnabled); }}>🔊 Hear Again</button>
    </div>
  );
};

/* Recognition — word label shown, pick matching image */
const StageImageMCQ = ({ word, allWords, onAnswer, soundEnabled }) => {
  const options = useMemo(() => buildOptions(word, allWords), [word, allWords]);
  useEffect(() => { speak(`Find the image for: ${word.word}`, soundEnabled); }, [word, soundEnabled]);
  return (
    <div className="stage-area">
      <div className="recognition-word">{word.word}</div>
      <p className="stage-question">Tap the correct image</p>
      <div className="quiz-grid">
        {options.map((o) => (
          <button key={o._id} className="quiz-option" onClick={() => onAnswer(o._id === word._id, o.word)}>
            <img src={o.imageUrl} alt={o.word} className="learning-image" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300?text=Image"; }} />
            <div className="quiz-option-label">{o.word}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

/* Reading — image shown, tap shuffled letter tiles in order */
const StageLetterTiles = ({ word, onAnswer, soundEnabled }) => {
  const letters = useMemo(() => shuffle(word.word.toUpperCase().split("")), [word]);
  const [picked, setPicked] = useState([]);
  const [remaining, setRemaining] = useState(() => letters.map((l, i) => ({ l, id: i })));
  const typed = picked.map((t) => t.l).join("");

  useEffect(() => { speak(`Spell: ${word.word}`, soundEnabled); setPicked([]); setRemaining(letters.map((l, i) => ({ l, id: i }))); }, [word]);

  const pick = (tile) => { setPicked((p) => [...p, tile]); setRemaining((r) => r.filter((t) => t.id !== tile.id)); };
  const unpick = (tile, idx) => { setPicked((p) => p.filter((_, i) => i !== idx)); setRemaining((r) => [...r, tile]); };
  const reset = () => { setPicked([]); setRemaining(letters.map((l, i) => ({ l, id: i }))); };
  const submit = () => { if (typed.length === word.word.length) onAnswer(typed.toLowerCase() === word.word.toLowerCase(), typed.toLowerCase()); };

  return (
    <div className="stage-area">
      <img src={word.imageUrl} alt={word.word} className="stage-main-image" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300?text=Image"; }} />
      <p className="stage-question">Tap letters to spell the word</p>
      <div className="letter-answer-row">{word.word.split("").map((_, i) => (
        <div key={i} className={`letter-slot ${picked[i] ? "filled" : ""}`} onClick={() => picked[i] && unpick(picked[i], i)}>{picked[i]?.l || "_"}</div>
      ))}</div>
      <div className="letter-tile-row">{remaining.map((tile) => (
        <button key={tile.id} className="letter-tile-btn" onClick={() => pick(tile)}>{tile.l}</button>
      ))}</div>
      <div className="row-wrap center" style={{ gap: "0.6rem", marginTop: "0.5rem" }}>
        <button className="btn btn-ghost" onClick={reset}>↩ Reset</button>
        <button className="btn btn-primary" disabled={typed.length !== word.word.length} onClick={submit}>Check ✓</button>
      </div>
    </div>
  );
};

/* Spelling — image shown, type word with live letter color feedback */
const StageSpelling = ({ word, onAnswer, soundEnabled, attempts }) => {
  const [typed, setTyped] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { speak(`Spell: ${word.word}`, soundEnabled); setTyped(""); setSubmitted(false); setHintUsed(false); if (inputRef.current) inputRef.current.focus(); }, [word]);

  const letterBoxes = word.word.split("").map((ch, i) => {
    const typedCh = (typed[i] || "").toLowerCase();
    const correct = typedCh === ch.toLowerCase();
    const filled = i < typed.length;
    return { ch, typedCh, correct, filled };
  });

  const submit = () => {
    if (submitted) return;
    setSubmitted(true);
    onAnswer(typed.trim().toLowerCase() === word.word.toLowerCase(), typed.trim().toLowerCase());
  };

  return (
    <div className="stage-area">
      <img src={word.imageUrl} alt="?" className="stage-main-image" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300?text=Image"; }} />
      <p className="stage-question">Type the word you see</p>
      <div className="spelling-boxes">
        {letterBoxes.map((b, i) => (
          <div key={i} className={`spell-box ${b.filled ? (b.correct ? "correct" : "wrong") : ""}`}>{b.typedCh.toUpperCase() || ""}</div>
        ))}
      </div>
      <input ref={inputRef} className="spelling-input" value={typed} maxLength={word.word.length + 3}
        onChange={(e) => !submitted && setTyped(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && typed.length >= word.word.length && submit()}
        placeholder="Type here…" autoComplete="off" autoCorrect="off" spellCheck={false} />
      <div className="row-wrap center" style={{ gap: "0.6rem", marginTop: "0.5rem" }}>
        {!hintUsed && attempts > 0 && (<button className="btn btn-ghost" onClick={() => { setHintUsed(true); speak(word.word, true); }}>💡 Hint (hear it)</button>)}
        <button className="btn btn-primary" disabled={typed.length === 0 || submitted} onClick={submit}>Submit</button>
      </div>
    </div>
  );
};

/* Imitation — speak the word, use SpeechRecognition or confirm button */
const StageImitation = ({ word, onAnswer, soundEnabled }) => {
  const [phase, setPhase] = useState("listen"); // listen → record → done
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));

  useEffect(() => { speak(word.word, soundEnabled); setPhase("listen"); setTranscript(""); }, [word]);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = false; rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript.trim().toLowerCase();
      setTranscript(text); setListening(false); setPhase("done");
      onAnswer(text === word.word.toLowerCase(), text);
    };
    rec.onerror = () => { setListening(false); setPhase("done"); onAnswer(false, ""); };
    rec.onend = () => setListening(false);
    rec.start();
  };

  return (
    <div className="stage-area">
      <img src={word.imageUrl} alt={word.word} className="stage-main-image" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300?text=Image"; }} />
      <div className="recognition-word">{word.word}</div>
      <div className="row-wrap center" style={{ gap: "0.6rem", marginTop: "0.8rem" }}>
        <button className="btn btn-secondary" onClick={() => { speak(word.word, true); setPhase("record"); }}>🔊 Hear the Word</button>
        {phase !== "listen" && (
          supported
            ? <button className={`btn ${listening ? "btn-danger" : "btn-primary"}`} onClick={startListening} disabled={listening}>{listening ? "🎙 Listening…" : "🎤 Say It!"}</button>
            : <button className="btn btn-primary" onClick={() => { setPhase("done"); onAnswer(true, word.word); }}>✅ I Said It!</button>
        )}
      </div>
      {transcript && <p className="stage-question" style={{ marginTop: "0.5rem" }}>You said: <strong>"{transcript}"</strong></p>}
    </div>
  );
};

/* Elicitation — image only, type word with no hints */
const StageElicitation = ({ word, onAnswer, soundEnabled }) => {
  const [typed, setTyped] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { setTyped(""); setSubmitted(false); if (inputRef.current) inputRef.current.focus(); }, [word]);

  const submit = () => {
    if (submitted) return;
    setSubmitted(true);
    onAnswer(typed.trim().toLowerCase() === word.word.toLowerCase(), typed.trim().toLowerCase());
  };

  return (
    <div className="stage-area">
      <img src={word.imageUrl} alt="?" className="stage-main-image" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300?text=Image"; }} />
      <p className="stage-question">What is in this picture? Type below.</p>
      <input ref={inputRef} className="spelling-input" value={typed}
        onChange={(e) => !submitted && setTyped(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && typed.length > 0 && submit()}
        placeholder="Type what you see…" autoComplete="off" autoCorrect="off" spellCheck={false} />
      <button className="btn btn-primary" style={{ marginTop: "0.5rem", alignSelf: "center" }} disabled={typed.length === 0 || submitted} onClick={submit}>Submit</button>
    </div>
  );
};

/* ─── Feedback Overlay ─────────────────────────────────────────────── */
const FeedbackBanner = ({ feedback, word }) => {
  if (!feedback) return null;
  return (
    <div className={`feedback-banner ${feedback === "correct" ? "feedback-correct" : "feedback-wrong"}`}>
      {feedback === "correct" ? `✅ Correct! "${word.word}"` : `❌ Incorrect — the answer was "${word.word}"`}
    </div>
  );
};

/* ─── Progress Bar ─────────────────────────────────────────────────── */
const ProgressBar = ({ stageIndex, wordIndex, totalWords, streak }) => {
  const pct = Math.round(((stageIndex * totalWords + wordIndex) / (STAGES.length * totalWords)) * 100);
  const stage = STAGES[stageIndex];
  return (
    <div className="progress-header">
      <div className="progress-meta">
        <span className="stage-pill" style={{ background: stage.color + "22", color: stage.color, borderColor: stage.color + "44" }}>{stage.label}</span>
        <span className="helper-text">{stage.desc}</span>
        {streak >= 3 && <span className="streak-badge">🔥 {streak} streak!</span>}
      </div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%`, background: stage.color }} /></div>
      <div className="progress-step-dots">
        {STAGES.map((s, i) => (<div key={s.id} className={`step-dot ${i < stageIndex ? "done" : i === stageIndex ? "active" : ""}`} style={i === stageIndex ? { background: s.color } : {}} title={s.label} />))}
      </div>
    </div>
  );
};

/* ─── Celebration Screen ───────────────────────────────────────────── */
const CelebrationScreen = ({ stats, onRestart }) => {
  const pct = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
  return (
    <div className="celebration-card">
      <div className="star-row">{[1,2,3].map((n) => (<span key={n} className={`cel-star ${n <= stars ? "lit" : ""}`}>★</span>))}</div>
      <h2>Session Complete! 🎉</h2>
      <p className="cel-score">{pct}%</p>
      <p>{stats.correct} correct out of {stats.total} answers</p>
      <p style={{ marginTop: "0.5rem", color: pct >= 70 ? "#047857" : "#b91c1c", fontWeight: 800 }}>
        {pct >= 90 ? "Outstanding work! 🌟" : pct >= 70 ? "Great job! Keep it up! 👍" : "Good effort! Practice makes perfect! 💪"}
      </p>
      <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={onRestart}>Start Another Session</button>
    </div>
  );
};

/* ─── Main Page ────────────────────────────────────────────────────── */
const LearningSessionPage = () => {
  const { user } = useAuth();
  const [words, setWords] = useState([]);
  const [allWords, setAllWords] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [stageIndex, setStageIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [awaitingNext, setAwaitingNext] = useState(false);
  const stageStartRef = useRef(Date.now());
  const cardRef = useRef(null);

  const currentWord = words[wordIndex];
  const currentStage = STAGES[stageIndex];
  const animationIntensity = user?.preferences?.animationIntensity || "medium";
  const soundEnabled = user?.preferences?.soundEnabled ?? true;
  const autoAdvance = user?.preferences?.autoAdvance ?? false;

  useEffect(() => {
    if (!cardRef.current) return;
    const dur = animationIntensity === "high" ? 0.35 : animationIntensity === "low" ? 1.0 : 0.6;
    gsap.fromTo(cardRef.current, { opacity: 0, y: 16, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: dur, ease: "power2.out" });
  }, [stageIndex, wordIndex, animationIntensity]);

  const advance = useCallback(() => {
    const isLastWord = wordIndex === words.length - 1;
    const isLastStage = stageIndex === STAGES.length - 1;
    setLastFeedback(null);
    setAttemptCount(0);
    setAwaitingNext(false);
    stageStartRef.current = Date.now();
    if (isLastStage && isLastWord) return;
    if (isLastWord) { setStageIndex((s) => s + 1); setWordIndex(0); }
    else { setWordIndex((w) => w + 1); }
  }, [stageIndex, wordIndex, words.length]);

  const handleAnswer = useCallback(async (correct, spokenWord) => {
    if (!sessionId || !currentWord || awaitingNext) return;
    setAwaitingNext(true);
    const timeSpent = Math.max(1, Math.round((Date.now() - stageStartRef.current) / 1000));
    const newStats = { correct: stats.correct + (correct ? 1 : 0), total: stats.total + 1 };
    setStats(newStats);
    setStreak((s) => correct ? s + 1 : 0);
    setLastFeedback(correct ? "correct" : "incorrect");
    setAttemptCount((a) => a + 1);

    const isLastWord = wordIndex === words.length - 1;
    const isLastStage = stageIndex === STAGES.length - 1;

    try {
      await sessionApi.addResult(sessionId, {
        stage: currentStage.id,
        wordId: currentWord._id,
        correct,
        timeSpent,
        attempts: attemptCount + 1,
        animationLevel: animationIntensity,
        spokenWord: spokenWord || "",
        targetWord: currentWord.word,
      });
      if (isLastStage && isLastWord) {
        await sessionApi.complete(sessionId, {});
        setFinished(true);
        return;
      }
    } catch (err) {
      setError(parseError(err, "Failed to save result"));
    }
    setTimeout(advance, autoAdvance ? 600 : 1200);
  }, [sessionId, currentWord, currentStage, stats, streak, wordIndex, words.length, stageIndex, attemptCount, animationIntensity, autoAdvance, advance, awaitingNext]);

  const handlePresentationDone = useCallback(() => {
    if (!sessionId || !currentWord || awaitingNext) return;
    setAwaitingNext(true);
    const timeSpent = Math.max(1, Math.round((Date.now() - stageStartRef.current) / 1000));
    sessionApi.addResult(sessionId, { stage: currentStage.id, wordId: currentWord._id, correct: true, timeSpent, attempts: 1, animationLevel: animationIntensity });
    setStats((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
    advance();
  }, [sessionId, currentWord, currentStage, animationIntensity, advance, awaitingNext]);

  const startSession = async () => {
    setError(""); setFinished(false); setIsLoading(true);
    setStats({ correct: 0, total: 0 }); setStreak(0);
    setLastFeedback(null); setAttemptCount(0); setAwaitingNext(false);
    try {
      const [catalog, recommended] = await Promise.all([
        wordsApi.list(),
        wordsApi.recommended(SESSION_WORD_COUNT).catch(() => []),
      ]);
      const source = recommended.length ? recommended : catalog;
      const picked = shuffle(source).slice(0, SESSION_WORD_COUNT);
      if (!picked.length) throw new Error("No words available. Please add words first.");
      const created = await sessionApi.create({ sessionType: "training", words: picked.map((w) => w._id), animationIntensity });
      setWords(picked); setAllWords(catalog);
      setSessionId(created._id); setStageIndex(0); setWordIndex(0);
      stageStartRef.current = Date.now();
    } catch (err) {
      setError(parseError(err, "Failed to start session"));
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => { setSessionId(""); setWords([]); setAllWords([]); setFinished(false); setStats({ correct: 0, total: 0 }); setStreak(0); setStageIndex(0); setWordIndex(0); };

  const renderStage = () => {
    if (!currentWord) return null;
    const props = { word: currentWord, allWords, soundEnabled, animationIntensity, onAnswer: handleAnswer, attempts: attemptCount };
    switch (currentStage.type) {
      case "text-mcq":     return <StageTextMCQ {...props} />;
      case "passive":      return <StagePresentation {...props} onDone={handlePresentationDone} />;
      case "image-mcq":    return <StageImageMCQ {...props} />;
      case "letter-tiles": return <StageLetterTiles {...props} />;
      case "spelling":     return <StageSpelling {...props} />;
      case "imitation":    return <StageImitation {...props} />;
      case "elicitation":  return <StageElicitation {...props} />;
      default:             return null;
    }
  };

  const pct = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <section className="stack-lg">
      <div className="card hero-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.8rem" }}>
        <div>
          <h2>8-Stage Learning Session</h2>
          <p>PECS-inspired adaptive flow: pre-test → learn → spell → speak → post-test</p>
        </div>
        <div className="row-wrap">
          <button className="btn btn-primary" onClick={startSession} disabled={isLoading} style={{ background: "white", color: "#1d4ed8" }}>
            {isLoading ? "Starting…" : sessionId ? "↩ Restart" : "▶ Start Session"}
          </button>
          {stats.total > 0 && <span className="role-chip" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>Live: {pct}% ({stats.correct}/{stats.total})</span>}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {sessionId && !finished && currentWord && (
        <>
          <ProgressBar stageIndex={stageIndex} wordIndex={wordIndex} totalWords={words.length} streak={streak} />
          <article className="card learning-card" ref={cardRef}>
            <div className="word-index-row">
              <span className="helper-text">Word {wordIndex + 1} of {words.length}</span>
              <span className="helper-text">{currentWord.category} • {currentWord.difficulty}</span>
            </div>
            {renderStage()}
            <FeedbackBanner feedback={lastFeedback} word={currentWord} />
          </article>
        </>
      )}

      {finished && <CelebrationScreen stats={stats} onRestart={() => { resetSession(); }} />}

      {!sessionId && !finished && (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <p style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🧠</p>
          <h3>Ready to Learn?</h3>
          <p>Complete all 8 stages: recognition, spelling, speaking, and more.</p>
          <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={startSession} disabled={isLoading}>{isLoading ? "Loading…" : "Start Session"}</button>
        </div>
      )}
    </section>
  );
};

export default LearningSessionPage;
