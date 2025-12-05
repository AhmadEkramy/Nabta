/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Check if URL is a YouTube link
 */
export const isYouTubeUrl = (url: string): boolean => {
  if (!url) return false;
  return /youtube\.com|youtu\.be/.test(url);
};

/**
 * Convert YouTube URL to embed URL
 */
export const getYouTubeEmbedUrl = (url: string): string | null => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
};

