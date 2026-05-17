"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Play, Pause, RotateCcw, ArrowRight, Info, AlertTriangle, FastForward, CheckCircle } from 'lucide-react';
import styles from './SimulatorPage.module.css';
import CanvasVisualization, { VisualNode, VisualEdge } from './CanvasVisualization';
import axios from 'axios';
import { useUserStore } from '@/store/useUserStore';
import Debugger from './Debugger';
import QuizModule from './QuizModule';
import ChatBot from './ChatBot';

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

type AlgoKey = 'BFS' | 'DFS' | 'Dijkstra' | 'AStar' | 'Kruskal' | 'BellmanFord';

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

  // Graph Editor Mode States
  const [editorMode, setEditorMode] = useState<'select' | 'add_node' | 'add_edge' | 'delete'>('select');
  const [firstSelectedNodeId, setFirstSelectedNodeId] = useState<string | null>(null);

  // Hook into our Zustand User Store
  const trackAlgorithmStart = useUserStore(state => state.trackAlgorithmStart);

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

      // Find suitable start and goal nodes dynamically
      const startNodeObj = nodes.find(n => n.id === 'A') || nodes[0];
      const goalNodeObj = nodes.find(n => n.id === 'F') || nodes[nodes.length - 1];

      // Save graph to localStorage for persistence
      try {
        localStorage.setItem('algomind_graph', JSON.stringify({
          nodes: nodes.map(n => ({ id: n.id, label: n.label, x: n.x, y: n.y })),
          edges: edges.map(e => ({ source: e.source, target: e.target, weight: e.weight }))
        }));
      } catch (e) { /* localStorage not available */ }

      const response = await axios.post('http://127.0.0.1:8000/api/algorithm/execute', {
        graph: {
          nodes: nodes.map(n => ({ id: n.id, label: n.label, x: n.x, y: n.y })),
          edges: edges.map(e => ({ source: e.source, target: e.target, weight: e.weight })),
          is_directed: isDirected
        },
        algorithm: selectedAlgo,
        start_node: startNodeObj.id,
        goal_node: goalNodeObj ? goalNodeObj.id : null
      });

      setSteps(response.data.steps);
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

    const goalNodeObj = nodes.find(n => n.id === 'F') || nodes[nodes.length - 1];

    // For Kruskal: build set of MST edges from state_snapshot
    const mstEdges: Set<string> = new Set();
    if (selectedAlgo === 'Kruskal' && currentStep.state_snapshot?.mst_edges) {
      for (const me of currentStep.state_snapshot.mst_edges) {
        mstEdges.add(`${me.source}-${me.target}`);
        mstEdges.add(`${me.target}-${me.source}`);
      }
    }

    setNodes(prev => prev.map(n => {
      let state: VisualNode['state'] = 'unvisited';
      if (n.id === activeNode) {
        state = 'visiting';
      } else if (selectedAlgo !== 'Kruskal' && goalNodeObj && n.id === goalNodeObj.id && visitedSet.has(goalNodeObj.id)) {
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
      
      if (selectedAlgo === 'Kruskal') {
        // For Kruskal: highlight MST edges as visited, active edge as visiting
        if (activeEdge && ((activeEdge[0] === e.source && activeEdge[1] === e.target) || 
            (activeEdge[0] === e.target && activeEdge[1] === e.source))) {
          state = 'visiting';
        } else if (mstEdges.has(`${e.source}-${e.target}`)) {
          state = 'visited';
        }
      } else {
        // Standard logic for path-based algorithms
        if (activeEdge && ((activeEdge[0] === e.source && activeEdge[1] === e.target) || 
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
  }, [steps, isDirected, nodes, selectedAlgo]);

  // Handle Playback Interval Timer
  useEffect(() => {
    if (isPlaying && currentStepIndex >= 0 && currentStepIndex < steps.length - 1) {
      const delay = 1000 / speed;
      playbackTimerRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, delay);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => {
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    };
  }, [isPlaying, currentStepIndex, steps.length, speed]);

  // Synchronize rendering state when step index moves
  useEffect(() => {
    if (currentStepIndex >= 0 && steps.length > 0) {
      applyStep(currentStepIndex);
    }
  }, [currentStepIndex, steps, applyStep]);

  const handleReset = () => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(-1);
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

        const weightStr = prompt('Enter edge weight (positive integer):', '1');
        if (weightStr === null) {
          setFirstSelectedNodeId(null);
          return;
        }
        const weight = parseInt(weightStr, 10);
        if (isNaN(weight) || weight <= 0) {
          setError('Edge weight must be a positive integer.');
          setFirstSelectedNodeId(null);
          return;
        }

        const newEdge: VisualEdge = {
          source: firstSelectedNodeId,
          target: nodeId,
          weight,
          state: 'unvisited'
        };
        setEdges(prev => [...prev, newEdge]);
        setFirstSelectedNodeId(null);
        setError(null);
      }
    }
  };

  const handleEdgeClick = (source: string, target: string) => {
    if (editorMode === 'delete') {
      setEdges(prev => prev.filter(e => !(e.source === source && e.target === target)));
    }
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
                  onClick={() => { setEditorMode('select'); setFirstSelectedNodeId(null); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    editorMode === 'select'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  👆 Move & Drag
                </button>
                <button
                  onClick={() => { setEditorMode('add_node'); setFirstSelectedNodeId(null); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    editorMode === 'add_node'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  ➕ Add Node
                </button>
                <button
                  onClick={() => { setEditorMode('add_edge'); setFirstSelectedNodeId(null); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    editorMode === 'add_edge'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  🔗 Add Edge {firstSelectedNodeId && `(From ${firstSelectedNodeId}...)`}
                </button>
                <button
                  onClick={() => { setEditorMode('delete'); setFirstSelectedNodeId(null); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    editorMode === 'delete'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  ❌ Delete
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleClearGraph}
                className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/40 border border-red-900/40 hover:border-red-500/30 rounded-lg text-xs font-bold text-red-400 transition-colors cursor-pointer"
              >
                🧹 Clear
              </button>
              <button
                onClick={handleResetToDefault}
                className="px-3 py-1.5 bg-gray-800/40 hover:bg-gray-700/50 border border-gray-700/60 hover:border-gray-500/40 rounded-lg text-xs font-bold text-gray-200 transition-colors cursor-pointer"
              >
                🔄 Restore Default
              </button>
            </div>
          </div>

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
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={styles.actionButton}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button onClick={handleReset} className={styles.actionButton}>
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
          <div>
            <h3 className={styles.sectionTitle}>Select Algorithm</h3>
            <select
              className={styles.selectInput}
              value={selectedAlgo}
              onChange={(e) => {
                setSelectedAlgo(e.target.value as AlgoKey);
                handleReset();
              }}
            >
              <option value="BFS">Breadth-First Search</option>
              <option value="DFS">Depth-First Search</option>
              <option value="Dijkstra">Dijkstra&apos;s Shortest Path</option>
              <option value="AStar">A* Heuristic Search</option>
              <option value="Kruskal">Kruskal&apos;s MST</option>
              <option value="BellmanFord">Bellman-Ford</option>
            </select>
          </div>

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

          {/* Quiz Module */}
          <QuizModule
            algorithm={selectedAlgo}
            studentId={useUserStore.getState().user?.id}
            onQuizComplete={(result) => {
              if (result.passed) {
                useUserStore.getState().trackAlgorithmMastered(selectedAlgo);
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
