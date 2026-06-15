"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Play, Pause, RotateCcw, ArrowRight, ArrowLeft, Info, AlertTriangle, FastForward, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './SimulatorPage.module.css';
import CanvasVisualization, { VisualNode, VisualEdge } from './CanvasVisualization';
import axios from 'axios';
import { useUserStore } from '@/store/useUserStore';
import Debugger from './Debugger';
import QuizModule from './QuizModule';
import ChatBot from './ChatBot';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const INITIAL_NODES: VisualNode[] = [
  { id: 'A', label: 'A', x: 150, y: 250, state: 'unvisited' },
  { id: 'B', label: 'B', x: 300, y: 130, state: 'unvisited' },
  { id: 'C', label: 'C', x: 300, y: 370, state: 'unvisited' },
  { id: 'D', label: 'D', x: 480, y: 180, state: 'unvisited' },
  { id: 'E', label: 'E', x: 480, y: 320, state: 'unvisited' },
  { id: 'F', label: 'F', x: 650, y: 250, state: 'unvisited' },
];

const INITIAL_EDGES: VisualEdge[] = [
  { source: 'A', target: 'B', weight: 4, state: 'unvisited' },
  { source: 'A', target: 'C', weight: 2, state: 'unvisited' },
  { source: 'B', target: 'C', weight: 5, state: 'unvisited' },
  { source: 'B', target: 'D', weight: 10, state: 'unvisited' },
  { source: 'C', target: 'E', weight: 3, state: 'unvisited' },
  { source: 'D', target: 'E', weight: 4, state: 'unvisited' },
  { source: 'D', target: 'F', weight: 11, state: 'unvisited' },
  { source: 'E', target: 'F', weight: 2, state: 'unvisited' },
];

type AlgoKey = 'BFS' | 'DFS' | 'Dijkstra' | 'AStar' | 'Kruskal' | 'BellmanFord' | 'Prim';

const ALGORITHM_DETAILS: Record<AlgoKey, { name: string; timeComplexity: string; spaceComplexity: string; optimal: string; description: string }> = {
  BFS: {
    name: 'Breadth-First Search',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    optimal: 'Yes (Unweighted Shortest Path)',
    description: 'Explores the graph level-by-level starting from a source node. Guarantees the shortest path for unweighted graphs using a Queue (FIFO) structure.',
  },
  DFS: {
    name: 'Depth-First Search',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    optimal: 'No',
    description: 'Explores as far as possible along each branch before backtracking. Uses a Stack (LIFO) structure to explore deep pathways, useful for path-finding, cycle detection, and topological sorting.',
  },
  Dijkstra: {
    name: "Dijkstra's Shortest Path",
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    optimal: 'Yes (Weighted Graphs, Non-negative)',
    description: 'Finds the shortest path from a source node to all other nodes in a weighted graph. Uses a Priority Queue to repeatedly explore the node with the lowest tentative distance.',
  },
  AStar: {
    name: 'A* Heuristic Search',
    timeComplexity: 'O(E log V)',
    spaceComplexity: 'O(V)',
    optimal: 'Yes (Admissible Heuristic)',
    description: 'Finds the shortest path from a start node to a goal node using both exact path cost g(n) and heuristic estimate h(n). Evaluates nodes based on f(n) = g(n) + h(n).',
  },
  Kruskal: {
    name: "Kruskal's MST",
    timeComplexity: 'O(E log E)',
    spaceComplexity: 'O(V + E)',
    optimal: 'Yes (Minimum Spanning Tree)',
    description: 'Finds the Minimum Spanning Tree by greedily selecting edges in ascending weight order. Uses Union-Find for cycle detection.',
  },
  BellmanFord: {
    name: 'Bellman-Ford Shortest Path',
    timeComplexity: 'O(V × E)',
    spaceComplexity: 'O(V)',
    optimal: 'Yes (Handles Negative Weights)',
    description: 'Finds shortest paths from a single source, even with negative edge weights. Detects negative weight cycles in V iterations.',
  },
  Prim: {
    name: "Prim's MST",
    timeComplexity: 'O(E log V)',
    spaceComplexity: 'O(V)',
    optimal: 'Yes (Minimum Spanning Tree)',
    description: "Finds the Minimum Spanning Tree by growing a tree from a start vertex, repeatedly adding the cheapest edge to an unvisited node.",
  }
};

export function SimulatorPage() {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgoKey>('BFS');
  const [nodes, setNodes] = useState<VisualNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<VisualEdge[]>(INITIAL_EDGES);
  const [isDirected, setIsDirected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // multiplier
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  // Dynamic start/goal node IDs — computed when simulation starts
  const [startNodeId, setStartNodeId] = useState<string | null>(null);
  const [goalNodeId, setGoalNodeId] = useState<string | null>(null);

  const activeStartId = startNodeId && nodes.some(n => n.id === startNodeId)
    ? startNodeId
    : (nodes[0]?.id || null);

  const activeGoalId = goalNodeId && nodes.some(n => n.id === goalNodeId)
    ? goalNodeId
    : (selectedAlgo === 'AStar' && nodes.length > 0 ? nodes[nodes.length - 1].id : null);


  // Graph Editor Mode States
  const [editorMode, setEditorMode] = useState<'select' | 'add_node' | 'add_edge' | 'delete'>('select');
  const [firstSelectedNodeId, setFirstSelectedNodeId] = useState<string | null>(null);

  // Inline edge weight input (replaces prompt())
  const [pendingEdgeTarget, setPendingEdgeTarget] = useState<string | null>(null);
  const [editingEdge, setEditingEdge] = useState<{ source: string; target: string } | null>(null);
  const [edgeWeightInput, setEdgeWeightInput] = useState('1');

  // Hook into our Zustand User Store (proper hook subscriptions, not getState())
  const trackAlgorithmStart = useUserStore(state => state.trackAlgorithmStart);
  const trackAlgorithmMastered = useUserStore(state => state.trackAlgorithmMastered);
  const userId = useUserStore(state => state.user?.id);

  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set up details for active algorithm
  const activeAlgoDetails = ALGORITHM_DETAILS[selectedAlgo];

  // Request Algorithm steps from backend API
  const handleStartSimulation = async () => {
    if (nodes.length === 0) {
      setError('Please add at least one node to start simulation.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Track start in student userStore
      trackAlgorithmStart(selectedAlgo);

      const startNode = activeStartId;
      const goalNode = activeGoalId;

      if (!startNode) {
        setError('Please select a valid start node.');
        setLoading(false);
        return;
      }

      // Store the chosen start/goal in state for use in applyStep and results
      setStartNodeId(startNode);
      setGoalNodeId(goalNode);

      // Save graph to localStorage for persistence
      try {
        localStorage.setItem('algomind_graph', JSON.stringify({
          nodes: nodes.map(n => ({ id: n.id, label: n.label, x: n.x, y: n.y })),
          edges: edges.map(e => ({ source: e.source, target: e.target, weight: e.weight }))
        }));
      } catch (e) { /* localStorage not available */ }

      const response = await axios.post(`${API_URL}/api/algorithm/execute`, {
        graph: {
          nodes: nodes.map(n => ({ id: n.id, label: n.label, x: n.x, y: n.y })),
          edges: edges.map(e => ({ source: e.source, target: e.target, weight: e.weight })),
          is_directed: isDirected
        },
        algorithm: selectedAlgo,
        start_node: startNode,
        goal_node: goalNode
      });

      setSteps(response.data.steps);
      setSimulationResult(response.data);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  // Load graph from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('algomind_graph');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nodes?.length > 0) {
          setNodes(parsed.nodes.map((n: any) => ({ ...n, state: 'unvisited' as const })));
          setEdges(parsed.edges.map((e: any) => ({ ...e, state: 'unvisited' as const })));
        }
      }
    } catch (e) { /* localStorage not available or corrupt */ }
  }, []);

  // Auto-dismiss errors after 6 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Move graph node during interactive drag
  const handleNodeDrag = useCallback((nodeId: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x, y } : n));
  }, []);

  // Update Visual State of Nodes and Edges based on step
  const applyStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    const currentStep = steps[stepIndex];
    const visitedSet = new Set(currentStep.visited || []);
    const frontierSet = new Set(currentStep.frontier || []);
    const activeNode = currentStep.node;
    const activeEdge = currentStep.edge; // tuple e.g., ['A', 'B']

    // Use dynamic goal node from state instead of hardcoded 'F'
    const currentGoalId = activeGoalId;

    // For Kruskal & Prim: build set of MST edges from state_snapshot
    const mstEdges: Set<string> = new Set();
    const isMstAlgo = selectedAlgo === 'Kruskal' || selectedAlgo === 'Prim';
    if (isMstAlgo && currentStep.state_snapshot?.mst_edges) {
      for (const me of currentStep.state_snapshot.mst_edges) {
        mstEdges.add(`${me.source}-${me.target}`);
        mstEdges.add(`${me.target}-${me.source}`);
      }
    }

    // Identify final shortest path for Dijkstra, A*, or Bellman-Ford
    const isFinalStep = stepIndex === steps.length - 1;
    const isPathAlgo = selectedAlgo === 'Dijkstra' || selectedAlgo === 'AStar' || selectedAlgo === 'BellmanFord';
    let pathNodes: Set<string> = new Set();
    let pathEdges: Set<string> = new Set();

    if (isFinalStep && isPathAlgo && simulationResult) {
      const path = getShortestPath();
      if (path.length > 0) {
        pathNodes = new Set(path);
        for (let i = 0; i < path.length - 1; i++) {
          pathEdges.add(`${path[i]}-${path[i+1]}`);
          pathEdges.add(`${path[i+1]}-${path[i]}`);
        }
      }
    }

    setNodes(prev => prev.map(n => {
      let state: VisualNode['state'] = 'unvisited';
      if (pathNodes.has(n.id)) {
        state = 'goal';
      } else if (n.id === activeNode) {
        state = 'visiting';
      } else if (!isMstAlgo && currentGoalId && n.id === currentGoalId && visitedSet.has(currentGoalId)) {
        state = 'goal';
      } else if (visitedSet.has(n.id)) {
        state = 'visited';
      } else if (frontierSet.has(n.id)) {
        state = 'frontier';
      }

      // Check distance updates
      let distance = undefined;
      if (currentStep.state_snapshot?.distance && currentStep.state_snapshot.distance[n.id] !== undefined) {
        const val = currentStep.state_snapshot.distance[n.id];
        distance = val === null || val === Infinity ? '∞' : val;
      }

      // Check heuristic updates
      let heuristic = undefined;
      if (currentStep.state_snapshot?.heuristics && currentStep.state_snapshot.heuristics[n.id] !== undefined) {
        heuristic = currentStep.state_snapshot.heuristics[n.id];
      }

      return { ...n, state, distance, heuristic };
    }));

    setEdges(prev => prev.map(e => {
      let state: VisualEdge['state'] = 'unvisited';
      
      if (selectedAlgo === 'Kruskal' || selectedAlgo === 'Prim') {
        // For Kruskal & Prim: highlight MST edges as visited, active edge as visiting
        if (activeEdge && ((activeEdge[0] === e.source && activeEdge[1] === e.target) || 
            (activeEdge[0] === e.target && activeEdge[1] === e.source))) {
          state = 'visiting';
        } else if (mstEdges.has(`${e.source}-${e.target}`)) {
          state = 'visited';
        }
      } else {
        // Path highlighting on final step
        if (pathEdges.has(`${e.source}-${e.target}`)) {
          state = 'goal';
        } else if (activeEdge && ((activeEdge[0] === e.source && activeEdge[1] === e.target) || 
            (!isDirected && activeEdge[0] === e.target && activeEdge[1] === e.source))) {
          state = 'visiting';
        } else if (visitedSet.has(e.source) && visitedSet.has(e.target)) {
          state = 'visited';
        } else if (frontierSet.has(e.source) || frontierSet.has(e.target)) {
          state = 'frontier';
        }
      }
      return { ...e, state };
    }));
  }, [steps, isDirected, activeGoalId, selectedAlgo, simulationResult, activeStartId]);

  // Handle Playback Interval Timer
  useEffect(() => {
    if (isPlaying && currentStepIndex >= 0 && currentStepIndex < steps.length - 1) {
      const delay = 1000 / speed;
      playbackTimerRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, delay);
    } else if (currentStepIndex >= steps.length - 1 && steps.length > 0) {
      setIsPlaying(false);
    }
    return () => {
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    };
  }, [isPlaying, currentStepIndex, steps.length, speed]);

  const togglePlay = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setIsPlaying(false);
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setIsPlaying(false);
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const getShortestPath = () => {
    if (!simulationResult) return [];
    const prevMap = simulationResult.previous || simulationResult.parent_tree || {};
    const start = activeStartId;
    const goal = activeGoalId;
    if (!start || !goal) return [];
    
    const path = [];
    let curr: string | null = goal;
    const seen = new Set<string>();
    while (curr && !seen.has(curr)) {
      seen.add(curr);
      path.push(curr);
      if (curr === start) break;
      curr = prevMap[curr] || null;
    }
    if (path[path.length - 1] === start) {
      return path.reverse();
    }
    return [];
  };

  // Synchronize rendering state when step index moves
  useEffect(() => {
    if (currentStepIndex >= 0 && steps.length > 0) {
      applyStep(currentStepIndex);
    }
  }, [currentStepIndex, steps, applyStep]);

  // Keyboard shortcuts: Space = play/pause, ←/→ = step backward/forward
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.code === 'Space' && steps.length > 0) {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft' && steps.length > 0) {
        e.preventDefault();
        handlePrevStep();
      } else if (e.code === 'ArrowRight' && steps.length > 0) {
        e.preventDefault();
        handleNextStep();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [steps.length, currentStepIndex, isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(-1);
    setSimulationResult(null);
    setNodes(prev => prev.map(n => ({ ...n, state: 'unvisited', distance: undefined, heuristic: undefined })));
    setEdges(prev => prev.map(e => ({ ...e, state: 'unvisited' })));
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (editorMode !== 'add_node') return;
    
    // Add custom node on click
    const nextLabel = String.fromCharCode(65 + nodes.length);
    const newNode: VisualNode = {
      id: nextLabel,
      label: nextLabel,
      x,
      y,
      state: 'unvisited'
    };
    setNodes(prev => [...prev, newNode]);
  };

  const handleNodeClick = (nodeId: string) => {
    if (editorMode === 'delete') {
      setNodes(prev => prev.filter(n => n.id !== nodeId));
      setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
    } else if (editorMode === 'add_edge') {
      if (!firstSelectedNodeId) {
        setFirstSelectedNodeId(nodeId);
      } else {
        if (firstSelectedNodeId === nodeId) {
          setFirstSelectedNodeId(null);
          return;
        }
        
        const edgeExists = edges.some(e => 
          (e.source === firstSelectedNodeId && e.target === nodeId) ||
          (!isDirected && e.source === nodeId && e.target === firstSelectedNodeId)
        );
        if (edgeExists) {
          setError('An edge already exists between these nodes.');
          setFirstSelectedNodeId(null);
          return;
        }

        // Show inline edge weight input instead of prompt()
        setPendingEdgeTarget(nodeId);
        setEdgeWeightInput('1');
      }
    }
  };

  const handleConfirmEdgeWeight = () => {
    if (!firstSelectedNodeId || !pendingEdgeTarget) return;
    
    const weight = parseInt(edgeWeightInput, 10);
    if (isNaN(weight) || weight <= 0) {
      setError('Edge weight must be a positive integer.');
      setPendingEdgeTarget(null);
      setFirstSelectedNodeId(null);
      return;
    }

    const newEdge: VisualEdge = {
      source: firstSelectedNodeId,
      target: pendingEdgeTarget,
      weight,
      state: 'unvisited'
    };
    setEdges(prev => [...prev, newEdge]);
    setFirstSelectedNodeId(null);
    setPendingEdgeTarget(null);
    setError(null);
  };

  const handleCancelEdgeWeight = () => {
    setPendingEdgeTarget(null);
    setFirstSelectedNodeId(null);
  };

  const handleEdgeClick = (source: string, target: string) => {
    if (editorMode === 'delete') {
      setEdges(prev => prev.filter(e => !(e.source === source && e.target === target)));
    } else if (editorMode === 'select') {
      const edge = edges.find(e => (e.source === source && e.target === target) || (!isDirected && e.source === target && e.target === source));
      if (edge) {
        setEditingEdge({ source: edge.source, target: edge.target });
        setEdgeWeightInput(edge.weight.toString());
      }
    }
  };

  const handleConfirmEditEdgeWeight = () => {
    if (!editingEdge) return;
    const weight = parseInt(edgeWeightInput, 10);
    if (isNaN(weight) || weight <= 0) {
      setError('Edge weight must be a positive integer.');
      setEditingEdge(null);
      return;
    }
    setEdges(prev => prev.map(e => 
      ((e.source === editingEdge.source && e.target === editingEdge.target) ||
       (!isDirected && e.source === editingEdge.target && e.target === editingEdge.source))
        ? { ...e, weight }
        : e
    ));
    setEditingEdge(null);
    setError(null);
  };

  const handleCancelEditEdgeWeight = () => {
    setEditingEdge(null);
  };

  const handleClearGraph = () => {
    handleReset();
    setNodes([]);
    setEdges([]);
    setFirstSelectedNodeId(null);
  };

  const handleResetToDefault = () => {
    handleReset();
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setFirstSelectedNodeId(null);
    setError(null);
  };

  // Step progress percentage
  const stepProgress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className={styles.pageWrapper}>
      {/* Top Navbar */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          AlgoMind Lab
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm font-semibold">
            Dashboard
          </Link>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
            Live Lab Active
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <main className={styles.mainGrid}>
        
        {/* Central Simulation Workspace */}
        <section className={styles.visualizerArea}>
          {/* Elegant Floating Mode Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/60 border border-gray-800 rounded-xl p-3 backdrop-blur shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Editor Mode:</span>
              <div className="flex bg-black/40 rounded-lg p-1 border border-gray-800/80">
                <button
                  onClick={() => { setEditorMode('select'); setFirstSelectedNodeId(null); setPendingEdgeTarget(null); setEditingEdge(null); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    editorMode === 'select'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  Select / Move
                </button>
                <button
                  onClick={() => { setEditorMode('add_node'); setFirstSelectedNodeId(null); setPendingEdgeTarget(null); setEditingEdge(null); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    editorMode === 'add_node'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  Add Node
                </button>
                <button
                  onClick={() => { setEditorMode('add_edge'); setFirstSelectedNodeId(null); setPendingEdgeTarget(null); setEditingEdge(null); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    editorMode === 'add_edge'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  Add Edge {firstSelectedNodeId && !pendingEdgeTarget && `(From ${firstSelectedNodeId}...)`}
                </button>
                <button
                  onClick={() => { setEditorMode('delete'); setFirstSelectedNodeId(null); setPendingEdgeTarget(null); setEditingEdge(null); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    editorMode === 'delete'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleClearGraph}
                className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/40 border border-red-900/40 hover:border-red-500/30 rounded-lg text-xs font-bold text-red-400 transition-colors cursor-pointer"
              >
                Clear Graph
              </button>
              <button
                onClick={handleResetToDefault}
                className="px-3 py-1.5 bg-gray-800/40 hover:bg-gray-700/50 border border-gray-700/60 hover:border-gray-500/40 rounded-lg text-xs font-bold text-gray-200 transition-colors cursor-pointer"
              >
                Restore Default
              </button>
            </div>
          </div>

          {/* Inline Edge Weight Input (replaces prompt()) */}
          {pendingEdgeTarget && firstSelectedNodeId && (
            <div className={styles.edgeWeightBar}>
              <span className="text-xs text-gray-300">
                Edge <strong className="text-cyan-400">{firstSelectedNodeId}</strong> → <strong className="text-cyan-400">{pendingEdgeTarget}</strong>:
              </span>
              <input
                type="number"
                min="1"
                value={edgeWeightInput}
                onChange={(e) => setEdgeWeightInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmEdgeWeight(); if (e.key === 'Escape') handleCancelEdgeWeight(); }}
                className={styles.edgeWeightInput}
                autoFocus
                placeholder="Weight"
              />
              <button onClick={handleConfirmEdgeWeight} className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-md text-xs font-bold text-emerald-400 transition-colors cursor-pointer">
                Confirm
              </button>
              <button onClick={handleCancelEdgeWeight} className="px-3 py-1 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700 rounded-md text-xs font-bold text-gray-400 transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          )}

          {/* Inline Edge Weight Edit Input */}
          {editingEdge && (
            <div className={styles.edgeWeightBar}>
              <span className="text-xs text-gray-300">
                Edit edge <strong className="text-cyan-400">{editingEdge.source}</strong> ⟷ <strong className="text-cyan-400">{editingEdge.target}</strong> weight:
              </span>
              <input
                type="number"
                min="1"
                value={edgeWeightInput}
                onChange={(e) => setEdgeWeightInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmEditEdgeWeight(); if (e.key === 'Escape') handleCancelEditEdgeWeight(); }}
                className={styles.edgeWeightInput}
                autoFocus
                placeholder="Weight"
              />
              <button onClick={handleConfirmEditEdgeWeight} className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-md text-xs font-bold text-emerald-400 transition-colors cursor-pointer">
                Save
              </button>
              <button onClick={handleCancelEditEdgeWeight} className="px-3 py-1 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700 rounded-md text-xs font-bold text-gray-400 transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          )}

          {/* Step Progress Bar */}
          {steps.length > 0 && (
            <div className={styles.stepProgressContainer}>
              <span className="text-xs font-mono text-gray-400">
                Step <strong className="text-gray-200">{currentStepIndex + 1}</strong> / {steps.length}
              </span>
              <div className={styles.stepProgressTrack}>
                <div className={styles.stepProgressFill} style={{ width: `${stepProgress}%` }} />
              </div>
              <span className="text-[10px] text-gray-500 hidden sm:inline">
                Space: play/pause · ←→: step
              </span>
            </div>
          )}

          <div className="flex-1 min-h-[400px] relative">
            <CanvasVisualization
              nodes={nodes}
              edges={edges}
              isDirected={isDirected}
              onNodeDrag={handleNodeDrag}
              onCanvasClick={handleCanvasClick}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              selectedNodeId={firstSelectedNodeId}
              width={750}
              height={450}
            />
          </div>

          {/* Simulation Results Panel */}
          {currentStepIndex === steps.length - 1 && steps.length > 0 && simulationResult && (
            <div className="mt-4 bg-gray-900/90 border border-emerald-500/30 rounded-xl p-5 backdrop-blur shadow-2xl transition-all duration-500 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                <div>
                  <h3 className="text-emerald-400 font-bold text-base tracking-wide uppercase">Simulation Completed</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Algorithm finished executing and converged successfully.</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Success
                </div>
              </div>

              {/* Bellman-Ford negative cycle warning */}
              {selectedAlgo === 'BellmanFord' && simulationResult.negative_cycle_detected && (
                <div className="mb-4 bg-red-950/40 border border-red-500/40 rounded-xl p-4 flex gap-3 items-start animate-pulse">
                  <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-red-400 font-bold text-sm">Negative Weight Cycle Detected!</span>
                    <p className="text-red-400/80 text-xs mt-1 leading-relaxed">
                      The graph contains a negative weight cycle. Shortest path distances are undefined for nodes reachable through this cycle.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Metrics */}
                <div className="space-y-4">
                  {/* BFS / DFS Traversal Results */}
                  {(selectedAlgo === 'BFS' || selectedAlgo === 'DFS') && simulationResult.visited_order && (
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Node Traversal Order</span>
                      <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-3 rounded-lg border border-gray-800">
                        {simulationResult.visited_order.map((nodeId: string, idx: number) => (
                          <React.Fragment key={nodeId}>
                            <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded text-xs font-mono font-bold">
                              {nodeId}
                            </span>
                            {idx < simulationResult.visited_order.length - 1 && (
                              <span className="text-gray-600 text-xs">-&gt;</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs">
                        <span className="text-gray-400">Total Visited Nodes: <strong className="text-gray-200">{simulationResult.visited_order.length}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Dijkstra / BellmanFord / AStar Results */}
                  {(selectedAlgo === 'Dijkstra' || selectedAlgo === 'BellmanFord' || selectedAlgo === 'AStar') && (
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Shortest Path Found</span>
                      {(() => {
                        const path = getShortestPath();
                        const goal = goalNodeId || nodes[nodes.length - 1]?.id;
                        const distKey = 'distances';
                        const distMap = simulationResult[distKey] || {};
                        const cost = goal ? distMap[goal] : null;

                        if (path.length > 0) {
                          return (
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-3 rounded-lg border border-gray-800 mb-2">
                                {path.map((nodeId: string, idx: number) => (
                                  <React.Fragment key={nodeId}>
                                    <span className="bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded text-xs font-mono font-bold">
                                      {nodeId}
                                    </span>
                                    {idx < path.length - 1 && (
                                      <span className="text-gray-600 text-xs">-&gt;</span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                              <div className="flex items-center gap-6 text-xs mt-2.5">
                                <span className="text-gray-400">Total Path Cost: <strong className="text-cyan-400 text-sm font-mono font-bold">{cost !== null && cost !== undefined ? cost : 'N/A'}</strong></span>
                                <span className="text-gray-400">Hop Count: <strong className="text-gray-200">{path.length - 1}</strong></span>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="bg-red-950/20 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
                              No valid path could be found from start node to the destination.
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}

                  {/* Kruskal & Prim MST Results */}
                  {(selectedAlgo === 'Kruskal' || selectedAlgo === 'Prim') && simulationResult.mst_edges && (
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Minimum Spanning Tree Edges</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-black/40 p-3 rounded-lg border border-gray-800 mb-2">
                        {simulationResult.mst_edges.map((edge: any, idx: number) => (
                          <div key={idx} className="bg-emerald-950/30 text-emerald-400 border border-emerald-500/10 px-2 py-1 rounded text-xs font-mono font-semibold flex items-center justify-between">
                            <span>{edge.source} - {edge.target}</span>
                            <span className="text-gray-400 text-[10px] bg-black/40 px-1.5 py-0.5 rounded">w={edge.weight}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs">
                        <span className="text-gray-400">Total MST Weight: <strong className="text-emerald-400 text-sm font-mono font-bold">{simulationResult.total_weight}</strong></span>
                        <span className="text-gray-400">Edge Count: <strong className="text-gray-200">{simulationResult.mst_edges.length}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Analysis & Complexity */}
                <div className="bg-black/30 border border-gray-800 rounded-lg p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-3">Theoretical Complexity and Performance</span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-gray-800/60 pb-1.5">
                        <span className="text-gray-400">Time Complexity (Big O)</span>
                        <span className="text-gray-200 font-mono font-bold">{activeAlgoDetails.timeComplexity}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800/60 pb-1.5">
                        <span className="text-gray-400">Space Complexity</span>
                        <span className="text-gray-200 font-mono font-bold">{activeAlgoDetails.spaceComplexity}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800/60 pb-1.5">
                        <span className="text-gray-400">Is Optimal Pathfinding</span>
                        <span className="text-gray-200 font-semibold">{activeAlgoDetails.optimal}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-800/80 text-[11px] text-gray-400 leading-relaxed">
                    This execution has been tracked and analyzed. You can now use the ChatBot below to ask questions about how the steps were executed, or attempt the quiz in the sidebar to verify your understanding!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Playback Control Bar */}
          <div className={styles.controlsPanel}>
            <div className={styles.buttonGroup}>
              {steps.length === 0 ? (
                <button 
                  onClick={handleStartSimulation} 
                  disabled={loading}
                  className={`${styles.actionButton} ${styles.primaryButton}`}
                >
                  {loading ? 'Initializing...' : 'Run Simulation'}
                </button>
              ) : (
                <>
                  <button 
                    onClick={handlePrevStep}
                    disabled={currentStepIndex <= 0}
                    className={styles.actionButton}
                    title="Previous Step (←)"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className={styles.actionButton}
                    title="Play/Pause (Space)"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button 
                    onClick={handleNextStep}
                    disabled={currentStepIndex >= steps.length - 1}
                    className={styles.actionButton}
                    title="Next Step (→)"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button onClick={handleReset} className={styles.actionButton} title="Reset">
                    <RotateCcw size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Simulation speed control */}
            <div className={styles.sliderContainer}>
              <span>Speed: {speed}x</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className={styles.slider}
              />
            </div>
          </div>

          {/* Step Inspector/Debugger log */}
          <Debugger
            algorithm={selectedAlgo}
            currentStep={currentStepIndex >= 0 ? steps[currentStepIndex] : null}
            nodes={nodes}
            stepIndex={currentStepIndex}
            totalSteps={steps.length}
          />
        </section>

        {/* Sidebar Info Panel */}
        <aside className={styles.sidebar}>
          {/* Algorithm Card Selector */}
          <div>
            <h3 className={styles.sectionTitle}>Select Algorithm</h3>
            <div className={styles.algoCardGrid}>
              {(Object.keys(ALGORITHM_DETAILS) as AlgoKey[]).map(key => {
                const details = ALGORITHM_DETAILS[key];
                const isActive = selectedAlgo === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedAlgo(key);
                      handleReset();
                    }}
                    className={`${styles.algoCard} ${isActive ? styles.algoCardActive : ''}`}
                  >
                    <span className={styles.algoCardName}>{details.name}</span>
                    <span className={styles.algoCardBadge}>{details.timeComplexity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simulation Settings */}
          {selectedAlgo !== 'Kruskal' && selectedAlgo !== 'Prim' && (
            <div>
              <h3 className={styles.sectionTitle}>Simulation Settings</h3>
              <div className="bg-gray-950/40 p-4 border border-gray-800/80 rounded-xl space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Start Node</label>
                  <select
                    value={activeStartId || ''}
                    onChange={(e) => setStartNodeId(e.target.value)}
                    disabled={steps.length > 0}
                    className="w-full bg-gray-900/80 border border-gray-800 rounded-lg px-3 py-2 text-xs font-semibold text-gray-200 outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>Node {n.label}</option>
                    ))}
                  </select>
                </div>
                {selectedAlgo !== 'BFS' && selectedAlgo !== 'DFS' && selectedAlgo !== 'Dijkstra' && selectedAlgo !== 'BellmanFord' ? null : (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Goal Node (Optional)</label>
                    <select
                      value={activeGoalId || ''}
                      onChange={(e) => setGoalNodeId(e.target.value || null)}
                      disabled={steps.length > 0}
                      className="w-full bg-gray-900/80 border border-gray-800 rounded-lg px-3 py-2 text-xs font-semibold text-gray-200 outline-none focus:border-cyan-500/50 transition-colors"
                    >
                      <option value="">None (Traverse fully)</option>
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>Node {n.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedAlgo === 'AStar' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Goal Node (Required)</label>
                    <select
                      value={activeGoalId || ''}
                      onChange={(e) => setGoalNodeId(e.target.value)}
                      disabled={steps.length > 0}
                      className="w-full bg-gray-900/80 border border-gray-800 rounded-lg px-3 py-2 text-xs font-semibold text-gray-200 outline-none focus:border-cyan-500/50 transition-colors"
                    >
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>Node {n.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Algorithm Info */}
          <div>
            <h3 className={styles.sectionTitle}>Algorithm Profile</h3>
            <div className={styles.infoCard}>
              <h4 className="text-lg font-bold text-gray-100 mb-2">{activeAlgoDetails.name}</h4>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{activeAlgoDetails.description}</p>
              
              <div className="space-y-2 border-t border-gray-800 pt-3">
                <div className={styles.complexityRow}>
                  <span>Time Complexity</span>
                  <span className={styles.badge}>{activeAlgoDetails.timeComplexity}</span>
                </div>
                <div className={styles.complexityRow}>
                  <span>Space Complexity</span>
                  <span className={styles.badge}>{activeAlgoDetails.spaceComplexity}</span>
                </div>
                <div className={styles.complexityRow}>
                  <span>Optimal</span>
                  <span className="text-gray-300 font-medium text-xs">{activeAlgoDetails.optimal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div>
            <h3 className={styles.sectionTitle}>Legend</h3>
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-950/40 p-4 border border-gray-800/80 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-gray-700 border border-gray-600 block"></span>
                <span>Unvisited</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-blue-900 border border-blue-500 block"></span>
                <span>Frontier</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-orange-900 border border-orange-500 block"></span>
                <span>Visiting</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-900 border border-emerald-500 block"></span>
                <span>Visited</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 flex gap-3 text-red-400 text-xs animate-pulse">
              <AlertTriangle size={18} className="shrink-0" />
              <div>
                <span className="font-bold">Error Occurred</span>
                <p className="mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Quiz Module — using proper hook subscription */}
          <QuizModule
            algorithm={selectedAlgo}
            studentId={userId}
            onQuizComplete={(result) => {
              if (result.passed) {
                trackAlgorithmMastered(selectedAlgo);
              }
            }}
          />
        </aside>
      </main>

      {/* Floating AI Chatbot */}
      <ChatBot
        algorithm={selectedAlgo}
        graphSize={nodes.length}
        currentStep={currentStepIndex >= 0 ? steps[currentStepIndex] : null}
      />
    </div>
  );
}
