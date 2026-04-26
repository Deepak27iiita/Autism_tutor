const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const STAGE_WEIGHTS = {
  "pre-test": 0.8,
  presentation: 0.6,
  recognition: 1,
  reading: 1.1,
  spelling: 1.2,
  imitation: 1,
  elicitation: 1.15,
  "post-test": 1.25,
};

const DEFAULT_MASTERY = 50;

const buildAdaptiveModel = (sessions = []) => {
  const wordBuckets = new Map();

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

      if (
        !bucket.lastPracticedAt ||
        new Date(result.timestamp) > new Date(bucket.lastPracticedAt)
      ) {
        bucket.lastPracticedAt = result.timestamp;
      }
    });
  });

  const words = Array.from(wordBuckets.values()).map((bucket) => {
    const accuracy = bucket.total ? bucket.correct / bucket.total : 0;
    const weightedAccuracy = bucket.weightedTotal
      ? bucket.weightedCorrect / bucket.weightedTotal
      : accuracy;
    const avgAttempts = bucket.total ? bucket.totalAttempts / bucket.total : 1;
    const avgTime = bucket.total ? bucket.totalTime / bucket.total : 0;

    const confidence = clamp(bucket.total / 12, 0, 1);
    const speedScore = clamp(1 - avgTime / 12, 0, 1);
    const attemptsScore = clamp(1 - (avgAttempts - 1) * 0.25, 0, 1);

    const rawScore =
      weightedAccuracy * 0.55 +
      accuracy * 0.15 +
      speedScore * 0.15 +
      attemptsScore * 0.15;

    const mastery = Math.round(
      (rawScore * confidence + 0.5 * (1 - confidence)) * 100,
    );

    return {
      ...bucket,
      accuracy: Math.round(accuracy * 100),
      weightedAccuracy: Math.round(weightedAccuracy * 100),
      averageAttempts: Math.round(avgAttempts * 100) / 100,
      averageTime: Math.round(avgTime * 100) / 100,
      confidence: Math.round(confidence * 100),
      mastery: clamp(mastery, 0, 100),
    };
  });

  const predictedAccuracy = words.length
    ? Math.round(
        words.reduce((sum, item) => sum + item.mastery, 0) / words.length,
      )
    : DEFAULT_MASTERY;

  const weakWords = [...words]
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 10);

  const recommendedAnimationIntensity =
    predictedAccuracy < 55 ? "high" : predictedAccuracy < 75 ? "medium" : "low";

  return {
    predictedAccuracy,
    recommendedAnimationIntensity,
    weakWords,
    wordPerformance: words,
    observations: {
      trackedWords: words.length,
      trackedSessions: sessions.length,
    },
  };
};

module.exports = {
  buildAdaptiveModel,
};
