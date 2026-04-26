'use client'

interface Props {
  url: string
}

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  )
  return m ? m[1] : null
}

export function ProductLPVideo({ url }: Props) {
  const ytId = getYouTubeId(url)

  if (ytId) {
    return (
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-border">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          title="Video do produto"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }

  // MP4 / WebM direto
  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-border">
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-contain"
      >
        Seu navegador não suporta video.
      </video>
    </div>
  )
}
