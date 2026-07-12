import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect, useMemo, useState } from "react";
import { isOnline } from "../lib/presence";
import { useFriendsStore } from "../stores/friends.store";
import type { Friendship } from "../types/friend.types";
import "./friends.css";

/** How often the online/offline dots re-check freshness, independent of any refetch. */
const PRESENCE_TICK_MS = 30_000;

export function FriendsPage() {
  const friendships = useFriendsStore((state) => state.friendships);
  const status = useFriendsStore((state) => state.status);
  const storeError = useFriendsStore((state) => state.error);
  const fetchFriendships = useFriendsStore((state) => state.fetchFriendships);
  const sendRequestByUsername = useFriendsStore((state) => state.sendRequestByUsername);
  const respondToRequest = useFriendsStore((state) => state.respondToRequest);
  const removeFriendship = useFriendsStore((state) => state.removeFriendship);

  const [username, setUsername] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [, setPresenceTick] = useState(0);

  useEffect(() => {
    fetchFriendships();
  }, [fetchFriendships]);

  useEffect(() => {
    const interval = setInterval(() => setPresenceTick((tick) => tick + 1), PRESENCE_TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const incoming = useMemo(
    () => friendships.filter((f) => f.status === "pending" && !f.isRequester),
    [friendships],
  );
  const outgoing = useMemo(
    () => friendships.filter((f) => f.status === "pending" && f.isRequester),
    [friendships],
  );
  const accepted = useMemo(() => friendships.filter((f) => f.status === "accepted"), [friendships]);

  async function handleSendRequest() {
    setFormError(null);
    setSuccessMessage(null);
    if (!username.trim()) {
      setFormError("Entrez un nom d'utilisateur.");
      return;
    }

    setIsSending(true);
    try {
      await sendRequestByUsername(username.trim());
      setSuccessMessage(`Demande envoyée à ${username.trim()} !`);
      setUsername("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible d'envoyer la demande.");
    } finally {
      setIsSending(false);
    }
  }

  function renderFriendCard(friendship: Friendship, actions: React.ReactNode) {
    return (
      <div key={friendship.id} className="friends-card">
        <div className="friends-card-name">{friendship.friendUsername}</div>
        <div className="friends-card-actions">{actions}</div>
      </div>
    );
  }

  return (
    <div className="friends-page">
      <h1>Amis</h1>
      <p className="friends-hint">Ajoute des amis par leur nom d'utilisateur et retrouve-les ici.</p>

      <div className="friends-search-form">
        <h3>Ajouter un ami</h3>
        <div className="friends-search-row">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="button" onClick={handleSendRequest} disabled={isSending}>
            {isSending ? "Envoi..." : "Envoyer une demande"}
          </button>
        </div>
        {formError && <p className="match-error">{formError}</p>}
        {storeError && <p className="match-error">{storeError}</p>}
        {successMessage && <p className="match-success">{successMessage}</p>}
      </div>

      {status === "loading" && friendships.length === 0 && <LoadingSpinner />}

      {incoming.length > 0 && (
        <div className="friends-section">
          <h3>Demandes reçues</h3>
          <div className="friends-list">
            {incoming.map((friendship) =>
              renderFriendCard(
                friendship,
                <>
                  <button type="button" onClick={() => respondToRequest(friendship.id, true)}>
                    Accepter
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => respondToRequest(friendship.id, false)}
                  >
                    Refuser
                  </button>
                </>,
              ),
            )}
          </div>
        </div>
      )}

      {outgoing.length > 0 && (
        <div className="friends-section">
          <h3>Demandes envoyées</h3>
          <div className="friends-list">
            {outgoing.map((friendship) =>
              renderFriendCard(
                friendship,
                <button type="button" className="btn-secondary" onClick={() => removeFriendship(friendship.id)}>
                  Annuler
                </button>,
              ),
            )}
          </div>
        </div>
      )}

      <div className="friends-section">
        <h3>Mes amis</h3>
        {status !== "loading" && accepted.length === 0 && (
          <p className="statistics-empty">Aucun ami pour le moment.</p>
        )}
        {accepted.length > 0 && (
          <div className="friends-list">
            {accepted.map((friendship) => (
              <div key={friendship.id} className="friends-card">
                <div className="friends-card-name">
                  <span
                    className={`friend-status-dot ${isOnline(friendship.friendLastSeenAt) ? "is-online" : "is-offline"}`}
                    title={isOnline(friendship.friendLastSeenAt) ? "En ligne" : "Hors ligne"}
                  />
                  {friendship.friendUsername}
                </div>
                <div className="friends-card-actions">
                  <button type="button" className="btn-secondary" onClick={() => removeFriendship(friendship.id)}>
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
