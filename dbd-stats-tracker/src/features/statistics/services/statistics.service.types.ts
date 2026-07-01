import type { CharacterId } from "../../../shared/types/dbd-entities.types";
import type {
  KillerStatistics,
  OverallStatistics,
  StatisticsFilters,
  SurvivorStatistics,
} from "../types/statistics.types";

export interface StatisticsService {
  getKillerStatistics: (
    characterId: CharacterId,
    filters?: StatisticsFilters,
  ) => Promise<KillerStatistics>;
  getSurvivorStatistics: (
    characterId: CharacterId,
    filters?: StatisticsFilters,
  ) => Promise<SurvivorStatistics>;
  getAllKillerStatistics: (
    filters?: StatisticsFilters,
  ) => Promise<KillerStatistics[]>;
  getAllSurvivorStatistics: (
    filters?: StatisticsFilters,
  ) => Promise<SurvivorStatistics[]>;
  getOverallStatistics: (filters?: StatisticsFilters) => Promise<OverallStatistics>;
}
