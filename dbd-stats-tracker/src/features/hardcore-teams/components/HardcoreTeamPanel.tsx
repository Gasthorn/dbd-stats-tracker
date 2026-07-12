import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect, useMemo, useState } from "react";
import { getHardcoreSeasonId } from "../../../shared/lib/hardcore/rank";
import { useFriendsStore } from "../../friends";
import { useHardcoreTeamStore } from "../stores/hardcore-team.store";
import "./hardcore-teams.css";

export function HardcoreTeamPanel() {
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
      setSuccessMessage("Équipe Hardcore créée !");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible de créer l'équipe.");
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
      setSuccessMessage("Invitation envoyée !");
      setSelectedFriendId("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible d'inviter cet ami.");
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
      setFormError(err instanceof Error ? err.message : "Impossible d'accepter l'invitation.");
    }
  }

  async function handleDecline(memberId: string) {
    setFormError(null);
    setSuccessMessage(null);
    try {
      await leaveOrDecline(memberId, seasonId);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  async function handleLeave() {
    if (!myMembership) return;
    if (!confirm("Voulez-vous vraiment quitter cette équipe Hardcore ?")) return;
    await handleDecline(myMembership.memberId);
  }

  return (
    <div className="hardcore-team-panel">
      <h3>Hardcore Équipe</h3>
      <p className="hardcore-team-hint">
        Forme une équipe avec des amis : si le survivant de l'un de vous meurt, il devient indisponible pour
        toute l'équipe. Vos points/rang personnels ne sont pas affectés par les parties des autres.
      </p>

      {status === "loading" && members.length === 0 && <LoadingSpinner />}
      {storeError && <p className="match-error">{storeError}</p>}
      {formError && <p className="match-error">{formError}</p>}
      {successMessage && <p className="match-success">{successMessage}</p>}

      {pendingInvites.length > 0 && (
        <div className="hardcore-team-invites">
          <h4>Invitations reçues</h4>
          {pendingInvites.map((invite) => {
            const inviter = members.find(
              (m) => m.teamId === invite.teamId && m.memberUserId === invite.invitedBy,
            );
            return (
              <div key={invite.memberId} className="hardcore-team-invite-row">
                <span>Invitation de {inviter?.memberUsername ?? "un ami"}</span>
                <div className="hardcore-team-invite-actions">
                  <button type="button" onClick={() => handleAccept(invite.memberId)} disabled={isBusy}>
                    Accepter
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleDecline(invite.memberId)}
                    disabled={isBusy}
                  >
                    Refuser
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!myMembership && (
        <button type="button" onClick={handleCreateTeam} disabled={isBusy}>
          Créer une équipe Hardcore
        </button>
      )}

      {myMembership && (
        <div className="hardcore-team-roster">
          <h4>Mon équipe</h4>
          <ul className="hardcore-team-member-list">
            {roster.map((member) => (
              <li key={member.memberId}>
                {member.memberUsername}
                {member.status === "pending" && <span className="hardcore-team-pending-badge"> (invitation envoyée)</span>}
              </li>
            ))}
          </ul>

          <div className="hardcore-team-dead-pool">
            <strong>Survivants morts pour l'équipe ({myMembership.teamDeadSurvivors.length})</strong>
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
              <option value="">-- Choisir un ami --</option>
              {invitableFriends.map((friend) => (
                <option key={friend.friendId} value={friend.friendId}>
                  {friend.friendUsername}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleInvite} disabled={isBusy || !selectedFriendId}>
              Inviter
            </button>
          </div>

          <button type="button" className="btn-secondary" onClick={handleLeave} disabled={isBusy}>
            Quitter l'équipe
          </button>
        </div>
      )}
    </div>
  );
}
