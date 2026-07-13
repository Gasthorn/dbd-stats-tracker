import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFriendsStore } from "../stores/friends.store";
import "./friends.css";

/** Shown once per login if there are unseen incoming friend requests. Mounted unconditionally in Dashboard. */
export function FriendRequestPopup() {
  const { t } = useTranslation();
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
              ? t("friends.popupTitleOne")
              : t("friends.popupTitleMany", { count: unseenIncoming.length })}
          </h3>
          <button type="button" className="friends-popup-close" onClick={handleClose} aria-label={t("common.close")}>
            ✕
          </button>
        </div>
        {unseenIncoming.map((friendship) => (
          <div key={friendship.id} className="friends-popup-request">
            <span>{friendship.friendUsername}</span>
            <div className="friends-popup-request-actions">
              <button type="button" onClick={() => respondToRequest(friendship.id, true)}>
                {t("friends.accept")}
              </button>
              <button type="button" className="btn-secondary" onClick={() => respondToRequest(friendship.id, false)}>
                {t("friends.decline")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
