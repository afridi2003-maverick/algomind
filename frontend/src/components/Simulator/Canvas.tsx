"use client";
import React, { useRef, useEffect, useState } from 'react';
import { useGraphStore } from '../../hooks/useGraphStore';
import { useSimulation } from '../../hooks/useSimulation';

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { nodes, edges, addNode } = useGraphStore();
  const { steps, currentStepIndex } = useSimulation();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      setDimensions({
        width: containerRef.current?.clientWidth || 0,
        height: containerRef.current?.clientHeight || 0
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Get current simulation state if any
    const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
    const visited = currentStep ? new Set(currentStep.visited) : new Set();
    const frontier = currentStep ? new Set(currentStep.frontier) : new Set();
    const activeNode = currentStep?.node;
    const activeNodes = currentStep ? new Set(currentStep.nodes_involved) : new Set();
    
    // Draw edges
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      let edgeColor = '#4B5563'; // gray-600
      let lineWidth = 2;

      if (currentStep?.edge && 
         (currentStep.edge[0] === edge.source && currentStep.edge[1] === edge.target) || 
         (currentStep?.edge && currentStep.edge[0] === edge.target && currentStep.edge[1] === edge.source)) {
        edgeColor = '#10B981'; // emerald-500
        lineWidth = 4;
      }

      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Draw weight if any
      if (edge.weight !== 1) {
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        ctx.fillStyle = '#1F2937'; // bg-gray-800
        ctx.fillRect(midX - 10, midY - 10, 20, 20);
        ctx.fillStyle = '#E5E7EB'; // text-gray-200
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.weight.toString(), midX, midY);
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      let fillColor = '#1F2937'; // bg-gray-800
      let strokeColor = '#4B5563'; // border-gray-600
      let lineWidth = 2;
      let radius = 20;

      if (activeNode === node.id) {
        fillColor = '#EF4444'; // red-500
        strokeColor = '#FCA5A5'; // red-300
        lineWidth = 4;
        radius = 24;
      } else if (activeNodes.has(node.id)) {
        fillColor = '#F59E0B'; // amber-500
        strokeColor = '#FDE68A'; // amber-200
        lineWidth = 3;
      } else if (visited.has(node.id)) {
        fillColor = '#10B981'; // emerald-500
        strokeColor = '#6EE7B7'; // emerald-300
      } else if (frontier.has(node.id)) {
        fillColor = '#3B82F6'; // blue-500
        strokeColor = '#93C5FD'; // blue-300
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
      
      // Node distances (if in dijkstra snapshot)
      if (currentStep?.state_snapshot?.distance && currentStep.state_snapshot.distance[node.id] !== undefined) {
         const dist = currentStep.state_snapshot.distance[node.id];
         const distStr = dist === null || dist === Infinity ? '∞' : dist.toString();
         ctx.fillStyle = '#9CA3AF'; // gray-400
         ctx.font = '12px monospace';
         ctx.fillText(distStr, node.x, node.y - radius - 10);
      }
    });
  }, [nodes, edges, dimensions, steps, currentStepIndex]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Basic node addition for demo
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add node
    addNode({
      label: String.fromCharCode(65 + nodes.length), // A, B, C...
      x,
      y
    });
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvasClick}
        className="cursor-crosshair absolute inset-0 z-10"
      />
    </div>
  );
}
