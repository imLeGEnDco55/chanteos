import { describe, it, expect } from 'vitest';
import { prepareLyricNodes, findActiveLineIndex, type LyricNode } from './lyrics';
import type { LyricLine } from '../types/song';

describe('prepareLyricNodes', () => {
  it('should filter out prompts and lines without timestamps', () => {
    const lyrics: LyricLine[] = [
      { id: '1', type: 'lyric', timestamp: '0:10', text: 'Line 1', syllableCount: 5 },
      { id: '2', type: 'prompt', timestamp: '', text: 'Prompt', syllableCount: 0 },
      { id: '3', type: 'lyric', timestamp: '', text: 'No timestamp', syllableCount: 3 },
      { id: '4', type: 'lyric', timestamp: '0:20', text: 'Line 2', syllableCount: 5 },
    ];
    const nodes = prepareLyricNodes(lyrics);
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toEqual({ time: 10, index: 0 });
    expect(nodes[1]).toEqual({ time: 20, index: 3 });
  });

  it('should sort nodes by time', () => {
    const lyrics: LyricLine[] = [
      { id: '1', type: 'lyric', timestamp: '0:20', text: 'Line 2', syllableCount: 5 },
      { id: '2', type: 'lyric', timestamp: '0:10', text: 'Line 1', syllableCount: 5 },
    ];
    const nodes = prepareLyricNodes(lyrics);
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toEqual({ time: 10, index: 1 });
    expect(nodes[1]).toEqual({ time: 20, index: 0 });
  });

  it('should maintain stable order for same timestamps', () => {
    const lyrics: LyricLine[] = [
      { id: '1', type: 'lyric', timestamp: '0:10', text: 'Line 1', syllableCount: 5 },
      { id: '2', type: 'lyric', timestamp: '0:10', text: 'Line 2', syllableCount: 5 },
    ];
    const nodes = prepareLyricNodes(lyrics);
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toEqual({ time: 10, index: 0 });
    expect(nodes[1]).toEqual({ time: 10, index: 1 });
  });
});

describe('findActiveLineIndex', () => {
  const nodes: LyricNode[] = [
    { time: 10, index: 0 },
    { time: 20, index: 1 },
    { time: 30, index: 2 },
  ];

  it('should return -1 if time is before first node', () => {
    expect(findActiveLineIndex(nodes, 0)).toBe(-1);
    expect(findActiveLineIndex(nodes, 9)).toBe(-1);
  });

  it('should return correct index for exact match', () => {
    expect(findActiveLineIndex(nodes, 10)).toBe(0);
    expect(findActiveLineIndex(nodes, 20)).toBe(1);
    expect(findActiveLineIndex(nodes, 30)).toBe(2);
  });

  it('should return correct index for time between nodes', () => {
    expect(findActiveLineIndex(nodes, 15)).toBe(0); // Still on Line 1
    expect(findActiveLineIndex(nodes, 25)).toBe(1); // Still on Line 2
  });

  it('should return last index if time is after last node', () => {
    expect(findActiveLineIndex(nodes, 40)).toBe(2);
    expect(findActiveLineIndex(nodes, 100)).toBe(2);
  });

  it('should return -1 for empty nodes', () => {
    expect(findActiveLineIndex([], 10)).toBe(-1);
  });

  it('should return the latest line for same timestamps', () => {
    const sameTimeNodes: LyricNode[] = [
        { time: 10, index: 0 },
        { time: 10, index: 1 },
    ];
    // If multiple lines have same timestamp, we want the LAST one in the list?
    // Current logic: finds the rightmost node <= time.
    // If time is 10. Both satisfy <= 10.
    // Binary search logic:
    // mid=0 (index 0). <= 10. result=0. low=1.
    // mid=1 (index 1). <= 10. result=1. low=2.
    // Result is 1. Correct.
    expect(findActiveLineIndex(sameTimeNodes, 10)).toBe(1);
    expect(findActiveLineIndex(sameTimeNodes, 15)).toBe(1);
  });
});
