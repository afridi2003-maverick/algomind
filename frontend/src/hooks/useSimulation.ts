import { create } from 'zustand';
import axios from 'axios';
import { NodeData, EdgeData } from './useGraphStore';

interface SimulationStep {
  step_number: number;
  action: string;
  node?: string;
  nodes_involved: string[];
  edge?: [string, string, number?];
  frontier: string[];
  visited: string[];
  state_snapshot: any;
  message: string;
}

interface SimulationState {
  steps: SimulationStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  isSimulating: boolean;
  algorithm: string;
  result: any;
  error: string | null;
  
  startSimulation: (graph: { nodes: NodeData[], edges: EdgeData[], is_directed: boolean }, algorithm: string, startNode: string) => Promise<void>;
  nextStep: () => void;
  prevStep: () => void;
  setPlaying: (playing: boolean) => void;
  resetSimulation: () => void;
}

export const useSimulation = create<SimulationState>((set, get) => ({
  steps: [],
  currentStepIndex: -1,
  isPlaying: false,
  isSimulating: false,
  algorithm: '',
  result: null,
  error: null,

  startSimulation: async (graph, algorithm, startNode) => {
    set({ isSimulating: true, error: null });
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/algorithm/execute', {
        graph,
        algorithm,
        start_node: startNode
      });
      
      set({ 
        steps: response.data.steps, 
        result: response.data,
        algorithm,
        currentStepIndex: 0,
        isSimulating: false,
        isPlaying: false
      });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || err.message, isSimulating: false });
    }
  },

  nextStep: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      set({ isPlaying: false });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  setPlaying: (playing) => set({ isPlaying: playing }),
  
  resetSimulation: () => set({ 
    steps: [], 
    currentStepIndex: -1, 
    isPlaying: false, 
    result: null,
    error: null
  })
}));
