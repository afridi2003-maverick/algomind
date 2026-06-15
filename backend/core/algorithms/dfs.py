from typing import Dict, Any, Optional, Set, List
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
        visited: Set[str] = set()
        visit_order: List[str] = []
        distance = {node_id: float('inf') for node_id in self.graph.nodes}
        distance[start_node] = 0
        parent = {node_id: None for node_id in self.graph.nodes}
        
        self.add_step(
            "initialize",
            node=start_node,
            frontier=list(stack),
            visited=visited.copy(),
            message=f"Starting DFS from {start_node}"
        )
        
        while stack:
            current = stack.pop()
            
            # Skip if already visited (mark visited on pop, not on push)
            if current in visited:
                continue
            
            visited.add(current)
            visit_order.append(current)
            
            self.add_step(
                "visit_node",
                node=current,
                frontier=list(stack),
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
                
            # Explore neighbors in alphabetical order
            # Sorting reverse=True so alphabetical node is pushed last and popped first (LIFO)
            neighbors = sorted(self.graph.get_neighbors(current), key=lambda x: x[0], reverse=True)
            for neighbor, weight in neighbors:
                if neighbor not in visited:
                    # Update distance/parent if this is the first time we can reach neighbor
                    if distance[neighbor] == float('inf'):
                        distance[neighbor] = distance[current] + 1
                        parent[neighbor] = current
                    stack.append(neighbor)
                    
                    self.add_step(
                        "explore",
                        node=neighbor,
                        nodes_involved=[current, neighbor],
                        frontier=list(stack),
                        visited=visited.copy(),
                        state_snapshot={
                            "distance": distance.copy(),
                            "parent": parent.copy()
                        },
                        message=f"Explored neighbor {neighbor} from {current}"
                    )
                    
        return {
            "algorithm": "DFS",
            "visited_order": visit_order,
            "distance": distance,
            "parent_tree": parent,
            "steps": [step.to_dict() for step in self.steps]
        }
