import { useEffect, useState } from 'react'
import ProjectCard from './ProjectCard'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Helper function to render markdown with HTML support
const renderMarkdownWithHTML = (content: string) => {
  // Split content by HTML blocks (handles nested divs)
  const parts: (string | { type: 'html'; content: string })[] = []
  let currentIndex = 0
  let depth = 0
  let htmlStart = -1
  
  for (let i = 0; i < content.length; i++) {
    if (content.substring(i, i + 5) === '<div ') {
      if (depth === 0) {
        htmlStart = i
      }
      depth++
    } else if (content.substring(i, i + 6) === '</div>') {
      depth--
      if (depth === 0 && htmlStart !== -1) {
        // Add markdown before HTML
        if (htmlStart > currentIndex) {
          const markdownPart = content.substring(currentIndex, htmlStart)
          if (markdownPart.trim()) {
            parts.push(markdownPart)
          }
        }
        // Add HTML block
        const htmlContent = content.substring(htmlStart, i + 6)
        parts.push({ type: 'html', content: htmlContent })
        currentIndex = i + 6
        htmlStart = -1
      }
    }
  }
  
  // Add remaining markdown
  if (currentIndex < content.length) {
    const remaining = content.substring(currentIndex)
    if (remaining.trim()) {
      parts.push(remaining)
    }
  }
  
  // If no HTML found, render as normal markdown
  if (parts.length === 0 || (parts.length === 1 && typeof parts[0] === 'string')) {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    )
  }
  
  return parts.map((part, index) => {
    if (typeof part === 'string') {
      return (
        <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
          {part}
        </ReactMarkdown>
      )
    } else {
      return (
        <div 
          key={index} 
          dangerouslySetInnerHTML={{ __html: part.content }}
        />
      )
    }
  })
}

// YouTube iframe API types
declare global {
  interface Window {
    YT: {
      Player: new (
        element: HTMLElement | string,
        config: {
          events?: {
            onReady?: (event: { target: YTPlayer }) => void
          }
        }
      ) => YTPlayer
    }
  }
  interface YTPlayer {
    setVolume: (volume: number) => void
  }
}

interface Project {
  id: number
  title: string
  description: string
  longDescription?: string
  longDescriptionMarkdown?: string // Markdown content
  iconType: 'sphere' | 'dots' | 'plane'
  youtubeUrl?: string // YouTube video ID
  gifs?: string[] // Array of image file paths (GIF, JPG, PNG, etc.) - first item is used as card thumbnail
  technologies?: string[]
  category?: 'extended reality' | 'software' // Project category
}

// Dynamically import all markdown files from the projects folder
// Using import.meta.glob to automatically load all .md files
const markdownModules = import.meta.glob('../content/projects/*.md', { 
  eager: true,
  as: 'raw'
}) as Record<string, string>

// Parse frontmatter manually (browser-compatible)
const parseFrontmatter = (content: string): { frontmatter: Record<string, any>, body: string } => {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)
  
  if (!match) {
    return { frontmatter: {}, body: content }
  }
  
  const frontmatterText = match[1]
  const body = match[2]
  
  // Parse YAML-like frontmatter (simple key-value pairs)
  const frontmatter: Record<string, any> = {}
  const lines = frontmatterText.split('\n')
  
  let currentKey = ''
  let currentValue: any = null
  let inArray = false
  let arrayValues: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Check if it's an array item
    if (trimmed.startsWith('- ')) {
      if (!inArray) {
        inArray = true
        arrayValues = []
      }
      const value = trimmed.substring(2).trim().replace(/^['"]|['"]$/g, '')
      arrayValues.push(value)
      continue
    }
    
    // If we were in an array, save it
    if (inArray && currentKey) {
      frontmatter[currentKey] = arrayValues
      inArray = false
      arrayValues = []
    }
    
    // Check if it's a key-value pair
    const colonIndex = trimmed.indexOf(':')
    if (colonIndex > 0) {
      currentKey = trimmed.substring(0, colonIndex).trim()
      let value = trimmed.substring(colonIndex + 1).trim()
      
      // Remove quotes
      if ((value.startsWith("'") && value.endsWith("'")) || 
          (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1)
      }
      
      // Parse value type
      if (value === 'true') {
        currentValue = true
      } else if (value === 'false') {
        currentValue = false
      } else if (!isNaN(Number(value)) && value !== '') {
        currentValue = Number(value)
      } else {
        currentValue = value
      }
      
      frontmatter[currentKey] = currentValue
    }
  }
  
  // Handle last array if exists
  if (inArray && currentKey) {
    frontmatter[currentKey] = arrayValues
  }
  
  return { frontmatter, body }
}

// Parse markdown files
const parseMarkdownProject = (mdContent: string, fileName: string): Project | null => {
  try {
    if (!mdContent || typeof mdContent !== 'string') {
      console.error(`Invalid markdown content for ${fileName}`)
      return null
    }
    
    const { frontmatter, body } = parseFrontmatter(mdContent)
    
    if (!frontmatter.id || !frontmatter.title || !frontmatter.description) {
      console.error(`Missing required fields in ${fileName}:`, frontmatter)
      return null
    }
    
    const project: Project = {
      id: frontmatter.id,
      title: frontmatter.title,
      description: frontmatter.description,
      longDescriptionMarkdown: body.trim(),
      iconType: frontmatter.iconType || 'sphere',
      youtubeUrl: frontmatter.youtubeUrl,
      gifs: frontmatter.gifs || [],
      technologies: frontmatter.technologies || [],
      category: frontmatter.category || 'extended reality', // Default to 'extended reality' if not specified
    }
    return project
  } catch (error) {
    console.error(`Error parsing markdown file ${fileName}:`, error)
    return null
  }
}

// Load all markdown projects from the folder
const markdownProjects: Project[] = Object.entries(markdownModules)
  .map(([path, content]) => {
    const fileName = path.split('/').pop() || path.split('\\').pop() || 'unknown.md'
    return parseMarkdownProject(content as string, fileName)
  })
  .filter((p): p is Project => p !== null)
  .sort((a, b) => a.id - b.id)

// All projects are now loaded from markdown files
const projects: Project[] = markdownProjects

type TabType = 'extended reality' | 'software'

export default function Projects() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('extended reality')

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
  }

  const handleCloseModal = () => {
    setSelectedProject(null)
  }

  // Load YouTube iframe API and set volume for selected project
  useEffect(() => {
    if (!selectedProject?.youtubeUrl) return

    // Load YouTube iframe API if not already loaded
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer()
        return
      }

      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      // Wait for API to load
      const checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYT)
          initializePlayer()
        }
      }, 100)

      return () => clearInterval(checkYT)
    }

    const initializePlayer = () => {
      if (!selectedProject?.youtubeUrl) return

      // Wait a bit for iframe to be ready
      setTimeout(() => {
        const iframeId = `youtube-player-${selectedProject.id}`
        const iframeElement = document.getElementById(iframeId)
        
        if (!iframeElement) return

        try {
          new window.YT.Player(iframeId, {
            events: {
              onReady: (event: { target: YTPlayer }) => {
                // Set volume to 10%
                event.target.setVolume(10)
              },
            },
          })
        } catch (error) {
          console.log('YouTube player initialization:', error)
        }
      }, 800)
    }

    const cleanup = loadYouTubeAPI()
    return cleanup
  }, [selectedProject])

  // Filter projects based on active tab
  const filteredProjects = projects.filter(project => {
    const category = project.category || 'extended reality'
    return category === activeTab
  })

  return (
    <>
      <section
        className={`projects-section ${isVisible ? 'visible' : ''}`}
        id="projects"
      >
        <h2 className="projects-title">Projects</h2>
        
        {/* Tabs */}
        <div className="projects-tabs">
          <button
            className={`projects-tab ${activeTab === 'extended reality' ? 'active' : ''}`}
            onClick={() => setActiveTab('extended reality')}
          >
            Extended Reality
          </button>
          <button
            className={`projects-tab ${activeTab === 'software' ? 'active' : ''}`}
            onClick={() => setActiveTab('software')}
          >
            Other Software
          </button>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              id={project.id}
              title={project.title}
              description={project.description}
              gifs={project.gifs}
              onClick={() => handleProjectClick(project)}
            />
          ))}
        </div>
      </section>

      {selectedProject && (
        <div className="project-modal" onClick={handleCloseModal}>
          <div className="project-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="project-modal-close" onClick={handleCloseModal}>×</button>
            
            <div className="project-modal-header">
              <h2>{selectedProject.title}</h2>
              {selectedProject.technologies && (
                <div className="project-technologies">
                  {selectedProject.technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Render markdown if available, otherwise use plain text */}
            {selectedProject.longDescriptionMarkdown ? (
              <div className="project-long-description-markdown">
                {renderMarkdownWithHTML(selectedProject.longDescriptionMarkdown)}
              </div>
            ) : selectedProject.longDescription ? (
              <p className="project-long-description">{selectedProject.longDescription}</p>
            ) : null}

            <div className="project-media-container">
              {selectedProject.youtubeUrl && (
                <div className="project-video">
                  <h3>Video</h3>
                  <iframe
                    id={`youtube-player-${selectedProject.id}`}
                    src={`https://www.youtube.com/embed/${selectedProject.youtubeUrl}?autoplay=0&rel=0&enablejsapi=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="project-youtube-iframe"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
