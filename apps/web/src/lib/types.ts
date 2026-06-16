export type Suit = "S" | "C" | "D" | "H";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multi_choice"
  | "file"
  | "number"
  | "date"
  | "url";

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  options?: string[];
  maxLength?: number;
}

export type GameStatus = "draft" | "published" | "closed";
export type ApplicationStatus = "submitted" | "accepted" | "denied" | "waitlisted";
export type UserRole = "admin" | "applicant";

export interface ProfileFields {
  school?: string | null;
  grad_year?: number | null;
  major?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  website_url?: string | null;
  short_bio?: string | null;
  resume_path?: string | null;
  resume_filename?: string | null;
}

export interface UserMe {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  profile: ProfileFields;
}

export interface GamePublic {
  id: string;
  suit: Suit;
  rank: number;
  title: string;
  description: string;
  status: GameStatus;
  question_schema: Question[];
  opens_at: string | null;
  closes_at: string | null;
  game_date: string | null;
}

export interface GameSummary {
  id: string;
  suit: Suit;
  rank: number;
  title: string;
  status: GameStatus;
  opens_at: string | null;
  closes_at: string | null;
  deleted_at: string | null;
  application_count: number;
}

export interface GameDetail extends GamePublic {
  created_at: string;
  updated_at: string;
}

export interface FileRef {
  id: string;
  question_id: string | null;
  filename: string;
  content_type: string | null;
  size: number | null;
  download_url: string | null;
}

export interface ApplicationDetail {
  id: string;
  game_id: string;
  answers: Record<string, unknown>;
  profile_snapshot: Record<string, unknown>;
  status: ApplicationStatus;
  submitted_at: string;
  decided_at: string | null;
  files: FileRef[];
}

export interface ApplicationSummary {
  id: string;
  game_id: string;
  game_title: string;
  game_suit: Suit;
  game_rank: number;
  status: ApplicationStatus;
  submitted_at: string;
  decided_at: string | null;
}

export interface ApplicationReview {
  id: string;
  user_id: string;
  applicant_name: string | null;
  applicant_email: string;
  answers: Record<string, unknown>;
  profile_snapshot: Record<string, unknown>;
  status: ApplicationStatus;
  submitted_at: string;
  decided_at: string | null;
  files: FileRef[];
}

export interface FileRegister {
  storage_path: string;
  filename: string;
  content_type?: string | null;
  size?: number | null;
  question_id?: string | null;
}

export const SUITS: { code: Suit; glyph: string; name: string; desc: string; red: boolean }[] = [
  { code: "S", glyph: "♠", name: "Spades", desc: "wild & everything else", red: false },
  { code: "C", glyph: "♣", name: "Clubs", desc: "cs/ai & strategy", red: false },
  { code: "D", glyph: "♦", name: "Diamonds", desc: "math & intellectual", red: true },
  { code: "H", glyph: "♥", name: "Hearts", desc: "physical & social", red: true },
];

// 2..10, J(11), Q(12), K(13), A(1)
export const RANK_ORDER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1];

export function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export const SUIT_NAME: Record<Suit, string> = {
  S: "spades",
  C: "clubs",
  D: "diamonds",
  H: "hearts",
};

export const SUIT_FROM_NAME: Record<string, Suit> = {
  spades: "S",
  clubs: "C",
  diamonds: "D",
  hearts: "H",
};
