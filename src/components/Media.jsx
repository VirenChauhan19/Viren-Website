// Renders a media item: self-hosted video, YouTube embed, or image.
export default function Media({ item }) {
  const base = import.meta.env.BASE_URL

  if (item.type === 'youtube') {
    return (
      <div className="media media-video">
        <iframe
          src={`https://www.youtube.com/embed/${item.src}`}
          title={item.caption || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    )
  }

  if (item.type === 'video') {
    return (
      <div className="media media-video">
        <video
          src={`${base}${item.src}`}
          controls
          playsInline
          preload="metadata"
          poster={item.poster ? `${base}${item.poster}` : undefined}
        />
      </div>
    )
  }

  return (
    <div className="media">
      <img src={`${base}${item.src}`} alt={item.caption || ''} loading="lazy" />
    </div>
  )
}
