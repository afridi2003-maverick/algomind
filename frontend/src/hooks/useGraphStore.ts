import { create } from 'zustand';

export interface NodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
}

export interface EdgeData {
  source: string;
  target: string;
  weight: number;
  directed: boolean;
  color?: string;
}

interface GraphState {
  nodes: NodeData[];
  edges: EdgeData[];
  isDirected: boolean;
  addNode: (node: Omit<NodeData, 'id'>) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  addEdge: (edge: EdgeData) => void;
  clearGraph: () => void;
  setGraph: (nodes: NodeData[], edges: EdgeData[]) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  isDirected: false,
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, { ...node, id: `n${crypto.randomUUID().slice(0, 8)}` }]
  })),
  
  updateNodePosition: (id, x, y) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, x, y } : n)
  })),
  
  addEdge: (edge) => set((state) => {
    // Prevent duplicate edges if undirected
    const exists = state.edges.some(e => 
      (e.source === edge.source && e.target === edge.target) || 
      (!state.isDirected && e.source === edge.target && e.target === edge.source)
    );
    if (exists) return state;
    return { edges: [...state.edges, edge] };
  }),
  
  clearGraph: () => set({ nodes: [], edges: [] }),
  
  setGraph: (nodes, edges) => set({ nodes, edges }),
}));
