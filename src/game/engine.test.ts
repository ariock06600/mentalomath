import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePoints,
  getStreakMultiplier,
  generateQuestion,
  checkUnlockedBadges,
  updatePlayerStats,
  getDefaultPlayerStats,
  DEFAULT_SETTINGS,
  TABLE_TIPS,
  ALL_TABLES,
} from './engine.ts';
import type { AnswerRecord } from './types.ts';

test('getStreakMultiplier scales properly', () => {
  assert.equal(getStreakMultiplier(0), 1);
  assert.equal(getStreakMultiplier(2), 1);
  assert.equal(getStreakMultiplier(3), 2);
  assert.equal(getStreakMultiplier(5), 2);
  assert.equal(getStreakMultiplier(6), 3);
  assert.equal(getStreakMultiplier(9), 3);
  assert.equal(getStreakMultiplier(10), 4);
});

test('generateQuestion produces valid addition problems', () => {
  const settings = {
    ...DEFAULT_SETTINGS,
    selectedTables: [5],
    selectedOperators: ['+' as const],
    maxFactor: 10,
    allowMissingFactors: false,
  };

  for (let i = 0; i < 20; i++) {
    const q = generateQuestion(settings);
    assert.equal(q.operator, '+');
    assert.equal(q.factorA, 5);
    assert.equal(q.correctAnswer, q.factorA + q.factorB);
    assert.ok(q.choices.includes(q.correctAnswer));
    assert.equal(new Set(q.choices).size, 4);
  }
});

test('generateQuestion produces valid non-negative subtraction problems', () => {
  const settings = {
    ...DEFAULT_SETTINGS,
    selectedTables: [4],
    selectedOperators: ['-' as const],
    maxFactor: 10,
    allowMissingFactors: false,
  };

  for (let i = 0; i < 20; i++) {
    const q = generateQuestion(settings);
    assert.equal(q.operator, '-');
    assert.ok(q.factorA >= q.factorB, 'Minuend must be greater than or equal to subtrahend');
    assert.equal(q.correctAnswer, q.factorA - q.factorB);
    assert.ok(q.correctAnswer >= 0);
    assert.ok(q.choices.includes(q.correctAnswer));
  }
});

test('generateQuestion produces exact integer divisions matching multiplication tables', () => {
  const settings = {
    ...DEFAULT_SETTINGS,
    selectedTables: [7],
    selectedOperators: ['÷' as const],
    maxFactor: 10,
    allowMissingFactors: false,
  };

  for (let i = 0; i < 20; i++) {
    const q = generateQuestion(settings);
    assert.equal(q.operator, '÷');
    assert.equal(q.factorB, 7); // divisor
    assert.equal(q.factorA % q.factorB, 0, 'Dividend must be evenly divisible by divisor');
    assert.equal(q.correctAnswer, q.factorA / q.factorB);
    assert.ok(q.choices.includes(q.correctAnswer));
  }
});

test('generateQuestion produces valid multiplication problems', () => {
  const settings = {
    ...DEFAULT_SETTINGS,
    selectedTables: [8],
    selectedOperators: ['x' as const],
    maxFactor: 10,
  };

  for (let i = 0; i < 20; i++) {
    const q = generateQuestion(settings);
    assert.equal(q.operator, 'x');
    assert.equal(q.factorA, 8);
    assert.equal(q.correctAnswer, 8 * q.factorB);
    assert.ok(q.choices.includes(q.correctAnswer));
  }
});

test('badges check correctly unlocks operation specific badges', () => {
  const stats = getDefaultPlayerStats();
  const dummyDivision = {
    id: '56div7',
    factorA: 56,
    factorB: 7,
    operator: '÷' as const,
    correctAnswer: 8,
    displayPrompt: '56 ÷ 7 = ?',
    missingPart: 'result' as const,
    choices: [7, 8, 9, 10],
  };

  const divisionSession: AnswerRecord[] = Array.from({ length: 5 }, () => ({
    question: dummyDivision,
    userAnswer: 8,
    isCorrect: true,
    timeSpentMs: 800,
    pointsEarned: 50,
  }));

  const unlocked = checkUnlockedBadges(stats, divisionSession, 'CHRONO_SPRINT', 250);
  assert.ok(unlocked.includes('division_master'));
  assert.ok(unlocked.includes('streak_5'));
});
