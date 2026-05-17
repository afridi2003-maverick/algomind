from typing import Dict, Any, Optional, Set, List
from .base import BaseAlgorithm

class BellmanFord(BaseAlgorithm):
    """Bellman-Ford shortest path algorithm with negative cycle detection."""
    
    def execute(self, start_node: str, goal_node: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute Bellman-Ford from start_node.
        
        Args:
            start_node: Starting source node ID
            goal_node: Optional destination node ID
            
        Returns:
            Dictionary with shortest path distances, parent tree, and step execution traces
        """
        if start_node not in self.graph.nodes:
            raise ValueError(f"Start node {start_node} not found")
            
        # Initialize
        distances = {node_id: float('inf') for node_id in self.graph.nodes}
        distances[start_node] = 0.0
        previous = {node_id: None for node_id in self.graph.nodes}
        
        visited_nodes = {start_node}
        
        self.add_step(
            "initialize",
            node=start_node,
            frontier=[start_node],
            visited=visited_nodes.copy(),
            state_snapshot={
                "distance": distances.copy(),
                "previous": previous.copy(),
                "iteration": 0,
                "negative_cycle_detected": False
            },
            message=f"Initialized Bellman-Ford algorithm. Starting source distance to {start_node} is 0."
        )
        
        V = len(self.graph.nodes)
        edges_list = list(self.graph.edges.values())
        
        # Relax edges V-1 times
        for iteration in range(1, V):
            changed = False
            
            for edge in edges_list:
                u, v = edge.source_id, edge.target_id
                weight = edge.weight
                
                # Only relax if the source node has been reached
                if distances[u] != float('inf') and distances[u] + weight < distances[v]:
                    distances[v] = distances[u] + weight
                    previous[v] = u
                    changed = True
                    visited_nodes.add(v)
                    
                    self.add_step(
                        "relax_edge",
                        node=v,
                        edge=(u, v),
                        nodes_involved=[u, v],
                        frontier=[n for n in self.graph.nodes if distances[n] != float('inf')],
                        visited=visited_nodes.copy(),
                        state_snapshot={
                            "distance": distances.copy(),
                            "previous": previous.copy(),
                            "iteration": iteration,
                            "negative_cycle_detected": False
                        },
                        message=f"Iteration {iteration}: Relaxed edge ({u}, {v}) with weight {weight}. Distance to {v} improved to {distances[v]}."
                    )
            
            # End of iteration status step (optional, but good if we relaxed something)
            if not changed:
                self.add_step(
                    "visit_node",
                    node=start_node,
                    frontier=[n for n in self.graph.nodes if distances[n] != float('inf')],
                    visited=visited_nodes.copy(),
                    state_snapshot={
                        "distance": distances.copy(),
                        "previous": previous.copy(),
                        "iteration": iteration,
                        "negative_cycle_detected": False
                    },
                    message=f"Iteration {iteration} completed. No changes in distance estimates. Algorithm converged early!"
                )
                break
                
        # V-th iteration to detect negative weight cycles
        negative_cycle_detected = False
        affected_nodes = set()
        
        for edge in edges_list:
            u, v = edge.source_id, edge.target_id
            weight = edge.weight
            
            if distances[u] != float('inf') and distances[u] + weight < distances[v]:
                negative_cycle_detected = True
                affected_nodes.add(v)
                affected_nodes.add(u)
                
                self.add_step(
                    "relax_edge",  # using relax_edge to draw focus
                    node=v,
                    edge=(u, v),
                    nodes_involved=[u, v],
                    visited=visited_nodes.copy(),
                    state_snapshot={
                        "distance": distances.copy(),
                        "previous": previous.copy(),
                        "negative_cycle_detected": True,
                        "affected_nodes": list(affected_nodes)
                    },
                    message=f"Negative cycle detected! Edge ({u}, {v}) can still be relaxed. Distance is {distances[u] + weight} < {distances[v]}."
                )
                break  # Stop after first negative cycle edge detection for tracing clarity
                
        if not negative_cycle_detected:
            self.add_step(
                "goal_reached",
                node=goal_node if goal_node else start_node,
                frontier=[n for n in self.graph.nodes if distances[n] != float('inf')],
                visited=visited_nodes.copy(),
                state_snapshot={
                    "distance": distances.copy(),
                    "previous": previous.copy(),
                    "negative_cycle_detected": False
                },
                message="Bellman-Ford shortest paths computed successfully! No negative cycles detected."
            )
            
        return {
            "algorithm": "Bellman-Ford",
            "distances": distances,
            "previous": previous,
            "negative_cycle_detected": negative_cycle_detected,
            "steps": [step.to_dict() for step in self.steps]
        }
