export interface CurriculumData {
  [year: string]: {
    [department: string]: string[]; // Array of subjects
  };
}

export enum SheetType {
  Theoretical = 'Theoretical',
  Practical = 'Practical',
  Both = 'Both'
}

export interface Sheet {
  id: string;
  year: string;
  semester: string;
  department: string;
  subject: string;
  doctorName: string;
  type: SheetType;
  sheetNumber: number;
  imageUrl?: string;
  createdAt: number;
  price?: number;
}

export interface NotificationSubscription {
  topic: string; // Format: {Year}_{Department}_{Semester}
  subscribedAt: number;
}

export interface AdminConfig {
  passwordHash: string; // In a real app this is a hash, here simple string for demo
}