export type UUID = string;
export type ISODateString = string;

export type Nullable<T> = T | null;

export type SortDirection = "asc" | "desc";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams<TField extends string = string> {
  field: TField;
  direction: SortDirection;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  status: AsyncStatus;
  error: ApiError | null;
}

export type Platform = "pc" | "playstation" | "xbox" | "nintendo_switch";

export type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "very_rare"
  | "ultra_rare"
  | "event"
  | "iridescent";
