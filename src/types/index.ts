// ── Slicer / filter state ───────────────────────────────────────────────────
export type DateRange = '7d' | '30d' | '90d' | 'all';
export type Severity = 'all' | 'High' | 'Medium' | 'Low';

export interface SlicerState {
  lob: string;          // 'all' or a LOB name
  dateRange: DateRange;
  severity: Severity;
}

// ── KPI Card ────────────────────────────────────────────────────────────────
export type TrendDir = 'up' | 'down' | 'neutral';

export interface KpiCardData {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend: TrendDir;
  trendLabel: string;   // e.g. "+2% vs last month"
  positiveIsUp: boolean; // true = green when up, false = green when down (e.g. AHT)
}

// ── Chart data shapes ───────────────────────────────────────────────────────
export interface TimePoint {
  date: string;   // e.g. "Jan", "Feb" or "2024-12-01"
  [key: string]: string | number;
}

export interface CategoryPoint {
  name: string;
  [key: string]: string | number;
}

// ── Table rows ──────────────────────────────────────────────────────────────
export interface BlockedArticleRow {
  id: string;
  article: string;
  lob: string;
  owner: string;
  reason: string;
  ageDays: number;
}

export interface IncidentRow {
  id: string;
  lob: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Review' | 'Resolved';
  opened: string;
  summary: string;
}

// ── Actionable Insights ─────────────────────────────────────────────────────
export type PersonaTag = 'Content Manager' | 'Support Engineer' | 'LOB Leader' | 'Program Leader';
export type Priority = 'High' | 'Medium' | 'Low';
export type ResolutionType = 'content-fix' | 'ado-assignment' | 'bug-filing' | 'content-request';

export interface FailingPrompt {
  question: string;
  botAnswer: string;
  missingContent: string;
}

export interface MissingQuery {
  question: string;
  lob: string;
  topic: string;
  frequency: number; // times asked in the period
}

export interface ArticleItem {
  title: string;
  lob: string;
  status: 'Blocked' | 'Outdated' | 'Missing';
  age: string;
  blockedReason?: string;
  articleUrl?: string;
}

export interface AdoFormData {
  title: string;
  type: 'Bug' | 'Task' | 'User Story';
  assignedTo: string;
  areaPath: string;
  priority: '1' | '2' | '3' | '4';
  tags: string;
}

export interface BugFormData {
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  component: string;
  team: 'PG' | 'SIA Eng' | 'DS';
  description: string;
}

export interface ActionDetail {
  summary: string;
  // content-fix
  failingPrompts?: FailingPrompt[];
  articles?: ArticleItem[];
  // ado-assignment
  adoDefaults?: Partial<AdoFormData>;
  affectedQueries?: string[];
  // bug-filing
  bugDefaults?: Partial<BugFormData>;
  investigationContext?: string;
  incidentId?: string;
  // content-request
  missingQueries?: MissingQuery[];
  contentRequestDefaults?: { assignedTo?: string; areaPath?: string; tags?: string };
}

export interface ActionItem {
  id: string;
  priority: Priority;
  persona: PersonaTag;
  description: string;
  section?: string;
  resolutionType: ResolutionType;
  detail: ActionDetail;
}

