from typing import Dict, Any, Optional
from core.data_structures.graph import Graph
from core.algorithms.bfs import BFS
from core.algorithms.dfs import DFS
from core.algorithms.dijkstra import Dijkstra
from core.algorithms.astar import AStar
from core.algorithms.kruskal import Kruskal
from core.algorithms.bellman_ford import BellmanFord
from core.complexity.analyzer import ComplexityAnalyzer

def make_json_compliant(data: Any) -> Any:
    """Recursively convert float('inf') / float('-inf') to None to be JSON compliant."""
    if isinstance(data, float):
        if data == float('inf') or data == float('-inf'):
            return None
    elif isinstance(data, dict):
        return {k: make_json_compliant(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [make_json_compliant(v) for v in data]
    elif isinstance(data, set):
        return [make_json_compliant(v) for v in data]
    elif isinstance(data, tuple):
        return [make_json_compliant(v) for v in data]
    return data

class AlgorithmService:
    """Orchestrates algorithm execution and analysis."""
    
    ALGORITHMS = {
        "BFS": BFS,
        "DFS": DFS,
        "Dijkstra": Dijkstra,
        "AStar": AStar,
        "Kruskal": Kruskal,
        "BellmanFord": BellmanFord,
    }
    
    @staticmethod
    def execute_algorithm(
        graph_dict: dict,
        algorithm_name: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Execute an algorithm on a graph.
        
        Args:
            graph_dict: Graph represented as dict (nodes, edges)
            algorithm_name: Name of algorithm to run
            **kwargs: Algorithm-specific parameters (start_node, goal, heuristic, etc.)
        
        Returns:
            Execution result with steps
        """
        # Reconstruct graph
        graph = AlgorithmService._dict_to_graph(graph_dict)
        
        # Validate graph
        is_valid, error = graph.validate()
        if not is_valid:
            raise ValueError(f"Invalid graph: {error}")
        
        # Get algorithm class
        if algorithm_name not in AlgorithmService.ALGORITHMS:
            raise ValueError(f"Unknown algorithm: {algorithm_name}")
        
        AlgoClass = AlgorithmService.ALGORITHMS[algorithm_name]
        algo = AlgoClass(graph)
        
        # Execute
        result = algo.execute(**kwargs)
        
        # Add complexity analysis
        result["complexity"] = ComplexityAnalyzer.analyze(
            algorithm_name,
            len(graph.nodes),
            len(graph.edges)
        )
        
        return make_json_compliant(result)
    
    @staticmethod
    def _dict_to_graph(graph_dict: dict) -> Graph:
        """Reconstruct graph from dictionary."""
        graph = Graph(is_directed=graph_dict.get("is_directed", False))
        
        # Add nodes
        for node_data in graph_dict.get("nodes", []):
            graph.add_node(
                node_data["id"],
                node_data.get("label", node_data["id"]),
                node_data.get("x", 0),
                node_data.get("y", 0)
            )
        
        # Add edges
        for edge_data in graph_dict.get("edges", []):
            graph.add_edge(
                edge_data["source"],
                edge_data["target"],
                edge_data.get("weight", 1.0),
                edge_data.get("directed", False)
            )
        
        return graph
