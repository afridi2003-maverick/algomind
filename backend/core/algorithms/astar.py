import math
from typing import Dict, Any, Optional, Set
from core.data_structures.priority_queue import MinHeap
from .base import BaseAlgorithm

class AStar(BaseAlgorithm):
    """A* Heuristic Search shortest path algorithm."""
    
    def calculate_heuristic(self, node_id: str, goal_id: str, scale: float = 0.02) -> float:
        """Calculate Euclidean distance heuristic between two nodes, scaled to match small weights."""
        node = self.graph.nodes.get(node_id)
        goal = self.graph.nodes.get(goal_id)
        if not node or not goal:
            return 0.0
        dist = math.hypot(node.x - goal.x, node.y - goal.y)
        return round(dist * scale, 1)

    def execute(self, start_node: str, goal_node: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute A* Search from start_node to goal_node.
        
        Args:
            start_node: Starting node ID
            goal_node: Destination goal node ID
            
        Returns:
            Dictionary with shortest path distances, parent tree, and execution step traces
        """
        if start_node not in self.graph.nodes:
            raise ValueError(f"Start node {start_node} not found")
        
        # Fallback if no goal is specified
        if not goal_node:
            goal_node = list(self.graph.nodes.keys())[-1]
            
        # Compute dynamic scale to guarantee admissibility: h(n) <= true remaining cost.
        scale = 1.0
        min_ratio = float('inf')
        for u_id in self.graph.nodes:
            u = self.graph.nodes[u_id]
            for v_id, w in self.graph.get_neighbors(u_id):
                v = self.graph.nodes[v_id]
                phys_dist = math.hypot(u.x - v.x, u.y - v.y)
                if phys_dist > 0.01:
                    ratio = w / phys_dist
                    if ratio < min_ratio:
                        min_ratio = ratio
        if min_ratio != float('inf') and min_ratio > 0:
            scale = min_ratio
        else:
            scale = 0.01
        
        # Initialize
        g_score = {node_id: float('inf') for node_id in self.graph.nodes}
        g_score[start_node] = 0.0
        
        heuristics = {
            node_id: self.calculate_heuristic(node_id, goal_node, scale)
            for node_id in self.graph.nodes
        }
        
        f_score = {node_id: float('inf') for node_id in self.graph.nodes}
        f_score[start_node] = heuristics[start_node]
        
        previous = {node_id: None for node_id in self.graph.nodes}
        visited: Set[str] = set()
        
        pq = MinHeap()
        pq.push(f_score[start_node], start_node)
        
        self.add_step(
            "initialize",
            node=start_node,
            frontier=[start_node],
            visited=visited.copy(),
            state_snapshot={
                "distance": g_score.copy(),
                "heuristics": heuristics.copy()
            },
            message=f"Starting A* Search from {start_node} to goal {goal_node}"
        )
        
        while not pq.is_empty():
            current_f, current = pq.pop()
            
            if current in visited:
                continue
                
            visited.add(current)
            
            self.add_step(
                "visit_node",
                node=current,
                visited=visited.copy(),
                state_snapshot={
                    "distance": g_score.copy(),
                    "heuristics": heuristics.copy()
                },
                message=f"Visiting node {current} with f(n)={current_f} (g={g_score[current]}, h={heuristics[current]})"
            )
            
            if current == goal_node:
                self.add_step(
                    "goal_reached",
                    node=goal_node,
                    visited=visited.copy(),
                    state_snapshot={
                        "distance": g_score.copy(),
                        "heuristics": heuristics.copy()
                    },
                    message=f"Goal node {goal_node} reached! Shortest path cost is {g_score[goal_node]}"
                )
                break
                
            # Relax edges
            for neighbor, weight in self.graph.get_neighbors(current):
                tentative_g = g_score[current] + weight
                
                if tentative_g < g_score[neighbor]:
                    g_score[neighbor] = tentative_g
                    previous[neighbor] = current
                    f_score[neighbor] = tentative_g + heuristics[neighbor]
                    pq.push(f_score[neighbor], neighbor)
                    
                    self.add_step(
                        "relax_edge",
                        edge=(current, neighbor),
                        nodes_involved=[current, neighbor],
                        visited=visited.copy(),
                        state_snapshot={
                            "distance": g_score.copy(),
                            "previous": previous.copy(),
                            "heuristics": heuristics.copy()
                        },
                        message=f"Relaxed edge ({current}, {neighbor}): g={tentative_g}, f={f_score[neighbor]}"
                    )
                else:
                    self.add_step(
                        "skip_edge",
                        edge=(current, neighbor),
                        visited=visited.copy(),
                        message=f"Edge ({current}, {neighbor}) not improved (g={tentative_g} >= current g={g_score[neighbor]})"
                    )
                    
        return {
            "algorithm": "A*",
            "distances": g_score,
            "previous": previous,
            "visited": list(visited),
            "steps": [step.to_dict() for step in self.steps]
        }
