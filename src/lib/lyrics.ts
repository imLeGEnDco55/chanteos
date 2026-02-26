import type { LyricLine } from '@/types/song';
import { parseTime } from './syllables';

export interface TimeIndex {
  time: number;
  index: number;
}

/**
 * Parses lyrics to extract sorted time markers for binary search.
 * Filters out prompt lines and lines without timestamps.
 */
export function getSortedLyricTimes(lyrics: LyricLine[]): TimeIndex[] {
  return lyrics
    .map((line, index) => {
      if (line.type === 'prompt' || !line.timestamp) return null;
      // parseTime returns 0 if invalid format, but that's handled as time 0
      const time = parseTime(line.timestamp);
      return { time, index };
    })
    .filter((item): item is TimeIndex => item !== null)
    .sort((a, b) => a.time - b.time);
}

/**
 * Finds the index of the active lyric line based on current playback time.
 * Uses binary search for O(log N) performance.
 *
 * @param sortedTimes Array of {time, index} objects, sorted by time.
 * @param currentTime Current playback time in seconds.
 * @returns The original index of the active line, or -1 if no line is active.
 */
export function findActiveLyricIndex(
  sortedTimes: TimeIndex[],
  currentTime: number
): number {
  if (sortedTimes.length === 0) return -1;

  // If time is before the first timestamp, no line is active
  if (currentTime < sortedTimes[0].time) return -1;

  let left = 0;
  let right = sortedTimes.length - 1;
  let resultIndex = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (sortedTimes[mid].time <= currentTime) {
      // This line is a candidate (starts before or at current time)
      // We store it and try to find a later one
      resultIndex = sortedTimes[mid].index;
      left = mid + 1;
    } else {
      // This line starts in the future, search in the left half
      right = mid - 1;
    }
  }

  return resultIndex;
}
