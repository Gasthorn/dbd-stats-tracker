/**
 * Hand-authored equivalent of `supabase gen types typescript` for the
 * schema defined in supabase/migrations/20260701000000_init_schema.sql.
 *
 * Character/perk/equipment names are plain text, not foreign keys: the
 * game roster is static reference data shipped with the app, not stored
 * in Postgres. Column names use snake_case to match Postgres; domain
 * types under `features/*` use camelCase and are mapped to/from these
 * shapes in the service layer.
 */
export type MatchRoleEnum = "killer" | "survivor";
export type MatchModeEnum = "normal" | "hardcore" | "gauntlet" | "world_cup";
export type EscapeResultEnum =
  | "escaped_door"
  | "escaped_hatch"
  | "sacrificed"
  | "killed"
  | "disconnected";
export type WorldCupStatusEnum = "group_stage" | "knockout" | "completed";
export type WorldCupRoundEnum =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "final";
export type WorldCupKnockoutRoundEnum = Exclude<WorldCupRoundEnum, "group">;
export type FriendshipStatusEnum = "pending" | "accepted";

export type UserRow = {
  id: string;
  username: string;
  avatar_url: string | null;
  unlocked_killers: string[];
  unlocked_survivors: string[];
  icons_folder_path: string | null;
  created_at: string;
  updated_at: string;
};
export type UserInsert = Pick<UserRow, "id" | "username"> &
  Partial<Omit<UserRow, "id" | "username">>;
export type UserUpdate = Partial<UserInsert>;

export type HardcoreRunRow = {
  id: string;
  user_id: string;
  season_id: string;
  killer_pips: number;
  survivor_pips: number;
  dead_killers: string[];
  dead_survivors: string[];
  started_at: string;
  ended_at: string | null;
  updated_at: string;
};
export type HardcoreRunInsert = Pick<HardcoreRunRow, "user_id" | "season_id"> &
  Partial<Omit<HardcoreRunRow, "id" | "user_id" | "season_id">>;
export type HardcoreRunUpdate = Partial<HardcoreRunInsert>;

export type GauntletProgressRow = {
  id: string;
  user_id: string;
  role: MatchRoleEnum;
  completed_characters: string[];
  current_character: string | null;
  character_queue: string[];
  updated_at: string;
};
export type GauntletProgressInsert = Pick<GauntletProgressRow, "user_id" | "role"> &
  Partial<Omit<GauntletProgressRow, "id" | "user_id" | "role">>;
export type GauntletProgressUpdate = Partial<GauntletProgressInsert>;

export type BuildRow = {
  id: string;
  user_id: string;
  name: string;
  role: MatchRoleEnum;
  character_name: string;
  perks: string[];
  equipment: string[];
  created_at: string;
  updated_at: string;
};
export type BuildInsert = Pick<BuildRow, "user_id" | "name" | "role" | "character_name"> &
  Partial<Omit<BuildRow, "id" | "user_id" | "name" | "role" | "character_name">>;
export type BuildUpdate = Partial<BuildInsert>;

export type TeamRow = {
  id: string;
  user_id: string;
  name: string;
  member_names: string[];
  created_at: string;
  updated_at: string;
};
export type TeamInsert = Pick<TeamRow, "user_id" | "name"> &
  Partial<Omit<TeamRow, "id" | "user_id" | "name">>;
export type TeamUpdate = Partial<TeamInsert>;

export type FriendshipRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatusEnum;
  seen: boolean;
  created_at: string;
  responded_at: string | null;
};
export type FriendshipInsert = Pick<FriendshipRow, "requester_id" | "addressee_id"> &
  Partial<Omit<FriendshipRow, "id" | "requester_id" | "addressee_id">>;
export type FriendshipUpdate = Partial<FriendshipInsert>;

export type UserPresenceRow = {
  user_id: string;
  last_seen_at: string;
};
export type UserPresenceInsert = Pick<UserPresenceRow, "user_id"> &
  Partial<Omit<UserPresenceRow, "user_id">>;
export type UserPresenceUpdate = Partial<UserPresenceInsert>;

export type MatchRow = {
  id: string;
  user_id: string;
  hardcore_run_id: string | null;
  role: MatchRoleEnum;
  mode: MatchModeEnum;
  character_name: string;
  opponent_name: string | null;
  team_id: string | null;
  perks: string[];
  equipment: string[];
  bloodpoints: number;
  kills: number | null;
  hooks: number | null;
  generators_completed: number;
  escape_result: EscapeResultEnum | null;
  hardcore_pips: number | null;
  hardcore_died: boolean | null;
  ignore_challenge: boolean;
  played_at: string;
  created_at: string;
  updated_at: string;
};
export type MatchInsert = Pick<MatchRow, "user_id" | "role" | "character_name"> &
  Partial<Omit<MatchRow, "id" | "user_id" | "role" | "character_name">>;
export type MatchUpdate = Partial<MatchInsert>;

export type WorldCupRunRow = {
  id: string;
  user_id: string;
  status: WorldCupStatusEnum;
  current_round: WorldCupKnockoutRoundEnum | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};
export type WorldCupRunInsert = Pick<WorldCupRunRow, "user_id"> &
  Partial<Omit<WorldCupRunRow, "id" | "user_id">>;
export type WorldCupRunUpdate = Partial<WorldCupRunInsert>;

export type WorldCupGroupRow = {
  id: string;
  run_id: string;
  user_id: string;
  group_index: number;
  killers: string[];
};
export type WorldCupGroupInsert = Pick<WorldCupGroupRow, "run_id" | "user_id" | "group_index" | "killers"> &
  Partial<Omit<WorldCupGroupRow, "id" | "run_id" | "user_id" | "group_index" | "killers">>;
export type WorldCupGroupUpdate = Partial<WorldCupGroupInsert>;

export type WorldCupFixtureRow = {
  id: string;
  run_id: string;
  user_id: string;
  group_id: string | null;
  round: WorldCupRoundEnum;
  slot_index: number;
  killer_a: string;
  killer_b: string;
  killer_a_match_id: string | null;
  killer_b_match_id: string | null;
  winner: "a" | "b" | "draw" | null;
  created_at: string;
  updated_at: string;
};
export type WorldCupFixtureInsert = Pick<
  WorldCupFixtureRow,
  "run_id" | "user_id" | "round" | "slot_index" | "killer_a" | "killer_b"
> &
  Partial<
    Omit<WorldCupFixtureRow, "id" | "run_id" | "user_id" | "round" | "slot_index" | "killer_a" | "killer_b">
  >;
export type WorldCupFixtureUpdate = Partial<WorldCupFixtureInsert>;

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
        Relationships: [];
      };
      hardcore_runs: {
        Row: HardcoreRunRow;
        Insert: HardcoreRunInsert;
        Update: HardcoreRunUpdate;
        Relationships: [
          {
            foreignKeyName: "hardcore_runs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      gauntlet_progress: {
        Row: GauntletProgressRow;
        Insert: GauntletProgressInsert;
        Update: GauntletProgressUpdate;
        Relationships: [
          {
            foreignKeyName: "gauntlet_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      builds: {
        Row: BuildRow;
        Insert: BuildInsert;
        Update: BuildUpdate;
        Relationships: [
          {
            foreignKeyName: "builds_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: TeamRow;
        Insert: TeamInsert;
        Update: TeamUpdate;
        Relationships: [
          {
            foreignKeyName: "teams_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      friendships: {
        Row: FriendshipRow;
        Insert: FriendshipInsert;
        Update: FriendshipUpdate;
        Relationships: [
          {
            foreignKeyName: "friendships_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friendships_addressee_id_fkey";
            columns: ["addressee_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_presence: {
        Row: UserPresenceRow;
        Insert: UserPresenceInsert;
        Update: UserPresenceUpdate;
        Relationships: [
          {
            foreignKeyName: "user_presence_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: MatchRow;
        Insert: MatchInsert;
        Update: MatchUpdate;
        Relationships: [
          {
            foreignKeyName: "matches_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_hardcore_run_id_fkey";
            columns: ["hardcore_run_id"];
            isOneToOne: false;
            referencedRelation: "hardcore_runs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      world_cup_runs: {
        Row: WorldCupRunRow;
        Insert: WorldCupRunInsert;
        Update: WorldCupRunUpdate;
        Relationships: [
          {
            foreignKeyName: "world_cup_runs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      world_cup_groups: {
        Row: WorldCupGroupRow;
        Insert: WorldCupGroupInsert;
        Update: WorldCupGroupUpdate;
        Relationships: [
          {
            foreignKeyName: "world_cup_groups_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "world_cup_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      world_cup_fixtures: {
        Row: WorldCupFixtureRow;
        Insert: WorldCupFixtureInsert;
        Update: WorldCupFixtureUpdate;
        Relationships: [
          {
            foreignKeyName: "world_cup_fixtures_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "world_cup_runs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "world_cup_fixtures_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "world_cup_groups";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      find_user_by_username: {
        Args: { p_username: string };
        Returns: { id: string; username: string; avatar_url: string | null }[];
      };
      list_friendships: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          status: FriendshipStatusEnum;
          seen: boolean;
          created_at: string;
          responded_at: string | null;
          is_requester: boolean;
          friend_id: string;
          friend_username: string;
          friend_avatar_url: string | null;
          friend_last_seen_at: string | null;
        }[];
      };
    };
    Enums: {
      match_role: MatchRoleEnum;
      match_mode: MatchModeEnum;
      escape_result: EscapeResultEnum;
    };
    CompositeTypes: Record<string, never>;
  };
}
