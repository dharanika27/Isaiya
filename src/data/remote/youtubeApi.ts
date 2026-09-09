import { parseIsoDuration } from '../../utils/duration';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export type YouTubeErrorReason = 'missingKey' | 'quota' | 'network' | 'timeout' | 'unknown';

export class YouTubeApiError extends Error {
  reason: YouTubeErrorReason;

  constructor(reason: YouTubeErrorReason, message: string) {
    super(message);
    this.reason = reason;
  }
}

export interface RawSearchItem {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  description: string;
  liveBroadcastContent: string;
}

export interface VideoMetadata {
  durationSeconds: number | null;
  categoryId: string | null;
}

interface RawApiSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    description: string;
    liveBroadcastContent: string;
    thumbnails: { medium?: { url: string }; default?: { url: string } };
  };
}

interface RawApiVideoItem {
  id: string;
  snippet: { categoryId?: string };
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

/**
 * Deliberately does NOT restrict this call to videoCategoryId=10 ("Music").
 * Live testing showed that restriction is not reliable both ways: some
 * coding/tutorial content is mistagged as Music (so the restriction doesn't
 * exclude it), while some legitimate official song uploads are tagged
 * outside Music (e.g. Entertainment), so the restriction would exclude them.
 * Category is instead read per-result via fetchVideoMetadata and used as one
 * signal in the relevance score, not as a query-time gate.
 */
export async function searchVideos(query: string, apiKey: string, signal?: AbortSignal): Promise<RawSearchItem[]> {
  const data = await callYouTubeApi('search', { part: 'snippet', type: 'video', maxResults: '25', q: query }, apiKey, signal);

  const items: RawApiSearchItem[] = data.items ?? [];
  return items
    .filter((item) => item.id?.videoId)
    .map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      description: item.snippet.description ?? '',
      liveBroadcastContent: item.snippet.liveBroadcastContent ?? 'none',
      thumbnailUrl: item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default?.url ?? '',
    }));
}

/** Single batched call (flat 1 quota unit regardless of id count or which
 * parts are requested) fetching both duration and category per video. */
export async function fetchVideoMetadata(
  videoIds: string[],
  apiKey: string,
  signal?: AbortSignal
): Promise<Record<string, VideoMetadata>> {
  if (videoIds.length === 0) return {};

  const data = await callYouTubeApi('videos', { part: 'snippet,contentDetails', id: videoIds.join(',') }, apiKey, signal);

  const items: RawApiVideoItem[] = data.items ?? [];
  const metadata: Record<string, VideoMetadata> = {};
  for (const item of items) {
    metadata[item.id] = {
      durationSeconds: parseIsoDuration(item.contentDetails.duration),
      categoryId: item.snippet.categoryId ?? null,
    };
  }
  return metadata;
}
