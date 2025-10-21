/**
 * IndexedDB 기반 오프라인 스토리지
 * Dexie.js 사용
 */

import Dexie, { Table } from 'dexie';
import { Verse, Word } from '../types';

// ============================================
// 타입 정의
// ============================================

export interface CachedVerse {
  id: string;
  data: Verse;
  cachedAt: number;
}

export interface CachedWord {
  id: string;
  data: Word;
  cachedAt: number;
}

export interface OfflineUserProgress {
  id: string;
  user_id: string;
  verse_id: string;
  completed: boolean;
  completed_at: string | null;
  review_count: number;
  last_reviewed_at: string | null;
  synced: boolean; // 서버와 동기화 완료 여부
  created_at: string;
  updated_at: string;
}

export interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: unknown; // 테이블에 따라 타입이 다르므로 unknown 사용
  timestamp: number;
  retries: number;
}

// ============================================
// Dexie Database 클래스
// ============================================

class BibleStudyDatabase extends Dexie {
  // 테이블 정의
  verses!: Table<CachedVerse, string>;
  words!: Table<CachedWord, string>;
  userProgress!: Table<OfflineUserProgress, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super('BibleStudyDB');

    // 스키마 정의
    this.version(1).stores({
      verses: 'id, cachedAt',
      words: 'id, cachedAt',
      userProgress: 'id, user_id, verse_id, synced',
      syncQueue: 'id, table, timestamp'
    });
  }
}

// 싱글톤 인스턴스
export const db = new BibleStudyDatabase();

// ============================================
// Verses 캐싱
// ============================================

export async function cacheVerse(verse: Verse): Promise<void> {
  await db.verses.put({
    id: verse.id,
    data: verse,
    cachedAt: Date.now()
  });
}

export async function getCachedVerse(id: string): Promise<Verse | undefined> {
  const cached = await db.verses.get(id);
  if (!cached) return undefined;

  // 7일 이상 오래된 캐시는 무효화
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - cached.cachedAt > sevenDays) {
    await db.verses.delete(id);
    return undefined;
  }

  return cached.data;
}

export async function cacheVerses(verses: Verse[]): Promise<void> {
  const cachedVerses = verses.map(verse => ({
    id: verse.id,
    data: verse,
    cachedAt: Date.now()
  }));
  await db.verses.bulkPut(cachedVerses);
}

// ============================================
// User Progress 오프라인 저장
// ============================================

export async function saveOfflineProgress(progress: OfflineUserProgress): Promise<void> {
  await db.userProgress.put({
    ...progress,
    synced: false,
    updated_at: new Date().toISOString()
  });
}

export async function getOfflineProgress(userId: string, verseId: string): Promise<OfflineUserProgress | undefined> {
  return await db.userProgress
    .where('[user_id+verse_id]')
    .equals([userId, verseId])
    .first();
}

export async function getUnsyncedProgress(userId: string): Promise<OfflineUserProgress[]> {
  return await db.userProgress
    .where('user_id')
    .equals(userId)
    .and(item => !item.synced)
    .toArray();
}

export async function markProgressSynced(id: string): Promise<void> {
  await db.userProgress.update(id, { synced: true });
}

// ============================================
// Sync Queue 관리
// ============================================

export async function addToSyncQueue(
  table: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  data: unknown
): Promise<void> {
  const item: SyncQueueItem = {
    id: crypto.randomUUID(),
    table,
    operation,
    data,
    timestamp: Date.now(),
    retries: 0
  };

  await db.syncQueue.add(item);
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  return await db.syncQueue.orderBy('timestamp').toArray();
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  await db.syncQueue.delete(id);
}

export async function incrementSyncRetry(id: string): Promise<void> {
  const item = await db.syncQueue.get(id);
  if (item) {
    await db.syncQueue.update(id, { retries: item.retries + 1 });
  }
}

export async function clearSyncQueue(): Promise<void> {
  await db.syncQueue.clear();
}

// ============================================
// 캐시 정리
// ============================================

export async function clearOldCache(): Promise<void> {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  // 오래된 구절 캐시 삭제
  const oldVerses = await db.verses
    .where('cachedAt')
    .below(sevenDaysAgo)
    .toArray();

  for (const verse of oldVerses) {
    await db.verses.delete(verse.id);
  }

  // 오래된 단어 캐시 삭제
  const oldWords = await db.words
    .where('cachedAt')
    .below(sevenDaysAgo)
    .toArray();

  for (const word of oldWords) {
    await db.words.delete(word.id);
  }

  console.log(`Cleared ${oldVerses.length + oldWords.length} old cache entries`);
}

// ============================================
// 데이터베이스 상태 확인
// ============================================

export async function getDatabaseStats() {
  const versesCount = await db.verses.count();
  const wordsCount = await db.words.count();
  const progressCount = await db.userProgress.count();
  const queueCount = await db.syncQueue.count();

  return {
    verses: versesCount,
    words: wordsCount,
    userProgress: progressCount,
    syncQueue: queueCount
  };
}
