from typing import Dict, Any, Optional, Set, List
from .base import BaseAlgorithm
from core.data_structures.union_find import UnionFind

class Kruskal(BaseAlgorithm):
    """Kruskal's Minimum Spanning Tree algorithm."""
    
    def execute(self, start_node: Optional[str] = None, goal_node: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute Kruskal's Algorithm to find the Minimum Spanning Tree.
        
        Args:
            start_node: Unused, kept for uniform signature
            goal_node: Unused, kept for uniform signature
            
        Returns:
            Dictionary with MST edges, total weight, and step-by-step execution trace
        """
        # Get unique undirected edges
        unique_edges = []
        seen_edges = set()
        
        for edge_key, edge in self.graph.edges.items():
            u, v = edge.source_id, edge.target_id
            # Normalize to avoid duplicates (since graph stores both directions for undirected)
            edge_rep = tuple(sorted([u, v]))
            if edge_rep not in seen_edges:
                seen_edges.add(edge_rep)
                unique_edges.append((edge_rep[0], edge_rep[1], edge.weight))
                
        # Sort edges by weight ascending
        sorted_edges = sorted(unique_edges, key=lambda e: e[2])
        
        # DSU Initialization
        node_ids = list(self.graph.nodes.keys())
        uf = UnionFind(node_ids)
        mst_edges = []
        total_weight = 0.0
        visited_nodes: Set[str] = set()
        
        # Add Initial Step
        self.add_step(
            "initialize",
            frontier=[],
            visited=visited_nodes.copy(),
            state_snapshot={
                "dsu_parents": uf.parent.copy(),
                "dsu_ranks": uf.rank.copy(),
                "mst_edges": [],
                "sorted_edges": [{"source": u, "target": v, "weight": w} for u, v, w in sorted_edges],
                "remaining_edges": [{"source": u, "target": v, "weight": w} for u, v, w in sorted_edges]
            },
            message="Initialized Kruskal's algorithm. Unique edges sorted in ascending order."
        )
        
        edge_index = 0
        for u, v, weight in sorted_edges:
            edge_index += 1
            remaining_edges_json = [{"source": x, "target": y, "weight": w} for x, y, w in sorted_edges[edge_index:]]
            
            root_u = uf.find(u)
            root_v = uf.find(v)
            
            if root_u != root_v:
                # Add edge to MST
                uf.union(u, v)
                mst_edges.append((u, v, weight))
                total_weight += weight
                visited_nodes.add(u)
                visited_nodes.add(v)
                
                # Active DSU snapshot representation
                dsu_parents = uf.parent.copy()
                dsu_ranks = uf.rank.copy()
                
                self.add_step(
                    "add_edge",
                    node=u,
                    edge=(u, v),
                    nodes_involved=[u, v],
                    frontier=[f"{x}-{y}" for x, y, w in mst_edges],
                    visited=visited_nodes.copy(),
                    state_snapshot={
                        "dsu_parents": dsu_parents,
                        "dsu_ranks": dsu_ranks,
                        "mst_edges": [{"source": x, "target": y, "weight": w} for x, y, w in mst_edges],
                        "remaining_edges": remaining_edges_json
                    },
                    message=f"Edge ({u}, {v}) with weight {weight} connects separate components. Added to MST."
                )
            else:
                self.add_step(
                    "skip_edge",
                    node=u,
                    edge=(u, v),
                    nodes_involved=[u, v],
                    frontier=[f"{x}-{y}" for x, y, w in mst_edges],
                    visited=visited_nodes.copy(),
                    state_snapshot={
                        "dsu_parents": uf.parent.copy(),
                        "dsu_ranks": uf.rank.copy(),
                        "mst_edges": [{"source": x, "target": y, "weight": w} for x, y, w in mst_edges],
                        "remaining_edges": remaining_edges_json
                    },
                    message=f"Edge ({u}, {v}) with weight {weight} creates a cycle (both are already in component {root_u}). Skipped."
                )
                
            # Early termination check: if MST has V-1 edges, DSU component count is 1
            if len(mst_edges) == len(node_ids) - 1:
                break
                
        # Finalization Step
        self.add_step(
            "goal_reached",
            frontier=[f"{x}-{y}" for x, y, w in mst_edges],
            visited=visited_nodes.copy(),
            state_snapshot={
                "dsu_parents": uf.parent.copy(),
                "dsu_ranks": uf.rank.copy(),
                "mst_edges": [{"source": x, "target": y, "weight": w} for x, y, w in mst_edges],
                "remaining_edges": []
            },
            message=f"Kruskal's algorithm finished! Minimum Spanning Tree completed with {len(mst_edges)} edges and total weight {total_weight}."
        )
        
        return {
            "algorithm": "Kruskal",
            "mst_edges": [{"source": x, "target": y, "weight": w} for x, y, w in mst_edges],
            "total_weight": total_weight,
            "steps": [step.to_dict() for step in self.steps]
        }
