import heapq
from typing import Any, List, Tuple

class MinHeap:
    """Min-heap implementation for Dijkstra and A*."""
    
    def __init__(self):
        self.heap: List[Tuple[float, str]] = []  # (priority, node_id)
        self.counter = 0  # for stable ordering
    
    def push(self, priority: float, node_id: str):
        """Add element to heap."""
        heapq.heappush(self.heap, (priority, self.counter, node_id))
        self.counter += 1
    
    def pop(self) -> Tuple[float, str]:
        """Remove and return minimum element."""
        if self.is_empty():
            raise IndexError("Heap is empty")
        priority, _, node_id = heapq.heappop(self.heap)
        return priority, node_id
    
    def is_empty(self) -> bool:
        """Check if heap is empty."""
        return len(self.heap) == 0
    
    def size(self) -> int:
        """Get heap size."""
        return len(self.heap)
    
    def __repr__(self) -> str:
        return f"MinHeap({sorted(self.heap)})"
