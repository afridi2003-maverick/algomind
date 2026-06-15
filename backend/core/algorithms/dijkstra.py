from typing import Dict, Any, Optional, Set
from core.data_structures.priority_queue import MinHeap
from .base import BaseAlgorithm

class Dijkstra(BaseAlgorithm):
    """Dijkstra's shortest path algorithm."""
    
    def execute(self, start_node: str, goal_node: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute Dijkstra's algorithm.
        
        Args:
            start_node: Starting node ID
            goal_node: Optional goal node (for early termination)
        
        Returns:
            Dictionary with shortest distances and parent pointers
        """
        if start_node not in self.graph.nodes:
            raise ValueError(f"Start node {start_node} not found")
        
        # Initialize
        distance = {node_id: float('inf') for node_id in self.graph.nodes}
        distance[start_node] = 0
        previous = {node_id: None for node_id in self.graph.nodes}
        visited: Set[str] = set()
        pq = MinHeap()
        pq.push(0, start_node)
        
        self.add_step(
            "initialize",
            node=start_node,
            frontier=[start_node],
            visited=visited.copy(),
            message="Dijkstra initialized"
        )
        
        while not pq.is_empty():
            current_dist, current = pq.pop()
            
            if current in visited:
                continue
            
            visited.add(current)
            
            self.add_step(
                "visit_node",
                node=current,
                visited=visited.copy(),
                state_snapshot={"distance": distance.copy()},
                message=f"Processing node {current} with distance {current_dist}"
            )
            
            if current == goal_node:
                self.add_step(
                    "goal_reached",
                    node=goal_node,
                    visited=visited.copy(),
                    message=f"Reached goal {goal_node} with distance {distance[goal_node]}"
                )
                break
            
            # Relax edges
            for neighbor, weight in self.graph.get_neighbors(current):
                new_dist = distance[current] + weight
                
                if new_dist < distance[neighbor]:
                    distance[neighbor] = new_dist
                    previous[neighbor] = current
                    pq.push(new_dist, neighbor)
                    
                    self.add_step(
                        "relax_edge",
                        edge=(current, neighbor),
                        nodes_involved=[current, neighbor],
                        visited=visited.copy(),
                        state_snapshot={
                            "distance": distance.copy(),
                            "previous": previous.copy()
                        },
                        message=f"Relaxed edge ({current}, {neighbor}): new distance {new_dist}"
                    )
                else:
                    self.add_step(
                        "skip_edge",
                        edge=(current, neighbor),
                        visited=visited.copy(),
                        message=f"Edge ({current}, {neighbor}) not improved"
                    )
        
        return {
            "algorithm": "Dijkstra",
            "distances": distance,
            "previous": previous,
            "visited": list(visited),
            "steps": [step.to_dict() for step in self.steps]
        }
