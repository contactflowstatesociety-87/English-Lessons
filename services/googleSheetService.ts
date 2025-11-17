import { Student } from '../types';

type InteractionEvent = 
  | 'user_signup'
  | 'lesson_started'
  | 'lesson_completed'
  | 'quiz_submitted'
  | 'ai_example_requested'
  | 'ai_info_requested'
  | 'ai_recommendations_requested';

// This is a MOCK service. In a real application, these functions would
// make secure API calls to a backend server, which would then interact
// with the Google Sheets API. NEVER expose API keys on the frontend.
export const googleSheetService = {
  saveNewUser: (userData: { fullName: string, email: string, country: string, city: string }): Promise<{ success: boolean }> => {
    console.log('[Google Sheet Service] Mock Saving New User:');
    console.table(userData);
    // Simulate network request
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
  },

  logInteraction: (studentId: string, event: InteractionEvent, data: Record<string, any>): void => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      studentId,
      event,
      ...data,
    };
    console.log(`[Google Sheet Service] Mock Logging Interaction: ${event}`);
    console.table(logEntry);
  },
};
