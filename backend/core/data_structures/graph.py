from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

@dataclass
class Node:
    """Represents a node in the graph."""
    id: str
    label: str
    x: float = 0.0      # x coordinate for visualization
    y: float = 0.0      # y coordinate for visualization
    color: str = "gray" # current color state
    
    def __hash__(self):
        return hash(self.id)
    
    def __eq__(self, other):
        return self.id == other.id

@dataclass
class Edge:
    """Represents an edge in the graph."""
    source_id: str
    target_id: str
    weight: float = 1.0
    directed: bool = False
    color: str = "gray"
    
    def __hash__(self):
        return hash((self.source_id, self.target_id))

class Graph:
    """Represents an undirected or directed weighted graph."""
    
    def __init__(self, is_directed: bool = False):
        self.is_directed = is_directed
        self.nodes: Dict[str, Node] = {}
        self.edges: Dict[Tuple[str, str], Edge] = {}
        self.adjacency_list: Dict[str, List[Tuple[str, float]]] = {}
    
    def add_node(self, node_id: str, label: str, x: float, y: float):
        """Add a node to the graph."""
        if node_id not in self.nodes:
            self.nodes[node_id] = Node(id=node_id, label=label, x=x, y=y)
            self.adjacency_list[node_id] = []
    
    def add_edge(self, source_id: str, target_id: str, weight: float = 1.0, 
                 directed: bool = False):
        """Add an edge between two nodes."""
        if source_id not in self.nodes or target_id not in self.nodes:
            raise ValueError("Source or target node not found")
        
        edge = Edge(source_id, target_id, weight, directed)
        self.edges[(source_id, target_id)] = edge
        
        # Add to adjacency list
        self.adjacency_list[source_id].append((target_id, weight))
        
        # If undirected, add reverse edge
        if not directed:
            self.adjacency_list[target_id].append((source_id, weight))
            self.edges[(target_id, source_id)] = Edge(target_id, source_id, weight, directed)
    
    def remove_node(self, node_id: str):
        """Remove a node and all its edges."""
        if node_id not in self.nodes:
            return
        
        # Remove all edges involving this node
        edges_to_remove = [
            edge_key for edge_key in self.edges.keys()
            if edge_key[0] == node_id or edge_key[1] == node_id
        ]
        for edge_key in edges_to_remove:
            del self.edges[edge_key]
        
        # Remove adjacency list entries
        for neighbor_list in self.adjacency_list.values():
            neighbor_list[:] = [(n, w) for n, w in neighbor_list if n != node_id]
        
        del self.nodes[node_id]
        del self.adjacency_list[node_id]
    
    def get_neighbors(self, node_id: str) -> List[Tuple[str, float]]:
        """Get neighbors of a node (returns tuples of (neighbor_id, weight))."""
        return self.adjacency_list.get(node_id, [])
    
    def validate(self) -> Tuple[bool, Optional[str]]:
        """Validate graph integrity."""
        # Check if all adjacency list references exist
        for node_id, neighbors in self.adjacency_list.items():
            if node_id not in self.nodes:
                return False, f"Node {node_id} in adjacency list not in nodes"
            for neighbor_id, _ in neighbors:
                if neighbor_id not in self.nodes:
                    return False, f"Neighbor {neighbor_id} not found"
        
        return True, None
    
    def to_dict(self) -> dict:
        """Convert graph to dictionary for JSON serialization."""
        return {
            "nodes": [
                {
                    "id": node.id,
                    "label": node.label,
                    "x": node.x,
                    "y": node.y,
                    "color": node.color
                }
                for node in self.nodes.values()
            ],
            "edges": [
                {
                    "source": edge.source_id,
                    "target": edge.target_id,
                    "weight": edge.weight,
                    "directed": edge.directed,
                    "color": edge.color
                }
                for edge in self.edges.values()
            ],
            "is_directed": self.is_directed
        }
