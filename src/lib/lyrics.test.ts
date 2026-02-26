import { describe, it, expect } from 'vitest';
import { findActiveLyricIndex, getSortedLyricTimes, TimeIndex } from './lyrics';
import type { LyricLine } from '@/types/song';

describe('findActiveLyricIndex', () => {
  const sortedTimes: TimeIndex[] = [
    { time: 5.0, index: 0 },
    { time: 10.0, index: 2 },
    { time: 15.0, index: 4 },
  ];

  it('returns -1 for empty list', () => {
    expect(findActiveLyricIndex([], 5.0)).toBe(-1);
  });

  it('returns -1 if current time is before first timestamp', () => {
    expect(findActiveLyricIndex(sortedTimes, 4.9)).toBe(-1);
    expect(findActiveLyricIndex(sortedTimes, 0)).toBe(-1);
  });

  it('returns index of first timestamp if exact match', () => {
    expect(findActiveLyricIndex(sortedTimes, 5.0)).toBe(0);
  });

  it('returns index of previous timestamp if between two timestamps', () => {
    expect(findActiveLyricIndex(sortedTimes, 7.5)).toBe(0);
    expect(findActiveLyricIndex(sortedTimes, 12.0)).toBe(2);
  });

  it('returns index of last timestamp if exact match', () => {
    expect(findActiveLyricIndex(sortedTimes, 15.0)).toBe(4);
  });

  it('returns index of last timestamp if time is after last timestamp', () => {
    expect(findActiveLyricIndex(sortedTimes, 20.0)).toBe(4);
  });

  it('handles duplicate timestamps (returns last occurrence index)', () => {
    const duplicates: TimeIndex[] = [
      { time: 5.0, index: 0 },
      { time: 5.0, index: 1 },
      { time: 10.0, index: 2 },
    ];
    // Should return 1 because binary search continues to the right on equality
    expect(findActiveLyricIndex(duplicates, 5.0)).toBe(1);
    expect(findActiveLyricIndex(duplicates, 7.0)).toBe(1);
  });
});

describe('getSortedLyricTimes', () => {
  const createLine = (timestamp: string, type: 'lyric' | 'prompt' = 'lyric'): LyricLine => ({
    id: 'id',
    type,
    timestamp,
    text: 'text',
    syllableCount: 0,
  });

  it('extracts valid timestamps and sorts them', () => {
    const lyrics: LyricLine[] = [
      createLine('0:10'), // 10s -> index 0
      createLine('0:05'), // 5s -> index 1 (out of order in source)
      createLine(''),     // Invalid timestamp -> index 2 (ignored)
      createLine('0:15', 'prompt'), // Prompt -> index 3 (ignored)
      createLine('0:20'), // 20s -> index 4
    ];

    const result = getSortedLyricTimes(lyrics);

    expect(result).toHaveLength(3);
    // Should be sorted by time: 5s (idx 1), 10s (idx 0), 20s (idx 4)
    expect(result[0]).toEqual({ time: 5, index: 1 });
    expect(result[1]).toEqual({ time: 10, index: 0 });
    expect(result[2]).toEqual({ time: 20, index: 4 });
  });
});
