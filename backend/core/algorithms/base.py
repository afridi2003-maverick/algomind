from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from core.data_structures.graph import Graph

@dataclass
class AlgorithmStep:
    """Represents a single step in algorithm execution."""
    step_number: int
    action: str  # "explore", "relax_edge", "add_edge", etc.
    node: Optional[str] = None
    nodes_involved: List[str] = field(default_factory=list)
    edge: Optional[tuple] = None
    frontier: List[str] = field(default_factory=list)
    visited: set = field(default_factory=set)
    state_snapshot: Dict[str, Any] = field(default_factory=dict)
    message: str = ""  # Human-readable message
    
    def to_dict(self) -> dict:
        return {
            "step_number": self.step_number,
            "action": self.action,
            "node": self.node,
            "nodes_involved": self.nodes_involved,
            "edge": self.edge,
            "frontier": self.frontier,
            "visited": list(self.visited),
            "state_snapshot": self.state_snapshot,
            "message": self.message
        }

class BaseAlgorithm(ABC):
    """Base class for all algorithms."""
    
    def __init__(self, graph: Graph):
        self.graph = graph
        self.steps: List[AlgorithmStep] = []
        self.step_counter = 0
    
    @abstractmethod
    def execute(self, **kwargs) -> Dict[str, Any]:
        """Execute the algorithm. Implementation-specific."""
        pass
    
    def add_step(self, action: str, **kwargs):
        """Add a step to the execution log."""
        self.step_counter += 1
        step = AlgorithmStep(
            step_number=self.step_counter,
            action=action,
            **kwargs
        )
        self.steps.append(step)
        return step
    
    def get_result(self) -> Dict[str, Any]:
        """Get the complete algorithm execution result."""
        return {
            "algorithm": self.__class__.__name__,
            "graph": self.graph.to_dict(),
            "steps": [step.to_dict() for step in self.steps],
            "total_steps": len(self.steps)
        }
