from typing import Dict, Any, Optional, Set, List
import heapq
from .base import BaseAlgorithm

class Prim(BaseAlgorithm):
    """Prim's Minimum Spanning Tree algorithm."""
    
    def execute(self, start_node: Optional[str] = None, goal_node: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute Prim's Algorithm to find the Minimum Spanning Tree.
        
        Args:
            start_node: Starting node ID
            goal_node: Unused, kept for uniform signature
            
        Returns:
            Dictionary with MST edges, total weight, and step-by-step execution trace
        """
        if not self.graph.nodes:
            return {
                "algorithm": "Prim",
                "mst_edges": [],
                "total_weight": 0.0,
                "steps": []
            }
            
        # Select default start node if none provided
        if not start_node or start_node not in self.graph.nodes:
            start_node = sorted(list(self.graph.nodes.keys()))[0]
            
        visited_nodes = {start_node}
        mst_edges = []
        total_weight = 0.0
        
        # Candidate edges min-heap: (weight, source, target)
        candidate_edges = []
        
        # Helper to push outgoing edges from a node to the candidate min-heap
        def push_outgoing_edges(n_id: str):
            for neighbor, weight in self.graph.get_neighbors(n_id):
                if neighbor not in visited_nodes:
                    heapq.heappush(candidate_edges, (weight, n_id, neighbor))
        
        push_outgoing_edges(start_node)
        
        self.add_step(
            "initialize",
            node=start_node,
            frontier=[start_node],
            visited=visited_nodes.copy(),
            state_snapshot={
                "mst_edges": [],
                "candidate_edges": [{"source": u, "target": v, "weight": w} for w, u, v in sorted(candidate_edges)]
            },
            message=f"Initialized Prim's algorithm starting from node {start_node}."
        )
        
        while candidate_edges and len(visited_nodes) < len(self.graph.nodes):
            weight, u, v = heapq.heappop(candidate_edges)
            
            if v in visited_nodes:
                # Target already visited, edge forms a cycle, skip it
                self.add_step(
                    "skip_edge",
                    node=v,
                    edge=(u, v),
                    nodes_involved=[u, v],
                    frontier=[f"{x}-{y}" for x, y, w in mst_edges],
                    visited=visited_nodes.copy(),
                    state_snapshot={
                        "mst_edges": [{"source": x, "target": y, "weight": w} for x, y, w in mst_edges],
                        "candidate_edges": [{"source": x, "target": y, "weight": w} for w, x, y in sorted(candidate_edges)]
                    },
                    message=f"Edge ({u}, {v}) with weight {weight} connects already visited nodes. Skipped to prevent cycle."
                )
                continue
                
            # Add edge to MST
            mst_edges.append((u, v, weight))
            total_weight += weight
            visited_nodes.add(v)
            
            push_outgoing_edges(v)
            
            self.add_step(
                "add_edge",
                node=v,
                edge=(u, v),
                nodes_involved=[u, v],
                frontier=[f"{x}-{y}" for x, y, w in mst_edges],
                visited=visited_nodes.copy(),
                state_snapshot={
                    "mst_edges": [{"source": x, "target": y, "weight": w} for x, y, w in mst_edges],
                    "candidate_edges": [{"source": x, "target": y, "weight": w} for w, x, y in sorted(candidate_edges)]
                },
                message=f"Added edge ({u}, {v}) with weight {weight} to the MST and marked node {v} as visited."
            )
            
        # Finalization step
        self.add_step(
            "goal_reached",
            frontier=[f"{x}-{y}" for x, y, w in mst_edges],
            visited=visited_nodes.copy(),
            state_snapshot={
                "mst_edges": [{"source": x, "target": y, "weight": w} for x, y, w in mst_edges],
                "candidate_edges": []
            },
            message=f"Prim's algorithm completed! Spanning tree has {len(mst_edges)} edges with total weight {total_weight}."
        )
        
        return {
            "algorithm": "Prim",
            "mst_edges": [{"source": x, "target": y, "weight": w} for x, y, w in mst_edges],
            "total_weight": total_weight,
            "steps": [step.to_dict() for step in self.steps]
        }
