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
export type MatchModeEnum = "normal" | "hardcore" | "gauntlet";
export type EscapeResultEnum =
  | "escaped_door"
  | "escaped_hatch"
  | "sacrificed"
  | "killed"
  | "disconnected";

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

export type MatchRow = {
  id: string;
  user_id: string;
  hardcore_run_id: string | null;
  role: MatchRoleEnum;
  mode: MatchModeEnum;
  character_name: string;
  opponent_name: string | null;
  perks: string[];
  equipment: string[];
  bloodpoints: number;
  kills: number | null;
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
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      match_role: MatchRoleEnum;
      match_mode: MatchModeEnum;
      escape_result: EscapeResultEnum;
    };
    CompositeTypes: Record<string, never>;
  };
}
