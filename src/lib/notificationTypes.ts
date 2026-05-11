export interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  scheduledAt: number;
  repeat: 'none' | 'daily' | 'weekly';
  repeatMinutes: number | null;
  sound: boolean;
  soundRepeat: number;
  fired: boolean;
  createdAt: number;
}

export interface ActiveToast {
  id: string;
  title: string;
  message: string;
  sound: boolean;
  soundRepeat: number;
}
