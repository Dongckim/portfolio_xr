import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface TreeNode {
  name: string
  group: string
  children?: TreeNode[]
}

const masterData: TreeNode = {
  name: "Intelligence in Reality",
  group: "core",
  children: [
    {
      name: "Architecting Spatial Reality",
      group: "context",
      children: [
        {
          name: "Reading the Atmosphere",
          group: "context",
          children: [
            { name: "Spatial Geometry", group: "context" },
            { name: "Meaningful Spaces", group: "context" },
            { name: "Blending Realities", group: "context" }
          ]
        },
        {
          name: "Decoding Human Intent",
          group: "context",
          children: [
            { name: "Beyond Controllers", group: "context" },
            { name: "Eye as Input", group: "context" },
            { name: "Implicit Signals", group: "context" }
          ]
        }
      ]
    },
    {
      name: "Bridging Virtual and Realities",
      group: "system",
      children: [
        {
          name: "Synchronizing Reality",
          group: "system",
          children: [
            { name: "Zero Latency", group: "system" },
            { name: "Shared Timeline", group: "system" },
            { name: "Time Correction", group: "system" }
          ]
        },
        {
          name: "Planting Digital Memories",
          group: "system",
          children: [
            { name: "Spatial Anchors", group: "system" },
            { name: "Drift-free World", group: "system" }
          ]
        }
      ]
    },
    {
      name: "How should it react?",
      group: "interface",
      children: [
        {
          name: "Seamless Vision",
          group: "interface",
          children: [
            { name: "Visual Blending", group: "interface" },
            { name: "Digital Presence", group: "interface" }
          ]
        },
        {
          name: "Physicality",
          group: "interface",
          children: [
            { name: "Can we touch it?", group: "interface" },
            { name: "Physics Interaction", group: "interface" }
          ]
        },
        {
          name: "Spatial Soundscape",
          group: "interface",
          children: [
            { name: "Conversational UI", group: "interface" }
          ]
        }
      ]
    },
    {
      name: "Why do we build this?",
      group: "value",
      children: [
        { name: "True Co-presence", group: "value" },
        { name: "Zero Friction", group: "value" },
        { name: "SpatialAI as a Partner", group: "value" }
      ]
    }
  ]
}

const colors: Record<string, string> = {
  core: "#ffffff",
  context: "#60a5fa", // Blue
  system: "#fbbf24",  // Amber
  interface: "#e879f9", // Fuchsia
  value: "#34d399"    // Emerald
}

export default function MindMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const isInView = rect.top < window.innerHeight && rect.bottom > 0
      setIsVisible(isInView)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    if (!isVisible) return

    const container = containerRef.current
    if (!container) {
      return () => window.removeEventListener('scroll', handleScroll)
    }
    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    // Clear previous
    d3.select(container).selectAll('*').remove()

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('cursor', 'grab')

    // Grid Pattern
    const defs = svg.append('defs')
    const pattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 40)
      .attr('height', 40)
      .attr('patternUnits', 'userSpaceOnUse')
    
    pattern.append('path')
      .attr('d', 'M 40 0 L 0 0 0 40')
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 0.5)

    const g = svg.append('g')

    // Infinite Grid Background
    g.append('rect')
      .attr('width', width * 10)
      .attr('height', height * 10)
      .attr('x', -width * 5)
      .attr('y', -height * 5)
      .attr('fill', 'url(#grid)')
      .style('pointer-events', 'none')

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString())
      })
    
    svg.call(zoom)
    svg.on('mousedown', () => {
      svg.style('cursor', 'grabbing')
    })
    svg.on('mouseup', () => {
      svg.style('cursor', 'grab')
    })

    // Data Processing - Split for Bi-Directional Layout
    const leftGroups = ['context', 'system']
    const rightGroups = ['interface', 'value']

    const leftChildren = masterData.children?.filter(c => leftGroups.includes(c.group)) || []
    const rightChildren = masterData.children?.filter(c => rightGroups.includes(c.group)) || []

    const leftTreeData: TreeNode = { ...masterData, children: leftChildren }
    const rightTreeData: TreeNode = { ...masterData, children: rightChildren }

    // Layout Calculation
    const tree = d3.tree<TreeNode>().nodeSize([35, 200])

    // Process Left Tree (Inputs)
    const rootLeft = d3.hierarchy(leftTreeData)
    tree(rootLeft)

    // Process Right Tree (Outputs)
    const rootRight = d3.hierarchy(rightTreeData)
    tree(rootRight)

    // Adjust coordinates - Left tree: Flip Y to go left
    rootLeft.each(d => {
      if (d.y !== undefined) {
        d.y = -d.y
      }
    })

    // Combine nodes and links
    const nodesLeft = rootLeft.descendants().slice(1) // Skip root duplicate
    const nodesRight = rootRight.descendants() // Include root

    const linksLeft = rootLeft.links()
    const linksRight = rootRight.links()

    // Link Generator (Curved)
    const linkGen = d3.linkHorizontal<d3.HierarchyLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
      .x(d => d.y || 0)
      .y(d => d.x || 0)

    // Draw Links
    const linkGroup = g.append('g').attr('class', 'links')

    function drawLinks(data: d3.HierarchyLink<TreeNode>[], className: string) {
      return linkGroup.selectAll<SVGPathElement, d3.HierarchyLink<TreeNode>>(`.${className}`)
        .data(data, d => (d.target as d3.HierarchyPointNode<TreeNode>).data.name)
        .enter()
        .append('path')
        .attr('class', className)
        .attr('d', linkGen)
        .attr('stroke', '#334155')
    }

    const allLinksData = [...linksLeft, ...linksRight]
    const staticLinks = drawLinks(allLinksData, 'link')
    const flowLinks = drawLinks(allLinksData, 'link-flow')

    // Color flow links based on group
    flowLinks
      .attr('stroke', d => {
        const target = d.target as d3.HierarchyPointNode<TreeNode>
        const source = d.source as d3.HierarchyPointNode<TreeNode>
        const group = target.data.group || source.data.group
        return colors[group] || '#fff'
      })
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '10, 10')
      .style('opacity', 0)
      .style('pointer-events', 'none')

    // Add flow animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes flow {
        to { stroke-dashoffset: -20; }
      }
      .link-flow.active {
        opacity: 0.8 !important;
        animation: flow 2s linear infinite;
      }
    `
    document.head.appendChild(style)

    // Draw Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes')
    const allNodesData = [...nodesLeft, ...nodesRight]

    interface ExtendedNode extends d3.HierarchyPointNode<TreeNode> {
      w?: number
      h?: number
    }

    const nodeSelection = nodeGroup.selectAll<SVGGElement, ExtendedNode>('.node')
      .data(allNodesData as ExtendedNode[])
      .enter()
      .append('g')
      .attr('class', d => {
        if (d.depth === 0) return 'node core'
        if (d.depth === 1) return 'node hub'
        return 'node leaf'
      })
      .attr('transform', d => `translate(${d.y || 0},${d.x || 0})`)
      .style('cursor', 'pointer')

    // Node Size Logic - Calculate based on actual text width
    const tempText = svg.append('text')
      .style('visibility', 'hidden')
      .style('font-family', 'JetBrains Mono, monospace, sans-serif')
    
    nodeSelection.each(function(d) {
      const isCore = d.depth === 0
      
      if (isCore) {
        // Measure core text width accurately
        tempText.text(d.data.name).style('font-size', '16px').style('font-weight', '800')
        const textWidth = (tempText.node()?.getBBox().width || 0) + 40 // Add padding
        d.w = Math.max(textWidth, 220) // Minimum width for core
        d.h = 50
      } else {
        const textLen = d.data.name.length
        d.w = textLen * 7.5 + 20
        d.h = 32
      }
    })
    
    tempText.remove()

    // Rects
    nodeSelection.append('rect')
      .attr('width', d => d.w || 120)
      .attr('height', d => d.h || 32)
      .attr('x', d => -(d.w || 120) / 2)
      .attr('y', d => -(d.h || 32) / 2)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', d => d.depth === 0 ? '#fff' : '#0f172a')
      .attr('stroke', d => colors[d.data.group || 'core'])
      .attr('stroke-width', d => d.depth === 0 ? 3 : d.depth === 1 ? 2 : 1)
      .style('transition', 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)')
      .style('filter', d => {
        if (d.depth === 0) return 'drop-shadow(0 0 20px rgba(255,255,255,0.4))'
        return 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
      })

    // Text
    nodeSelection.append('text')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text(d => d.data.name)
      .attr('font-size', d => {
        if (d.depth === 0) return '16px'
        if (d.depth === 1) return '13px'
        return '12px'
      })
      .attr('font-weight', d => {
        if (d.depth === 0) return '800'
        if (d.depth === 1) return '700'
        return '500'
      })
      .attr('fill', d => {
        if (d.depth === 0) return '#0f172a'
        if (d.depth === 1) return '#e2e8f0'
        return '#94a3b8'
      })
      .style('pointer-events', 'none')
      .style('font-family', 'JetBrains Mono, monospace, sans-serif')
      .style('transition', 'all 0.3s')

    // Interactions
    nodeSelection.on('mouseover', function(_, d) {
      // Traverse Logic
      const activeNodes = new Set<ExtendedNode>()
      const activeLinks = new Set<ExtendedNode>()

      // 1. Walk Up to Root
      let curr: ExtendedNode | null = d
      while (curr) {
        activeNodes.add(curr)
        if (curr.parent) {
          activeLinks.add(curr)
        }
        curr = curr.parent as ExtendedNode | null
      }

      // 2. Walk Down to Children
      function traverseDown(node: ExtendedNode) {
        activeNodes.add(node)
        if (node.children) {
          node.children.forEach(child => {
            activeLinks.add(child as ExtendedNode)
            traverseDown(child as ExtendedNode)
          })
        }
      }
      traverseDown(d)

      // Apply Classes
      g.selectAll<SVGGElement, ExtendedNode>('.node').classed('dimmed', true)
      g.selectAll<SVGPathElement, d3.HierarchyLink<TreeNode>>('.link').classed('dimmed', true)
      g.selectAll<SVGPathElement, d3.HierarchyLink<TreeNode>>('.link-flow').classed('active', false)

      nodeSelection.filter(n => activeNodes.has(n))
        .classed('dimmed', false)

      // Activate related links
      staticLinks.filter(l => activeLinks.has(l.target as ExtendedNode))
        .classed('dimmed', false)
        .classed('active', true)

      flowLinks.filter(l => activeLinks.has(l.target as ExtendedNode))
        .classed('active', true)

      // Hover effect on node
      const nodeData = d as ExtendedNode
      d3.select(this).select('rect')
        .style('transform', 'scale(1.05)')
        .attr('stroke-width', 2)
        .style('filter', nodeData.depth === 0 
          ? 'drop-shadow(0 0 25px rgba(255,255,255,0.6)) brightness(1.1)' 
          : 'drop-shadow(0 0 12px currentColor) brightness(1.2)')
      
      // Keep text color distinct - core stays dark, others become white
      d3.select(this).select('text')
        .attr('fill', nodeData.depth === 0 ? '#0f172a' : '#fff')
        .attr('font-weight', nodeData.depth === 0 ? '900' : '700')
    })
    .on('mouseout', function(_, d) {
      g.selectAll<SVGGElement, ExtendedNode>('.node').classed('dimmed', false)
      g.selectAll<SVGPathElement, d3.HierarchyLink<TreeNode>>('.link')
        .classed('dimmed', false)
        .classed('active', false)
      g.selectAll<SVGPathElement, d3.HierarchyLink<TreeNode>>('.link-flow').classed('active', false)

      // Reset node styles
      d3.select(this).select('rect')
        .style('transform', 'scale(1)')
        .attr('stroke-width', () => {
          if (d.depth === 0) return 3
          if (d.depth === 1) return 2
          return 1
        })
      d3.select(this).select('text')
        .attr('fill', () => {
          if (d.depth === 0) return '#0f172a'
          if (d.depth === 1) return '#e2e8f0'
          return '#94a3b8'
        })
    })

    // Initial Zoom - Scale up to zoom in (like scrolling twice)
    // Mobile: smaller scale to show more of the map, Desktop: larger scale for detail
    const isMobile = window.innerWidth < 768
    const initialScale = isMobile ? 0.5 : 1.3
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale)
    )

    // Handle resize
    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      svg.attr('width', w).attr('height', h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      if (style && document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [isVisible])

  return (
    <div className="mindmap-section">
      <div className="mindmap-subtitle">
        <p>1. Architecting Seamless Reality: From Low-Latency Systems to Spatial Interaction</p>
        <p>2. Bridging Realities: Engineering Seamless Human with Spatial AI</p>
        <p>3. Pioneering Next-Generation User Experience</p>
      </div>
      
      <div 
        ref={containerRef}
        className={`mindmap-container ${isVisible ? 'visible' : ''}`} 
        style={{ 
          width: '100%', 
          height: '100vh',
          cursor: 'grab',
          position: 'relative'
        }}
      >
        <div className="ui-panel">
          <div className="panel-title">System Blueprint</div>
          <div className="panel-main">Intelligence<br/>in Reality</div>
          
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
            <span className="tag" style={{background: '#60a5fa'}}>INPUT: Context</span>
            <span className="tag" style={{background: '#fbbf24'}}>INPUT: System</span>
            <span className="tag" style={{background: '#e879f9'}}>OUTPUT: Interface</span>
            <span className="tag" style={{background: '#34d399'}}>OUTPUT: Value</span>
          </div>

          <div className="mt-4 text-[11px] text-slate-400 border-t border-slate-600 pt-3">
            Nodes converge to the center and diverge outwards.<br/>
            Hover to see the data flow.
          </div>
        </div>
      </div>
    </div>
  )
}
