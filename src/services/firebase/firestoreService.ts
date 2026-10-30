import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../../../firebase/config/firebaseConfig';
import { Lobby, Question, Score, LeaderboardEntry } from '../../types';
import { mockLobby, mockLeaderboard, mockQuestions } from '../../data/mockData';

export class FirestoreService {
  static async getLobbyByCode(code: string): Promise<Lobby | null> {
    if (db) {
      try {
        const lobbiesRef = collection(db, 'lobbies');
        const q = query(lobbiesRef, where('code', '==', code.trim()), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs[0].data() as Lobby;
        }
        return null;
      } catch (e) {
        console.warn('[FirestoreService] getLobbyByCode error:', e);
      }
    }

    // Mock fallback
    if (code.replace(/\s/g, '') === mockLobby.code || code.length >= 4) {
      return mockLobby;
    }
    return null;
  }

  static async createLobby(lobby: Omit<Lobby, 'lobbyId' | 'createdAt'>): Promise<Lobby> {
    const lobbyId = `lobby-${Date.now()}`;
    const newLobby: Lobby = {
      ...lobby,
      lobbyId,
      createdAt: Date.now(),
    };

    if (db) {
      try {
        await setDoc(doc(db, 'lobbies', lobbyId), newLobby);
        return newLobby;
      } catch (e) {
        console.warn('[FirestoreService] createLobby error:', e);
      }
    }

    return newLobby;
  }

  static async updateLobbyStatus(lobbyId: string, status: Lobby['status']): Promise<void> {
    if (db) {
      try {
        await updateDoc(doc(db, 'lobbies', lobbyId), { status });
      } catch (e) {
        console.warn('[FirestoreService] updateLobbyStatus error:', e);
      }
    }
  }

  static async getLeaderboard(lobbyId: string): Promise<LeaderboardEntry[]> {
    if (db) {
      try {
        const scoresRef = collection(db, 'lobbies', lobbyId, 'scores');
        const q = query(scoresRef, orderBy('score', 'desc'), limit(50));
        const snap = await getDocs(q);
        return snap.docs.map((d, index) => {
          const data = d.data() as Score;
          return {
            rank: index + 1,
            studentId: data.studentId,
            name: data.studentName,
            score: data.score,
            accuracy: data.accuracy,
            streak: data.streak,
          };
        });
      } catch (e) {
        console.warn('[FirestoreService] getLeaderboard error:', e);
      }
    }

    return mockLeaderboard;
  }

  static async saveScore(score: Score): Promise<void> {
    if (db) {
      try {
        await setDoc(doc(db, 'lobbies', score.lobbyId, 'scores', score.studentId), score);
      } catch (e) {
        console.warn('[FirestoreService] saveScore error:', e);
      }
    }
  }

  static async getQuestionBank(topic?: string): Promise<Question[]> {
    return mockQuestions;
  }
}
