import type { LyricLine } from '../types/song';
import { parseTime } from './syllables';

export interface LyricNode {
  time: number;
  index: number;
}

/**
 * Prepares lyric nodes for efficient searching.
 * Filters out prompt lines and lines without timestamps.
 * Parses timestamps and sorts nodes by time.
 * Includes original index for mapping back to the full lyrics array.
 */
export function prepareLyricNodes(lyrics: LyricLine[]): LyricNode[] {
  return lyrics
    .map((line, index) => {
      if (line.type !== 'prompt' && line.timestamp) {
        const time = parseTime(line.timestamp);
        // Only include valid times (>= 0)
        if (time >= 0) {
          return { time, index };
        }
      }
      return null;
    })
    .filter((node): node is LyricNode => node !== null)
    .sort((a, b) => {
      // Sort by time primarily
      if (a.time !== b.time) {
        return a.time - b.time;
      }
      // If times are equal, preserve original order (stable sort)
      return a.index - b.index;
    });
}

/**
 * Finds the index of the active lyric line based on the current playback time.
 * Uses binary search (O(log N)) on sorted nodes to find the largest time <= currentTime.
 * Returns the original index of the found line, or -1 if no line is active.
 */
export function findActiveLineIndex(nodes: LyricNode[], currentTime: number): number {
  if (nodes.length === 0) return -1;
  if (currentTime < nodes[0].time) return -1;

  // Binary search for the rightmost element with time <= currentTime
  let low = 0;
  let high = nodes.length - 1;
  let result = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const node = nodes[mid];

    if (node.time <= currentTime) {
      // Found a candidate, try to find a later one
      result = node.index;
      low = mid + 1;
    } else {
      // Too late, search in the left half
      high = mid - 1;
    }
  }

  return result;
}
