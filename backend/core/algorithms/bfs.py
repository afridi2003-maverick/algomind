from typing import Dict, Any, Optional, Set, List
from collections import deque
from .base import BaseAlgorithm, AlgorithmStep
from core.data_structures.graph import Graph

class BFS(BaseAlgorithm):
    """Breadth-First Search implementation."""
    
    def execute(self, start_node: str, goal_node: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute BFS from start node.
        
        Args:
            start_node: Starting node ID
            goal_node: Optional goal node (for early termination)
        
        Returns:
            Dictionary with execution results
        """
        # Validation
        if start_node not in self.graph.nodes:
            raise ValueError(f"Start node {start_node} not found")
        
        # Initialize
        queue = deque([start_node])
        visited = {start_node}
        visit_order: List[str] = []
        distance = {node_id: float('inf') for node_id in self.graph.nodes}
        distance[start_node] = 0
        parent = {node_id: None for node_id in self.graph.nodes}
        
        self.add_step(
            "initialize",
            node=start_node,
            frontier=[start_node],
            visited=visited.copy(),
            message=f"Starting BFS from {start_node}"
        )
        
        while queue:
            current = queue.popleft()
            visit_order.append(current)
            
            self.add_step(
                "visit_node",
                node=current,
                frontier=list(queue),
                visited=visited.copy(),
                message=f"Visiting node {current}"
            )
            
            if current == goal_node:
                self.add_step(
                    "goal_reached",
                    node=goal_node,
                    message=f"Goal node {goal_node} reached!"
                )
                break
            
            # Explore neighbors
            for neighbor, _ in self.graph.get_neighbors(current):
                if neighbor not in visited:
                    visited.add(neighbor)
                    distance[neighbor] = distance[current] + 1
                    parent[neighbor] = current
                    queue.append(neighbor)
                    
                    self.add_step(
                        "explore",
                        node=neighbor,
                        edge=(current, neighbor),
                        nodes_involved=[current, neighbor],
                        frontier=list(queue),
                        visited=visited.copy(),
                        state_snapshot={
                            "distance": distance.copy(),
                            "parent": parent.copy()
                        },
                        message=f"Explored neighbor {neighbor} from {current}"
                    )
        
        return {
            "algorithm": "BFS",
            "visited_order": visit_order,
            "distance": distance,
            "parent_tree": parent,
            "steps": [step.to_dict() for step in self.steps]
        }
