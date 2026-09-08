export const YOUTUBE_API_KEY: string | null = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY?.trim() || null;

export const hasYouTubeApiKey = YOUTUBE_API_KEY !== null;
