import type { ISODateString, UUID } from "../../../shared/types/common.types";
import type {
  CharacterId,
  CharacterRole,
} from "../../../shared/types/dbd-entities.types";

export interface KillerStatistics {
  characterId: CharacterId;
  matchesPlayed: number;
  totalKills: number;
  averageKillsPerMatch: number;
  escapesAgainst: number;
  killRatePercent: number;
  mostUsedPerkIds: UUID[];
  mostPlayedMapId: UUID | null;
  currentRating: number | null;
  peakRating: number | null;
}

export interface SurvivorStatistics {
  characterId: CharacterId;
  matchesPlayed: number;
  escapes: number;
  deaths: number;
  escapeRatePercent: number;
  averageHooksTaken: number;
  mostUsedPerkIds: UUID[];
  currentRating: number | null;
  peakRating: number | null;
}

export interface OverallStatistics {
  totalMatches: number;
  totalPlaytimeSeconds: number;
  killerMatches: number;
  survivorMatches: number;
  overallEscapeRatePercent: number;
  overallKillRatePercent: number;
  mostPlayedKillerId: CharacterId | null;
  mostPlayedSurvivorId: CharacterId | null;
}

export interface StatisticsFilters {
  role?: CharacterRole;
  characterId?: CharacterId;
  dateFrom?: ISODateString;
  dateTo?: ISODateString;
}
