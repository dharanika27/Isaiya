import { parseIsoDuration } from '../../utils/duration';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/** YouTube's own "Music" video category. Restricting search.list to this
 * category is real metadata classification (set by the uploader/YouTube),
 * not a text-keyword guess, and is what actually keeps unrelated searches
 * like "Angular" from surfacing tutorials/tech content in the first place. */
const MUSIC_VIDEO_CATEGORY_ID = '10';

export type YouTubeErrorReason = 'missingKey' | 'quota' | 'network' | 'timeout' | 'unknown';

export class YouTubeApiError extends Error {
  reason: YouTubeErrorReason;

  constructor(reason: YouTubeErrorReason, message: string) {
    super(message);
    this.reason = reason;
  }
}

interface RawSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { medium?: { url: string }; default?: { url: string } };
  };
}

interface RawVideoItem {
  id: string;
  contentDetails: { duration: string };
}

async function callYouTubeApi(path: string, params: Record<string, string>, apiKey: string, signal?: AbortSignal) {
  const query = new URLSearchParams({ ...params, key: apiKey }).toString();

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/${path}?${query}`, { signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new YouTubeApiError('network', 'No internet connection.');
  }

  if (!response.ok) {
    let reasonCode: string | undefined;
    try {
      const body = await response.json();
      reasonCode = body?.error?.errors?.[0]?.reason;
    } catch {
      // ignore unparsable error body
    }
    if (reasonCode === 'quotaExceeded' || reasonCode === 'dailyLimitExceeded') {
      throw new YouTubeApiError('quota', 'YouTube search quota has been used up for now.');
    }
    throw new YouTubeApiError('unknown', 'YouTube search is unavailable right now.');
  }

  return response.json();
}

export async function searchVideos(
  query: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<{ videoId: string; title: string; channelTitle: string; thumbnailUrl: string }[]> {
  const data = await callYouTubeApi(
    'search',
    { part: 'snippet', type: 'video', videoCategoryId: MUSIC_VIDEO_CATEGORY_ID, maxResults: '25', q: query },
    apiKey,
    signal
  );

  const items: RawSearchItem[] = data.items ?? [];
  return items
    .filter((item) => item.id?.videoId)
    .map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default?.url ?? '',
    }));
}

export async function fetchVideoDurations(
  videoIds: string[],
  apiKey: string,
  signal?: AbortSignal
): Promise<Record<string, number>> {
  if (videoIds.length === 0) return {};

  const data = await callYouTubeApi(
    'videos',
    { part: 'contentDetails', id: videoIds.join(',') },
    apiKey,
    signal
  );

  const items: RawVideoItem[] = data.items ?? [];
  const durations: Record<string, number> = {};
  for (const item of items) {
    const seconds = parseIsoDuration(item.contentDetails.duration);
    if (seconds !== null) durations[item.id] = seconds;
  }
  return durations;
}
