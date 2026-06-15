import React from 'react';
import { Info, HelpCircle, Layers, Table, Terminal } from 'lucide-react';

type AlgoKey = 'BFS' | 'DFS' | 'Dijkstra' | 'AStar' | 'Kruskal' | 'BellmanFord' | 'Prim';

interface DebuggerProps {
  algorithm: AlgoKey;
  currentStep: any; // Step object from active simulation frame
  nodes: { id: string; label: string }[];
  stepIndex: number;
  totalSteps: number;
}

export default function Debugger({
  algorithm,
  currentStep,
  nodes,
  stepIndex,
  totalSteps,
}: DebuggerProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  if (!currentStep) {
    return (
      <div className="bg-gray-900/40 border border-gray-800/80 rounded-xl p-6 text-center text-gray-500 backdrop-blur">
        <Info className="mx-auto text-gray-600 mb-2" size={24} />
        <p className="text-sm font-semibold">Simulation inactive</p>
        <p className="text-xs text-gray-600 mt-1">Run the simulator to inspect live variables, stack/queue states, and path trees.</p>
      </div>
    );
  }

  const { action, node, frontier = [], visited = [], state_snapshot = {}, message } = currentStep;
  const visitedSet = new Set(visited);

  // Extract distances and parents
  const distances = state_snapshot.distance || state_snapshot.distances || {};
  const parents = state_snapshot.parent || state_snapshot.previous || state_snapshot.parent_tree || {};

  // For Dijkstra & AStar, recreate PQ based on unvisited nodes that have a finite distance
  let pqElements: { node: string; cost: number; label: string }[] = [];
  if (algorithm === 'Dijkstra' || algorithm === 'AStar') {
    pqElements = nodes
      .filter(n => !visitedSet.has(n.id) && distances[n.id] !== undefined && distances[n.id] !== null && distances[n.id] !== '∞')
      .map(n => {
        const gVal = typeof distances[n.id] === 'number' ? distances[n.id] : parseInt(distances[n.id], 10) || 0;
        let cost = gVal;
        let label = `d=${gVal}`;
        
        if (algorithm === 'AStar' && state_snapshot.heuristics && state_snapshot.heuristics[n.id] !== undefined) {
          const hVal = state_snapshot.heuristics[n.id];
          cost = gVal + hVal;
          label = `f=${cost.toFixed(1)} (g=${gVal}, h=${hVal})`;
        }
        
        return {
          node: n.id,
          cost,
          label,
        };
      })
      .sort((a, b) => a.cost - b.cost);
  }

  // For Kruskal: extract MST edges and DSU state
  const mstEdges = state_snapshot.mst_edges || [];
  const remainingEdges = state_snapshot.remaining_edges || [];
  const dsuParents = state_snapshot.dsu_parents || {};
  const dsuRanks = state_snapshot.dsu_ranks || {};

  // For Bellman-Ford: extract iteration info
  const iteration = state_snapshot.iteration || 0;
  const negativeCycle = state_snapshot.negative_cycle_detected || false;

  // Get action details
  const getActionBadgeColor = (act: string) => {
    switch (act) {
      case 'initialize': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'visit_node': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'explore':
      case 'relax_edge': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'add_edge': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'skip_edge': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'goal_reached': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="flex flex-col bg-gray-900/60 border border-gray-800 rounded-xl p-5 backdrop-blur shadow-2xl gap-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-800/80 pb-3.5 gap-3">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-teal-400" />
          <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wider">
            Execution Debugger
          </h3>
          <span className="text-xs bg-teal-500/10 border border-teal-500/25 px-2 py-0.5 rounded-full text-teal-400 font-semibold font-mono">
            {algorithm}
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs font-mono text-gray-400 bg-black/40 px-2.5 py-1 rounded border border-gray-800">
            Step {stepIndex + 1} / {totalSteps}
          </span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1.5 bg-teal-500/10 hover:bg-teal-500/15 border border-teal-500/20 px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            {isCollapsed ? 'Expand Details ▾' : 'Collapse Details ▴'}
          </button>
        </div>
      </div>

      {isCollapsed ? (
        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-black/30 border border-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-gray-500 font-mono text-xs">Action:</span>
            <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded uppercase tracking-wide ${getActionBadgeColor(action)}`}>
              {action}
            </span>
            {node && (
              <>
                <span className="text-gray-500 font-mono text-xs ml-2">Node:</span>
                <span className="bg-gray-800/80 px-2 py-0.5 rounded text-xs font-bold text-gray-300 border border-gray-700 font-mono">{node}</span>
              </>
            )}
          </div>
          <p className="text-gray-200 leading-relaxed font-bold italic text-sm flex-1 md:border-l border-gray-800/60 md:pl-4">
            {message}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Prominent Message Banner at the top of expanded details */}
          <div className="bg-black/30 border border-gray-800/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold border border-orange-500/35 px-2 py-0.5 rounded uppercase tracking-wide bg-orange-500/10 text-orange-400 font-semibold font-mono">
                Current Action
              </span>
              <span className={`text-xs font-bold border px-2 py-0.5 rounded uppercase font-mono ${getActionBadgeColor(action)}`}>
                {action}
              </span>
              {node && (
                <span className="bg-gray-800/80 px-2 py-0.5 rounded text-xs font-bold text-gray-300 border border-gray-700 font-mono">
                  Node: {node}
                </span>
              )}
            </div>
            <p className="text-gray-100 leading-relaxed font-semibold italic text-base flex-1 md:border-l border-gray-800/60 md:pl-4">
              {message}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-1">
            {/* 1. Live Data Structure Visualizer */}
            <div className="flex flex-col gap-3 border-b lg:border-b-0 lg:border-r border-gray-800/80 pb-5 lg:pb-0 lg:pr-5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Layers size={14} className="text-cyan-400" />
                Active Data Structure
              </h4>
              
              <div className="flex-1 flex flex-col justify-center bg-black/35 rounded-lg p-4 border border-gray-800/50 min-h-[140px]">
                {algorithm === 'BFS' && (
                  <div className="text-center">
                    <span className="text-xs font-bold text-gray-500 block mb-2">FIFO QUEUE (Enqueue ➔ Dequeue)</span>
                    {frontier.length === 0 ? (
                      <span className="text-xs italic text-gray-600">Queue is empty</span>
                    ) : (
                      <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
                        {frontier.map((item: string, idx: number) => (
                          <React.Fragment key={item}>
                            <div className="px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded text-sm font-extrabold text-blue-400">
                              {item}
                            </div>
                            {idx < frontier.length - 1 && <span className="text-gray-600 font-bold">←</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {algorithm === 'DFS' && (
                  <div className="text-center">
                    <span className="text-xs font-bold text-gray-500 block mb-2">LIFO STACK (Push ➔ Pop)</span>
                    {frontier.length === 0 ? (
                      <span className="text-xs italic text-gray-600">Stack is empty</span>
                    ) : (
                      <div className="flex flex-col-reverse items-center justify-center gap-1.5 py-1">
                        {frontier.slice().reverse().map((item: string, idx: number) => (
                          <div 
                            key={item} 
                            className={`w-16 py-1 bg-purple-500/15 border border-purple-500/30 rounded text-center text-sm font-extrabold text-purple-400 ${
                              idx === 0 ? 'border-b-4 border-b-purple-400 shadow-lg shadow-purple-500/10' : ''
                            }`}
                          >
                            {item} {idx === 0 && <span className="text-[10px] block font-bold text-purple-300">TOP</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(algorithm === 'Dijkstra' || algorithm === 'AStar') && (
                  <div className="text-center">
                    <span className="text-xs font-bold text-gray-500 block mb-2">PRIORITY QUEUE (Min-Heap Sorted)</span>
                    {pqElements.length === 0 ? (
                      <span className="text-xs italic text-gray-600">No active priorities</span>
                    ) : (
                      <div className="flex flex-wrap items-center justify-center gap-2 py-2">
                        {pqElements.map((item, idx) => (
                          <div 
                            key={item.node} 
                            className={`px-3 py-1 bg-amber-500/10 border rounded text-xs transition-colors flex items-center gap-1.5 ${
                              idx === 0 
                                ? 'border-amber-400 text-amber-300 font-extrabold shadow-md shadow-amber-500/10 scale-105' 
                                : 'border-amber-500/30 text-amber-400/80'
                            }`}
                          >
                            <span className="bg-amber-500/20 px-1 rounded text-[10px]">{item.node}</span>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(algorithm === 'Kruskal' || algorithm === 'Prim') && (
                  <div className="text-center">
                    <span className="text-xs font-bold text-gray-500 block mb-2">
                      {algorithm === 'Kruskal' ? 'MST EDGES (Union-Find / Sorted Edge List)' : 'MST EDGES (Priority Queue / Candidate Edges)'}
                    </span>
                    {mstEdges.length === 0 ? (
                      <span className="text-xs italic text-gray-600">No MST edges selected yet</span>
                    ) : (
                      <div className="flex flex-wrap items-center justify-center gap-2 py-2">
                        {mstEdges.map((me: { source: string; target: string; weight: number }, idx: number) => (
                          <div 
                            key={`${me.source}-${me.target}`} 
                            className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded text-xs font-bold text-emerald-400 flex items-center gap-1"
                          >
                            <span>{me.source}</span>
                            <span className="text-gray-500">⟷</span>
                            <span>{me.target}</span>
                            <span className="text-[10px] text-gray-500 ml-1">w={me.weight}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* DSU component display */}
                    {algorithm === 'Kruskal' && Object.keys(dsuParents).length > 0 && (
                      <div className="mt-3 border-t border-gray-800/50 pt-2">
                        <span className="text-[10px] font-bold text-gray-500 block mb-1.5">DSU PARENT POINTERS</span>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {Object.entries(dsuParents).map(([nodeId, parentId]) => (
                            <div key={nodeId} className="px-2 py-0.5 bg-gray-800/50 border border-gray-700/50 rounded text-[10px] text-gray-300">
                              {nodeId}→{parentId as string}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Candidate edges display (Prim) */}
                    {algorithm === 'Prim' && state_snapshot.candidate_edges && (
                      <div className="mt-3 border-t border-gray-800/50 pt-2">
                        <span className="text-[10px] font-bold text-gray-500 block mb-1.5">CANDIDATE EDGES (Heap)</span>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {state_snapshot.candidate_edges.map((ce: any, idx: number) => (
                            <div key={idx} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] text-amber-400">
                              {ce.source}⟷{ce.target} (w={ce.weight})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {algorithm === 'BellmanFord' && (
                  <div className="text-center">
                    <span className="text-xs font-bold text-gray-500 block mb-2">BELLMAN-FORD ITERATION TRACKER</span>
                    <div className="flex items-center justify-center gap-3 py-2">
                      <div className="px-3 py-2 bg-indigo-500/15 border border-indigo-500/30 rounded-lg text-center">
                        <span className="text-xs text-gray-500 block">Iteration</span>
                        <span className="text-lg font-extrabold text-indigo-400">{iteration}</span>
                        <span className="text-[10px] text-gray-500 block">/ {nodes.length - 1}</span>
                      </div>
                      <div className={`px-3 py-2 rounded-lg border text-center ${
                        negativeCycle 
                          ? 'bg-red-500/15 border-red-500/30' 
                          : 'bg-emerald-500/15 border-emerald-500/30'
                      }`}>
                        <span className="text-xs text-gray-500 block">Cycle Status</span>
                        <span className={`text-sm font-extrabold ${negativeCycle ? 'text-red-400' : 'text-emerald-400'}`}>
                          {negativeCycle ? '⚠ DETECTED' : '✓ None'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Variables State Table */}
            <div className="flex flex-col gap-3 border-b lg:border-b-0 lg:border-r border-gray-800/80 pb-5 lg:pb-0 lg:pr-5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Table size={14} className="text-cyan-400" />
                Variables Snapshot
              </h4>
              <div className="flex-1 overflow-y-auto max-h-[140px] scrollbar-thin bg-black/20 rounded-lg border border-gray-800/40">
                {algorithm === 'Kruskal' || algorithm === 'Prim' ? (
                  /* For Kruskal: show remaining edges to evaluate */
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-black/50 border-b border-gray-800 text-gray-400 font-semibold">
                        <th className="p-2">Edge</th>
                        <th className="p-2">Weight</th>
                        <th className="p-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mstEdges.map((me: { source: string; target: string; weight: number }) => (
                        <tr key={`mst-${me.source}-${me.target}`} className="border-b border-gray-800/40 text-emerald-400">
                          <td className="p-2 font-bold">{me.source} ⟷ {me.target}</td>
                          <td className="p-2 font-mono">{me.weight}</td>
                          <td className="p-2 text-right"><span className="text-[10px] text-emerald-500">✓ in MST</span></td>
                        </tr>
                      ))}
                      {remainingEdges.slice(0, 5).map((re: { source: string; target: string; weight: number }) => (
                        <tr key={`rem-${re.source}-${re.target}`} className="border-b border-gray-800/40 text-gray-500">
                          <td className="p-2 font-bold">{re.source} ⟷ {re.target}</td>
                          <td className="p-2 font-mono">{re.weight}</td>
                          <td className="p-2 text-right"><span className="text-[10px] text-gray-600">pending</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  /* For all path-based algorithms: standard distance/parent table */
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-black/50 border-b border-gray-800 text-gray-400 font-semibold">
                        <th className="p-2">Node</th>
                        <th className="p-2">Distance d[v]</th>
                        <th className="p-2">Parent 𝛑[v]</th>
                        <th className="p-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nodes.map(n => {
                        const rawDist = distances[n.id];
                        const dVal = rawDist === undefined || rawDist === null || rawDist === Infinity ? '∞' : rawDist;
                        const pVal = parents[n.id] || 'null';
                        const isVisited = visitedSet.has(n.id);
                        const isCurrent = n.id === node;

                        return (
                          <tr 
                            key={n.id} 
                            className={`border-b border-gray-800/40 transition-colors ${
                              isCurrent 
                                ? 'bg-orange-500/10 text-orange-300' 
                                : isVisited 
                                ? 'text-gray-400/80' 
                                : 'text-gray-200'
                            }`}
                          >
                            <td className="p-2 font-bold">{n.id}</td>
                            <td className="p-2 font-mono">{dVal}</td>
                            <td className="p-2 font-mono">{pVal}</td>
                            <td className="p-2 text-right">
                              {isCurrent ? (
                                <span className="text-[10px] font-bold text-orange-400 animate-pulse">active</span>
                              ) : isVisited ? (
                                <span className="text-[10px] text-emerald-500">visited</span>
                              ) : frontier.includes(n.id) || pqElements.some(pq => pq.node === n.id) ? (
                                <span className="text-[10px] text-cyan-400">frontier</span>
                              ) : (
                                <span className="text-[10px] text-gray-600">unvisited</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* 3. Live Execution Terminal / Description */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Terminal size={14} className="text-cyan-400" />
                Execution Details
              </h4>
              
              <div className="flex-1 bg-black/50 border border-gray-800/80 rounded-lg p-3 font-mono text-xs flex flex-col justify-between gap-3 min-h-[140px]">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">➔</span>
                    <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded uppercase tracking-wide ${getActionBadgeColor(action)}`}>
                      {action}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed font-medium italic text-xs">{message}</p>
                </div>
                
                <div className="border-t border-gray-800/50 pt-2 text-[10px] text-gray-500 flex justify-between">
                  <span>Algorithm: {algorithm}</span>
                  <span>Target Node: {node || 'N/A'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
