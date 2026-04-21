export type EmbeddableVideo =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "vimeo"; embedUrl: string }
  | { kind: "file"; url: string }
  | { kind: "link"; url: string };

export function toEmbeddableVideo(raw: string | null | undefined): EmbeddableVideo | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const videoId = url.searchParams.get("v");
    if (videoId) {
      return {
        kind: "youtube",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
      };
    }
  }
  if (host === "youtu.be") {
    const videoId = url.pathname.replace(/^\//, "").split("/")[0];
    if (videoId) {
      return {
        kind: "youtube",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
      };
    }
  }

  if (host === "vimeo.com") {
    const videoId = url.pathname.replace(/^\//, "").split("/")[0];
    if (videoId && /^\d+$/.test(videoId)) {
      return {
        kind: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
      };
    }
  }

  if (/\.(mp4|webm|ogg|mov)$/i.test(url.pathname)) {
    return { kind: "file", url: trimmed };
  }

  return { kind: "link", url: trimmed };
}
