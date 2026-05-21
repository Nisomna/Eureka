export type Phase = 'login' | 'home' | 'afinar' | 'despeje' | 'eureka' | 'aplicacion';

export interface DespejeActivity {
  id: string;
  title: string;
  desc: string;
  iconId: string;
  completed: boolean;
}

export interface HistoricalTask {
  id: string;
  problem: string;
  idea: string;
  plan: string;
  date: string;
  completed: boolean;
}

export interface AppState {
  interests: string[];
  problem: string;
  definition: string;
  options: string;
  ideas: string[];
  selectedIdea: string | null;
  plan: string;
  despejeActivities: DespejeActivity[];
  despejeStartTime: number | null;
  despejeDayPlan: string | null;
  historicalTasks: HistoricalTask[];
}
