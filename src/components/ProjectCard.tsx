interface ProjectCardProps {
  id: number
  title: string
  description: string
  onClick?: () => void
  gifs?: string[]
}

export default function ProjectCard({
  title,
  description,
  onClick,
  gifs,
}: ProjectCardProps) {
  return (
    <div 
      className="project-card-thumbnail" 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {gifs && gifs.length > 0 ? (
        <img
          src={gifs[0]}
          alt={`${title} thumbnail`}
          className="project-gif-thumbnail"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `https://via.placeholder.com/400x400/0b0b0c/00aaff?text=${encodeURIComponent(title)}`
          }}
        />
      ) : (
        <div className="project-gif-placeholder">
          <span>{title}</span>
        </div>
      )}
      <div className="project-card-title-overlay">
        <div className="project-card-overlay-content">
        <h3>{title}</h3>
        <p>{description}</p>
          </div>
      </div>
    </div>
  )
}

