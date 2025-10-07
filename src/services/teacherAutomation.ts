const rawBaseUrl = (import.meta.env.VITE_TEACHER_API_URL ?? '').trim();
export const teacherAutomationBaseUrl = rawBaseUrl.replace(/\/$/, '');

const rawToken = (import.meta.env.VITE_TEACHER_API_TOKEN ?? '').trim();
export const teacherAutomationToken = rawToken.length > 0 ? rawToken : null;
