from typing import Dict, Any

class ComplexityAnalyzer:
    """Analyzes and calculates complexity metrics."""
    
    COMPLEXITY_DATA = {
        "BFS": {
            "time": "O(V + E)",
            "space": "O(V)",
            "optimal": True,
            "description": "Linear in vertices and edges. Queue-based level traversal."
        },
        "DFS": {
            "time": "O(V + E)",
            "space": "O(V)",
            "optimal": False,
            "description": "Linear in vertices and edges. Recursive stack-based."
        },
        "Dijkstra": {
            "time": "O((V + E) log V)",
            "space": "O(V)",
            "optimal": True,
            "description": "Priority queue based. O(E log V) for binary heap."
        },
        "A*": {
            "time": "O(E log V)",
            "space": "O(V)",
            "optimal": True,
            "description": "Faster than Dijkstra with good heuristic."
        },
        "AStar": {
            "time": "O(E log V)",
            "space": "O(V)",
            "optimal": True,
            "description": "Faster than Dijkstra with good heuristic."
        },
        "Kruskal": {
            "time": "O(E log E)",
            "space": "O(V + E)",
            "optimal": True,
            "description": "Sorting edges + union-find. E log E dominates."
        },
        "Bellman-Ford": {
            "time": "O(V * E)",
            "space": "O(V)",
            "optimal": True,
            "description": "Slower than Dijkstra but handles negative weights."
        },
        "BellmanFord": {
            "time": "O(V * E)",
            "space": "O(V)",
            "optimal": True,
            "description": "Slower than Dijkstra but handles negative weights."
        }
    }
    
    @staticmethod
    def analyze(algorithm: str, vertices: int, edges: int) -> Dict[str, Any]:
        """
        Calculate complexity metrics for given graph size.
        
        Args:
            algorithm: Algorithm name
            vertices: Number of vertices
            edges: Number of edges
        
        Returns:
            Complexity analysis including actual operation counts
        """
        if algorithm not in ComplexityAnalyzer.COMPLEXITY_DATA:
            return {"error": f"Unknown algorithm: {algorithm}"}
        
        data = ComplexityAnalyzer.COMPLEXITY_DATA[algorithm]
        
        # Calculate rough operation counts
        return {
            "algorithm": algorithm,
            "time_complexity": data["time"],
            "space_complexity": data["space"],
            "description": data["description"],
            "optimal": data["optimal"],
            "estimated_operations": ComplexityAnalyzer._estimate_operations(
                algorithm, vertices, edges
            )
        }
    
    @staticmethod
    def _estimate_operations(algorithm: str, v: int, e: int) -> int:
        """Estimate actual operation count."""
        if algorithm == "BFS":
            return v + e
        elif algorithm == "DFS":
            return v + e
        elif algorithm == "Dijkstra":
            return int((v + e) * __import__('math').log(v + 1))
        elif algorithm == "A*" or algorithm == "AStar":
            return int(e * __import__('math').log(v + 1))
        elif algorithm == "Kruskal":
            return int(e * __import__('math').log(e + 1))
        elif algorithm == "Bellman-Ford" or algorithm == "BellmanFord":
            return v * e
        return 0
