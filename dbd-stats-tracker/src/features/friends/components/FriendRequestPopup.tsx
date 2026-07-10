import { useEffect, useMemo } from "react";
import { useFriendsStore } from "../stores/friends.store";
import "./friends.css";

/** Shown once per login if there are unseen incoming friend requests. Mounted unconditionally in Dashboard. */
export function FriendRequestPopup() {
  const friendships = useFriendsStore((state) => state.friendships);
  const status = useFriendsStore((state) => state.status);
  const fetchFriendships = useFriendsStore((state) => state.fetchFriendships);
  const respondToRequest = useFriendsStore((state) => state.respondToRequest);
  const markRequestsSeen = useFriendsStore((state) => state.markRequestsSeen);

  useEffect(() => {
    fetchFriendships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unseenIncoming = useMemo(
    () => friendships.filter((f) => f.status === "pending" && !f.isRequester && !f.seen),
    [friendships],
  );

  if (status !== "success" || unseenIncoming.length === 0) return null;

  function handleClose() {
    markRequestsSeen(unseenIncoming.map((f) => f.id));
  }

  return (
    <div className="friends-popup-overlay" onClick={handleClose}>
      <div className="friends-popup-modal" onClick={(event) => event.stopPropagation()}>
        <div className="friends-popup-header">
          <h3>
            {unseenIncoming.length === 1
              ? "Nouvelle demande d'ami"
              : `${unseenIncoming.length} nouvelles demandes d'ami`}
          </h3>
          <button type="button" className="friends-popup-close" onClick={handleClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        {unseenIncoming.map((friendship) => (
          <div key={friendship.id} className="friends-popup-request">
            <span>{friendship.friendUsername}</span>
            <div className="friends-popup-request-actions">
              <button type="button" onClick={() => respondToRequest(friendship.id, true)}>
                Accepter
              </button>
              <button type="button" className="btn-secondary" onClick={() => respondToRequest(friendship.id, false)}>
                Refuser
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
