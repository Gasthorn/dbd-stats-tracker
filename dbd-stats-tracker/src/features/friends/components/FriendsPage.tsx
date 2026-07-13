import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { isOnline } from "../lib/presence";
import { useFriendsStore } from "../stores/friends.store";
import type { Friendship } from "../types/friend.types";
import "./friends.css";

/** How often the online/offline dots re-check freshness, independent of any refetch. */
const PRESENCE_TICK_MS = 30_000;

export function FriendsPage() {
  const { t } = useTranslation();
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
      setFormError(t("friends.usernameRequired"));
      return;
    }

    setIsSending(true);
    try {
      await sendRequestByUsername(username.trim());
      setSuccessMessage(t("friends.requestSent", { username: username.trim() }));
      setUsername("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("friends.sendFailed"));
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
      <h1>{t("friends.title")}</h1>
      <p className="friends-hint">{t("friends.hint")}</p>

      <div className="friends-search-form">
        <h3>{t("friends.addTitle")}</h3>
        <div className="friends-search-row">
          <input
            type="text"
            placeholder={t("friends.usernamePlaceholder")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="button" onClick={handleSendRequest} disabled={isSending}>
            {isSending ? t("friends.sendPending") : t("friends.sendRequest")}
          </button>
        </div>
        {formError && <p className="match-error">{formError}</p>}
        {storeError && <p className="match-error">{storeError}</p>}
        {successMessage && <p className="match-success">{successMessage}</p>}
      </div>

      {status === "loading" && friendships.length === 0 && <LoadingSpinner />}

      {incoming.length > 0 && (
        <div className="friends-section">
          <h3>{t("friends.incomingTitle")}</h3>
          <div className="friends-list">
            {incoming.map((friendship) =>
              renderFriendCard(
                friendship,
                <>
                  <button type="button" onClick={() => respondToRequest(friendship.id, true)}>
                    {t("friends.accept")}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => respondToRequest(friendship.id, false)}
                  >
                    {t("friends.decline")}
                  </button>
                </>,
              ),
            )}
          </div>
        </div>
      )}

      {outgoing.length > 0 && (
        <div className="friends-section">
          <h3>{t("friends.outgoingTitle")}</h3>
          <div className="friends-list">
            {outgoing.map((friendship) =>
              renderFriendCard(
                friendship,
                <button type="button" className="btn-secondary" onClick={() => removeFriendship(friendship.id)}>
                  {t("friends.cancelRequest")}
                </button>,
              ),
            )}
          </div>
        </div>
      )}

      <div className="friends-section">
        <h3>{t("friends.myFriendsTitle")}</h3>
        {status !== "loading" && accepted.length === 0 && (
          <p className="statistics-empty">{t("friends.empty")}</p>
        )}
        {accepted.length > 0 && (
          <div className="friends-list">
            {accepted.map((friendship) => (
              <div key={friendship.id} className="friends-card">
                <div className="friends-card-name">
                  <span
                    className={`friend-status-dot ${isOnline(friendship.friendLastSeenAt) ? "is-online" : "is-offline"}`}
                    title={isOnline(friendship.friendLastSeenAt) ? t("friends.online") : t("friends.offline")}
                  />
                  {friendship.friendUsername}
                </div>
                <div className="friends-card-actions">
                  <button type="button" className="btn-secondary" onClick={() => removeFriendship(friendship.id)}>
                    {t("friends.remove")}
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
