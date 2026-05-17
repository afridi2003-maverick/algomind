"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './CanvasVisualization.module.css';

export interface VisualNode {
  id: string;
  label: string;
  x: number;
  y: number;
  state: 'unvisited' | 'frontier' | 'visiting' | 'visited' | 'goal';
  distance?: number | string;
  heuristic?: number;
}

export interface VisualEdge {
  source: string;
  target: string;
  weight: number;
  state: 'unvisited' | 'frontier' | 'visiting' | 'visited';
}

interface CanvasVisualizationProps {
  nodes: VisualNode[];
  edges: VisualEdge[];
  isDirected?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onNodeDrag?: (nodeId: string, x: number, y: number) => void;
  onCanvasClick?: (x: number, y: number) => void;
  onEdgeClick?: (source: string, target: string) => void;
  selectedNodeId?: string | null;
  width?: number;
  height?: number;
  scale?: number;
}

const COLORS = {
  unvisited: { fill: '#374151', stroke: '#9CA3AF', text: '#F3F4F6', glow: 'transparent' },
  frontier: { fill: '#1E3A8A', stroke: '#3B82F6', text: '#93C5FD', glow: 'rgba(59, 130, 246, 0.6)' },
  visiting: { fill: '#7C2D12', stroke: '#F97316', text: '#FDBA74', glow: 'rgba(249, 115, 22, 0.8)' },
  visited: { fill: '#064E3B', stroke: '#10B981', text: '#A7F3D0', glow: 'transparent' },
  goal: { fill: '#78350F', stroke: '#FBBF24', text: '#FDE68A', glow: 'rgba(251, 191, 36, 0.8)' },
};

const NODE_RADIUS = 25;

function parseHex(hex: string) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

function interpolateColor(color1: string, color2: string, t: number) {
  if (color1 === 'transparent' || color2 === 'transparent') return 'transparent';
  try {
    const c1 = parseHex(color1);
    const c2 = parseHex(color2);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } catch (e) {
    return color2; // Fallback
  }
}

export default function CanvasVisualization({
  nodes,
  edges,
  isDirected = false,
  onNodeClick,
  onNodeDrag,
  onCanvasClick,
  onEdgeClick,
  selectedNodeId = null,
  width = 800,
  height = 500,
  scale = 1,
}: CanvasVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [animationTime, setAnimationTime] = useState(0);

  // Transition tracking for smooth animations
  const prevStatesRef = useRef<Record<string, VisualNode['state']>>({});
  const transitionProgressRef = useRef<Record<string, { startState: VisualNode['state']; endState: VisualNode['state']; startTime: number }>>({});

  useEffect(() => {
    nodes.forEach(node => {
      const prevState = prevStatesRef.current[node.id];
      if (prevState !== undefined && prevState !== node.state) {
        transitionProgressRef.current[node.id] = {
          startState: prevState,
          endState: node.state,
          startTime: performance.now()
        };
      }
      prevStatesRef.current[node.id] = node.state;
    });
  }, [nodes]);

  // Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    
    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setAnimationTime((prev) => (prev + delta) % 100);
      animId = requestAnimationFrame(tick);
    };
    
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Main Drawing Function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Support High DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear and draw grid
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);
    
    // Draw Grid Lines (Premium Visuals)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Edges
    edges.forEach((edge) => {
      const u = nodes.find(n => n.id === edge.source);
      const v = nodes.find(n => n.id === edge.target);
      if (!u || !v) return;

      const colorScheme = COLORS[edge.state] || COLORS.unvisited;
      ctx.strokeStyle = colorScheme.stroke;
      ctx.lineWidth = edge.state !== 'unvisited' ? 3 : 2;

      // Animate flowing dashes for evaluating/active edges
      if (edge.state === 'visiting' || edge.state === 'frontier') {
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -animationTime * 40;
      } else {
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.moveTo(u.x, u.y);
      ctx.lineTo(v.x, v.y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Draw arrow head if directed
      if (isDirected) {
        const angle = Math.atan2(v.y - u.y, v.x - u.x);
        const arrowLength = 12;
        const arrowAngle = Math.PI / 6;
        
        // Offset arrow from target node boundary
        const arrowX = v.x - NODE_RADIUS * Math.cos(angle);
        const arrowY = v.y - NODE_RADIUS * Math.sin(angle);

        ctx.fillStyle = colorScheme.stroke;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle - arrowAngle),
          arrowY - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle + arrowAngle),
          arrowY - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.closePath();
        ctx.fill();
      }

      // Draw edge weights
      const midX = (u.x + v.x) / 2;
      const midY = (u.y + v.y) / 2;
      ctx.save();
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      const text = edge.weight.toString();
      ctx.font = '11px monospace';
      const textWidth = ctx.measureText(text).width;
      
      ctx.beginPath();
      ctx.roundRect(midX - textWidth/2 - 6, midY - 9, textWidth + 12, 18, 4);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = edge.state !== 'unvisited' ? colorScheme.stroke : '#9CA3AF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, midX, midY);
      ctx.restore();
    });

    // Draw Nodes
    nodes.forEach((node) => {
      const isHovered = hoveredNodeId === node.id;
      
      // Interpolate colors dynamically for smooth state transitions
      let fillColor = COLORS[node.state]?.fill || COLORS.unvisited.fill;
      let strokeColor = COLORS[node.state]?.stroke || COLORS.unvisited.stroke;
      
      const trans = transitionProgressRef.current[node.id];
      if (trans) {
        const elapsed = performance.now() - trans.startTime;
        const duration = 400; // 400ms for elegant smooth animation
        const t = Math.min(elapsed / duration, 1);
        
        const startFill = COLORS[trans.startState]?.fill || COLORS.unvisited.fill;
        const endFill = COLORS[trans.endState]?.fill || COLORS.unvisited.fill;
        fillColor = interpolateColor(startFill, endFill, t);
        
        const startStroke = COLORS[trans.startState]?.stroke || COLORS.unvisited.stroke;
        const endStroke = COLORS[trans.endState]?.stroke || COLORS.unvisited.stroke;
        strokeColor = interpolateColor(startStroke, endStroke, t);
        
        if (t === 1) {
          delete transitionProgressRef.current[node.id];
        }
      }
      
      const colorScheme = COLORS[node.state] || COLORS.unvisited;
      
      // Calculate dynamic radius and pulse effects
      let radius = NODE_RADIUS;
      let glowRadius = 15;
      
      if (node.state === 'frontier') {
        const pulse = Math.sin(animationTime * 5) * 2;
        radius += pulse;
        glowRadius += pulse * 2;
      } else if (node.state === 'visiting') {
        radius += Math.sin(animationTime * 10) * 1.5;
      }

      if (isHovered) {
        radius += 3;
      }

      ctx.save();
      // Apply shadow glow
      if (colorScheme.glow !== 'transparent') {
        ctx.shadowColor = colorScheme.glow;
        ctx.shadowBlur = glowRadius;
      }

      // Draw main circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.restore();

      // Spinning border ring for active/visiting node
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      if (node.state === 'visiting') {
        ctx.setLineDash([12, 6]);
        ctx.lineDashOffset = animationTime * 50;
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Selected indicator
      if (selectedNodeId === node.id) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 7, 0, 2 * Math.PI);
        ctx.strokeStyle = '#22d3ee'; // beautiful cyan border
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(34, 211, 238, 0.6)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      // Draw label
      ctx.fillStyle = colorScheme.text;
      ctx.font = `bold ${isHovered ? '15px' : '13px'} system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      // Draw checkmark icon if visited
      if (node.state === 'visited') {
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(node.x + radius - 3, node.y - radius + 3, 7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(node.x + radius - 6, node.y - radius + 3);
        ctx.lineTo(node.x + radius - 4, node.y - radius + 5);
        ctx.lineTo(node.x + radius - 1, node.y - radius + 1);
        ctx.stroke();
      }

      // Option B: Premium Distance / Heuristic Badge above node
      if (node.distance !== undefined && node.distance !== null) {
        ctx.save();
        ctx.font = 'bold 9px monospace';
        
        let labelText = `d=${node.distance}`;
        if (node.heuristic !== undefined && node.heuristic !== null) {
          const gVal = typeof node.distance === 'number' ? node.distance : parseInt(node.distance as string, 10) || 0;
          const hVal = node.heuristic;
          const fVal = gVal + hVal;
          labelText = `f=${fVal} (g=${node.distance}, h=${hVal})`;
        }
        
        const labelWidth = ctx.measureText(labelText).width;
        const badgeW = labelWidth + 10;
        const badgeH = 14;
        const badgeX = node.x - badgeW / 2;
        const badgeY = node.y - radius - 20;

        // Draw background bubble
        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#22d3ee'; // bright cyan border
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, node.x, badgeY + badgeH / 2);
        ctx.restore();
      }
    });

  }, [nodes, edges, isDirected, hoveredNodeId, animationTime, width, height, selectedNodeId]);

  // Handle Interactive Mouse Actions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked a node
    const clickedNode = nodes.find(node => {
      const dist = Math.hypot(node.x - x, node.y - y);
      return dist <= NODE_RADIUS + 5;
    });

    // Check if clicked close to an edge weight label (midpoint of the edge)
    const clickedEdge = edges.find(edge => {
      const u = nodes.find(n => n.id === edge.source);
      const v = nodes.find(n => n.id === edge.target);
      if (!u || !v) return false;
      const midX = (u.x + v.x) / 2;
      const midY = (u.y + v.y) / 2;
      const dist = Math.hypot(midX - x, midY - y);
      return dist <= 20; // 20px radius around the weight label
    });

    if (clickedNode) {
      setDraggedNodeId(clickedNode.id);
      if (onNodeClick) onNodeClick(clickedNode.id);
    } else if (clickedEdge) {
      if (onEdgeClick) onEdgeClick(clickedEdge.source, clickedEdge.target);
    } else {
      if (onCanvasClick) onCanvasClick(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggedNodeId) {
      if (onNodeDrag) onNodeDrag(draggedNodeId, x, y);
      return;
    }

    // Check hovered state
    const hoverNode = nodes.find(node => {
      const dist = Math.hypot(node.x - x, node.y - y);
      return dist <= NODE_RADIUS + 5;
    });

    setHoveredNodeId(hoverNode ? hoverNode.id : null);
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
}
