export type Phase = 'home' | 'afinar' | 'despeje' | 'eureka' | 'aplicacion';

export interface DespejeActivity {
  id: string;
  title: string;
  desc: string;
  iconId: string;
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
}
