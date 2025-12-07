
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  RESULTS = 'RESULTS',
  CALENDAR = 'CALENDAR',
  DOCUMENTS = 'DOCUMENTS',
  SETTINGS = 'SETTINGS',
  ACCOUNT_SECURITY = 'ACCOUNT_SECURITY'
}

export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface UserProfile {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  deadline?: string;
  priority: Priority;
  completed: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export interface ItemDetected {
  name: string;
  category: string;
  confidence: number;
  boundingBox?: { x: number; y: number; w: number; h: number }; // Simplified for UI simulation
}

export interface ScanResult {
  id: string;
  timestamp: number;
  imageUrl: string;
  summary: string;
  itemsDetected: ItemDetected[];
  tasks: Task[];
  events: Event[];
  notes: Note[];
  studyPlan?: string[];
}

export interface AnalysisState {
  isAnalyzing: boolean;
  progress: number; // 0-100
  stage: string; // e.g., "Recognizing text...", "Identifying objects..."
}
