from typing import Dict, Any, Optional, Set
from .base import BaseAlgorithm

class DFS(BaseAlgorithm):
    """Depth-First Search implementation."""
    
    def execute(self, start_node: str, goal_node: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute DFS from start node.
        
        Args:
            start_node: Starting node ID
            goal_node: Optional goal node (for early termination)
        
        Returns:
            Dictionary with execution results
        """
        if start_node not in self.graph.nodes:
            raise ValueError(f"Start node {start_node} not found")
            
        # Initialize
        stack = [start_node]
        visited = {start_node}
        distance = {node_id: float('inf') for node_id in self.graph.nodes}
        distance[start_node] = 0
        parent = {node_id: None for node_id in self.graph.nodes}
        
        self.add_step(
            "initialize",
            node=start_node,
            frontier=list(stack),
            visited=visited,
            message=f"Starting DFS from {start_node}"
        )
        
        while stack:
            current = stack.pop()
            
            self.add_step(
                "visit_node",
                node=current,
                frontier=list(stack),
                visited=visited,
                message=f"Visiting node {current}"
            )
            
            if current == goal_node:
                self.add_step(
                    "goal_reached",
                    node=goal_node,
                    message=f"Goal node {goal_node} reached!"
                )
                break
                
            # Explore neighbors in alphabetical order
            # Sorting reverse=True so alphabetical node is pushed last and popped first (LIFO)
            neighbors = sorted(self.graph.get_neighbors(current), key=lambda x: x[0], reverse=True)
            for neighbor, _ in neighbors:
                if neighbor not in visited:
                    visited.add(neighbor)
                    distance[neighbor] = distance[current] + 1
                    parent[neighbor] = current
                    stack.append(neighbor)
                    
                    self.add_step(
                        "explore",
                        node=neighbor,
                        nodes_involved=[current, neighbor],
                        frontier=list(stack),
                        visited=visited,
                        state_snapshot={
                            "distance": distance.copy(),
                            "parent": parent.copy()
                        },
                        message=f"Explored neighbor {neighbor} from {current}"
                    )
                    
        return {
            "algorithm": "DFS",
            "visited_order": list(visited),
            "distance": distance,
            "parent_tree": parent,
            "steps": [step.to_dict() for step in self.steps]
        }
