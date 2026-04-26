/**
 * Adaptive Learning Engine — v2
 *
 * Improvements over v1:
 *  - Ebbinghaus forgetting-curve decay (mastery drops if word not practiced)
 *  - Stage-specific sub-scores (spelling harder than recognition)
 *  - Trend detection per word (improving / stable / declining)
 *  - Dynamic recommended session size (3–7 words based on load)
 *  - Confidence scaled over 20 attempts (not 12)
 */

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Stage weights — higher means the stage contributes more to mastery
const STAGE_WEIGHTS = {
  'pre-test':     0.8,
  presentation:   0.4,   // passive — lower weight
  recognition:    1.0,
  reading:        1.1,
  spelling:       1.35,  // hardest expressive stage
  imitation:      1.0,
  elicitation:    1.2,
  'post-test':    1.3,
};

const DEFAULT_MASTERY = 50;
const DECAY_HALF_LIFE_DAYS = 7; // mastery halves every 7 days without practice

/**
 * Ebbinghaus forgetting decay factor.
 * Returns 1.0 if practiced today, approaches 0 as days increase.
 */
const forgettingDecay = (lastPracticedAt) => {
  if (!lastPracticedAt) return 0.6; // unknown — apply moderate decay
  const daysSince = (Date.now() - new Date(lastPracticedAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.pow(0.5, daysSince / DECAY_HALF_LIFE_DAYS);
};

/**
 * buildAdaptiveModel
 *
 * @param {Object[]} sessions - completed sessions with results arrays
 * @returns {Object} model with mastery scores, recommendations, trends
 */
const buildAdaptiveModel = (sessions = []) => {
  const wordBuckets = new Map();

  // Aggregate all session results into per-word buckets
  sessions.forEach((session) => {
    (session.results || []).forEach((result) => {
      const wordId = String(result.wordId);
      if (!wordBuckets.has(wordId)) {
        wordBuckets.set(wordId, {
          wordId,
          total: 0,
          correct: 0,
          totalAttempts: 0,
          totalTime: 0,
          weightedTotal: 0,
          weightedCorrect: 0,
          lastPracticedAt: null,
          // Per-stage tracking
          stageBreakdown: {},
          // Chronological accuracy samples for trend detection
          chronologicalResults: [],
        });
      }

      const bucket = wordBuckets.get(wordId);
      const attempts = Number(result.attempts || 1);
      const timeSpent = Number(result.timeSpent || 0);
      const stageWeight = STAGE_WEIGHTS[result.stage] || 1;

      bucket.total += 1;
      bucket.correct += result.correct ? 1 : 0;
      bucket.totalAttempts += attempts;
      bucket.totalTime += timeSpent;
      bucket.weightedTotal += stageWeight;
      bucket.weightedCorrect += result.correct ? stageWeight : 0;

      // Per-stage breakdown
      if (!bucket.stageBreakdown[result.stage]) {
        bucket.stageBreakdown[result.stage] = { correct: 0, total: 0 };
      }
      bucket.stageBreakdown[result.stage].total += 1;
      if (result.correct) bucket.stageBreakdown[result.stage].correct += 1;

      // Track last practiced timestamp
      const ts = result.timestamp ? new Date(result.timestamp) : null;
      if (ts && (!bucket.lastPracticedAt || ts > new Date(bucket.lastPracticedAt))) {
        bucket.lastPracticedAt = result.timestamp;
      }

      // Chronological for trend: store simplified {ts, correct}
      bucket.chronologicalResults.push({
        ts: ts ? ts.getTime() : 0,
        correct: result.correct ? 1 : 0,
      });
    });
  });

  const words = Array.from(wordBuckets.values()).map((bucket) => {
    // Sort chronological results by timestamp
    bucket.chronologicalResults.sort((a, b) => a.ts - b.ts);

    const accuracy = bucket.total ? bucket.correct / bucket.total : 0;
    const weightedAccuracy = bucket.weightedTotal
      ? bucket.weightedCorrect / bucket.weightedTotal
      : accuracy;
    const avgAttempts = bucket.total ? bucket.totalAttempts / bucket.total : 1;
    const avgTime = bucket.total ? bucket.totalTime / bucket.total : 0;

    // Confidence based on 20 attempts (more conservative than v1's 12)
    const confidence = clamp(bucket.total / 20, 0, 1);
    const speedScore = clamp(1 - avgTime / 15, 0, 1);
    const attemptsScore = clamp(1 - (avgAttempts - 1) * 0.2, 0, 1);

    // Spelling-specific mastery sub-score
    const spellingData = bucket.stageBreakdown['spelling'];
    const spellingScore = spellingData && spellingData.total > 0
      ? spellingData.correct / spellingData.total
      : null;

    // Base raw score
    let rawScore =
      weightedAccuracy * 0.50 +
      accuracy       * 0.15 +
      speedScore     * 0.15 +
      attemptsScore  * 0.20;

    // Blend in spelling sub-score when available (it matters the most)
    if (spellingScore !== null) {
      rawScore = rawScore * 0.65 + spellingScore * 0.35;
    }

    // Apply forgetting-curve decay
    const decay = forgettingDecay(bucket.lastPracticedAt);
    const decayedRawScore = rawScore * decay + rawScore * (1 - decay) * 0.3;

    // Mastery = blended with confidence anchor at 50%
    const mastery = Math.round(
      (decayedRawScore * confidence + 0.5 * (1 - confidence)) * 100,
    );

    // Trend detection — compare first half vs second half of practice history
    let trend = 'stable';
    const ch = bucket.chronologicalResults;
    if (ch.length >= 6) {
      const mid = Math.floor(ch.length / 2);
      const firstHalfAcc = ch.slice(0, mid).reduce((s, x) => s + x.correct, 0) / mid;
      const secondHalfAcc = ch.slice(mid).reduce((s, x) => s + x.correct, 0) / (ch.length - mid);
      if (secondHalfAcc - firstHalfAcc > 0.15) trend = 'improving';
      else if (firstHalfAcc - secondHalfAcc > 0.15) trend = 'declining';
    }

    // Days since last practiced
    const daysSincePractice = bucket.lastPracticedAt
      ? Math.floor((Date.now() - new Date(bucket.lastPracticedAt).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      wordId: bucket.wordId,
      mastery: clamp(mastery, 0, 100),
      accuracy: Math.round(accuracy * 100),
      weightedAccuracy: Math.round(weightedAccuracy * 100),
      spellingAccuracy: spellingScore !== null ? Math.round(spellingScore * 100) : null,
      averageAttempts: Math.round(avgAttempts * 100) / 100,
      averageTime: Math.round(avgTime * 100) / 100,
      confidence: Math.round(confidence * 100),
      trend,
      daysSincePractice,
      stageBreakdown: Object.fromEntries(
        Object.entries(bucket.stageBreakdown).map(([stage, d]) => [
          stage,
          { accuracy: Math.round((d.correct / d.total) * 100), attempts: d.total },
        ]),
      ),
    };
  });

  // Overall predicted accuracy (mean mastery)
  const predictedAccuracy = words.length
    ? Math.round(words.reduce((s, w) => s + w.mastery, 0) / words.length)
    : DEFAULT_MASTERY;

  // Weak words — sorted by mastery ascending (worst first)
  const weakWords = [...words].sort((a, b) => a.mastery - b.mastery).slice(0, 10);

  // Declining words — need urgent attention
  const decliningWords = words.filter((w) => w.trend === 'declining');

  // Words overdue for review (not practiced in >7 days, mastery < 80)
  const dueForReview = words.filter(
    (w) => w.daysSincePractice !== null && w.daysSincePractice >= 7 && w.mastery < 80,
  );

  // Recommended animation intensity based on accuracy
  const recommendedAnimationIntensity =
    predictedAccuracy < 55 ? 'high' : predictedAccuracy < 75 ? 'medium' : 'low';

  // Recommended session word count — reduce load if struggling
  const recommendedSessionSize =
    predictedAccuracy < 45 ? 3 : predictedAccuracy < 65 ? 4 : predictedAccuracy < 80 ? 5 : 6;

  return {
    predictedAccuracy,
    recommendedAnimationIntensity,
    recommendedSessionSize,
    weakWords,
    decliningWords,
    dueForReview,
    wordPerformance: words,
    observations: {
      trackedWords: words.length,
      trackedSessions: sessions.length,
    },
  };
};

module.exports = { buildAdaptiveModel };
