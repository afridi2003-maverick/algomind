from typing import Dict

class UnionFind:
    """Union-Find (Disjoint Set Union) for Kruskal's algorithm."""
    
    def __init__(self, nodes: list):
        self.parent: Dict[str, str] = {node: node for node in nodes}
        self.rank: Dict[str, int] = {node: 0 for node in nodes}
    
    def find(self, x: str) -> str:
        """Find root of element with path compression."""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]
    
    def union(self, x: str, y: str) -> bool:
        """Union two sets by rank. Returns True if union performed."""
        root_x = self.find(x)
        root_y = self.find(y)
        
        if root_x == root_y:
            return False  # Already in same set
        
        # Union by rank
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
        
        return True  # Union performed
