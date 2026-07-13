import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getHardcoreSeasonId } from "../../../shared/lib/hardcore/rank";
import { useFriendsStore } from "../../friends";
import { useHardcoreTeamStore } from "../stores/hardcore-team.store";
import "./hardcore-teams.css";

export function HardcoreTeamPanel() {
  const { t } = useTranslation();
  const members = useHardcoreTeamStore((state) => state.members);
  const status = useHardcoreTeamStore((state) => state.status);
  const storeError = useHardcoreTeamStore((state) => state.error);
  const fetchMyTeam = useHardcoreTeamStore((state) => state.fetchMyTeam);
  const createTeam = useHardcoreTeamStore((state) => state.createTeam);
  const inviteFriend = useHardcoreTeamStore((state) => state.inviteFriend);
  const acceptInvite = useHardcoreTeamStore((state) => state.acceptInvite);
  const leaveOrDecline = useHardcoreTeamStore((state) => state.leaveOrDecline);

  const friendships = useFriendsStore((state) => state.friendships);
  const fetchFriendships = useFriendsStore((state) => state.fetchFriendships);

  const seasonId = useMemo(() => getHardcoreSeasonId(), []);

  const [selectedFriendId, setSelectedFriendId] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMyTeam(seasonId);
  }, [fetchMyTeam, seasonId]);

  useEffect(() => {
    fetchFriendships();
  }, [fetchFriendships]);

  const myMembership = members.find((m) => m.isSelf && m.status === "accepted");
  const pendingInvites = members.filter((m) => m.isSelf && m.status === "pending");
  const roster = myMembership ? members.filter((m) => m.teamId === myMembership.teamId) : [];
  const acceptedFriends = friendships.filter((f) => f.status === "accepted");
  const invitableFriends = acceptedFriends.filter(
    (f) => !roster.some((m) => m.memberUserId === f.friendId),
  );

  async function handleCreateTeam() {
    setFormError(null);
    setSuccessMessage(null);
    setIsBusy(true);
    try {
      await createTeam(seasonId);
      setSuccessMessage(t("hardcoreTeam.created"));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("hardcoreTeam.createFailed"));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleInvite() {
    if (!myMembership || !selectedFriendId) return;
    setFormError(null);
    setSuccessMessage(null);
    setIsBusy(true);
    try {
      await inviteFriend(myMembership.teamId, selectedFriendId, seasonId);
      setSuccessMessage(t("hardcoreTeam.inviteSent"));
      setSelectedFriendId("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("hardcoreTeam.inviteFailed"));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleAccept(memberId: string) {
    setFormError(null);
    setSuccessMessage(null);
    try {
      await acceptInvite(memberId, seasonId);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("hardcoreTeam.acceptFailed"));
    }
  }

  async function handleDecline(memberId: string) {
    setFormError(null);
    setSuccessMessage(null);
    try {
      await leaveOrDecline(memberId, seasonId);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("hardcoreTeam.genericError"));
    }
  }

  async function handleLeave() {
    if (!myMembership) return;
    if (!confirm(t("hardcoreTeam.leaveConfirm"))) return;
    await handleDecline(myMembership.memberId);
  }

  return (
    <div className="hardcore-team-panel">
      <h3>{t("hardcoreTeam.title")}</h3>
      <p className="hardcore-team-hint">{t("hardcoreTeam.hint")}</p>

      {status === "loading" && members.length === 0 && <LoadingSpinner />}
      {storeError && <p className="match-error">{storeError}</p>}
      {formError && <p className="match-error">{formError}</p>}
      {successMessage && <p className="match-success">{successMessage}</p>}

      {pendingInvites.length > 0 && (
        <div className="hardcore-team-invites">
          <h4>{t("hardcoreTeam.invitesTitle")}</h4>
          {pendingInvites.map((invite) => {
            const inviter = members.find(
              (m) => m.teamId === invite.teamId && m.memberUserId === invite.invitedBy,
            );
            return (
              <div key={invite.memberId} className="hardcore-team-invite-row">
                <span>{inviter ? t("hardcoreTeam.invitationFrom", { name: inviter.memberUsername }) : t("hardcoreTeam.invitationFromFallback")}</span>
                <div className="hardcore-team-invite-actions">
                  <button type="button" onClick={() => handleAccept(invite.memberId)} disabled={isBusy}>
                    {t("hardcoreTeam.accept")}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleDecline(invite.memberId)}
                    disabled={isBusy}
                  >
                    {t("hardcoreTeam.decline")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!myMembership && (
        <button type="button" onClick={handleCreateTeam} disabled={isBusy}>
          {t("hardcoreTeam.createTeam")}
        </button>
      )}

      {myMembership && (
        <div className="hardcore-team-roster">
          <h4>{t("hardcoreTeam.myTeam")}</h4>
          <ul className="hardcore-team-member-list">
            {roster.map((member) => (
              <li key={member.memberId}>
                {member.memberUsername}
                {member.status === "pending" && <span className="hardcore-team-pending-badge">{t("hardcoreTeam.pendingBadge")}</span>}
              </li>
            ))}
          </ul>

          <div className="hardcore-team-dead-pool">
            <strong>{t("hardcoreTeam.deadPool", { count: myMembership.teamDeadSurvivors.length })}</strong>
            {myMembership.teamDeadSurvivors.length > 0 && (
              <ul className="hardcore-team-member-list">
                {myMembership.teamDeadSurvivors.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="hardcore-team-invite-form">
            <select value={selectedFriendId} onChange={(e) => setSelectedFriendId(e.target.value)}>
              <option value="">{t("hardcoreTeam.chooseFriend")}</option>
              {invitableFriends.map((friend) => (
                <option key={friend.friendId} value={friend.friendId}>
                  {friend.friendUsername}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleInvite} disabled={isBusy || !selectedFriendId}>
              {t("hardcoreTeam.invite")}
            </button>
          </div>

          <button type="button" className="btn-secondary" onClick={handleLeave} disabled={isBusy}>
            {t("hardcoreTeam.leaveTeam")}
          </button>
        </div>
      )}
    </div>
  );
}
