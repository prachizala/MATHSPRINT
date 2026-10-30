import { useState, useEffect } from 'react';
import { Participant, Lobby } from '../types';
import { RealtimeService } from '../services/firebase/realtimeService';
import { FirestoreService } from '../services/firebase/firestoreService';

export const useRealtimeLobby = (lobbyCode: string, currentParticipant?: Participant) => {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cleanupPresence: (() => void) | undefined;
    let isMounted = true;

    const init = async () => {
      try {
        setIsLoading(true);
        const fetched = await FirestoreService.getLobbyByCode(lobbyCode);
        if (!isMounted) return;

        if (!fetched) {
          setError('Lobby not found. Please check your 6-digit code.');
          return;
        }

        setLobby(fetched);

        if (currentParticipant) {
          cleanupPresence = RealtimeService.joinLobbyRoom(
            fetched.lobbyId,
            currentParticipant,
            (updatedList) => {
              if (isMounted) setParticipants(updatedList);
            }
          );
        }
      } catch (e: any) {
        if (isMounted) setError(e.message || 'Failed to connect to lobby');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (lobbyCode) {
      init();
    }

    return () => {
      isMounted = false;
      cleanupPresence?.();
    };
  }, [lobbyCode, currentParticipant]);

  return {
    lobby,
    participants: Object.values(participants),
    participantCount: Object.keys(participants).length,
    isLoading,
    error,
  };
};
