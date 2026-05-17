# AlgoMind AI Algorithm Simulation Lab
## Complete Technical Specification & Implementation Guide

---

# TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Core Algorithms Deep Dive](#3-core-algorithms-deep-dive)
4. [Python Backend Specification](#4-python-backend-specification)
5. [Frontend Specification](#5-frontend-specification)
6. [Visualization Engine](#6-visualization-engine)
7. [Step-by-Step Simulator](#7-step-by-step-simulator)
8. [Quiz & Assessment System](#8-quiz--assessment-system)
9. [Chatbot Integration](#9-chatbot-integration)
10. [Database Schema](#10-database-schema)
11. [API Endpoints](#11-api-endpoints)
12. [File Structure](#12-complete-file-structure)
13. [Implementation Phases](#13-implementation-phases)
14. [Environment & Deployment](#14-environment--deployment)

---

# 1. PROJECT OVERVIEW

## 1.1 Vision
AlgoMind is an interactive, web-based AI-powered Algorithm Simulation Lab designed to help Computer Science students understand graph algorithms through:
- **Visual execution** of 6 core algorithms
- **Step-by-step tracing** with state inspection
- **Interactive quizzes** with algorithm selection challenges
- **AI chatbot tutor** providing real-time guidance
- **Progress tracking** and performance analytics

## 1.2 Core Algorithms
1. **BFS (Breadth-First Search)** — explores nodes level by level
2. **DFS (Depth-First Search)** — explores nodes recursively/stack-based
3. **Dijkstra** — finds shortest path (non-negative weights)
4. **A\* (A-Star)** — informed search using heuristics
5. **Kruskal** — minimum spanning tree using union-find
6. **Bellman-Ford** — shortest path (handles negative weights)

## 1.3 Key Features
- **Interactive graph builder** (add/remove nodes, draw edges, set weights)
- **Real-time animation** of algorithm execution
- **Step-by-step debugger** (pause, resume, step forward/backward)
- **Quiz mode** with auto-grading
- **AlgoMind AI chatbot** with context-aware explanations
- **Complexity analyzer** (time/space complexity per algorithm)
- **Progress dashboard** (quiz scores, algorithms mastered, time spent)

## 1.4 Target Users
- University CS students (2nd-4th year)
- Algorithm course instructors
- Interview prep candidates
- Self-learners

## 1.5 Success Metrics
- Quiz completion rate > 80%
- Average algorithm understanding score ≥ 75%
- Chatbot usage rate > 60% per session
- Average session duration > 20 minutes

---

# 2. SYSTEM ARCHITECTURE

## 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Graph Editor│  │  Visualizer  │  │   Quiz Module    │  │
│  │   Component  │  │  (Canvas)    │  │  Component       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Simulator    │  │   Debugger   │  │  ChatBot Panel   │  │
│  │  Controller  │  │   Inspector  │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│  State Management: Zustand + React Context                  │
└─────────────────────────────────────────────────────────────┘
                           ↓ (REST + WebSocket)
┌─────────────────────────────────────────────────────────────┐
│                   PYTHON BACKEND (FastAPI)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Algorithm   │  │   Graph      │  │   Quiz Engine    │  │
│  │  Executor    │  │  Validator   │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Step        │  │  Complexity  │  │  Student Progress│  │
│  │  Generator   │  │  Calculator  │  │  Tracker         │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│  Data Persistence: PostgreSQL                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                              │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  Claude API  │  │  PostgreSQL  │                         │
│  │  (Chatbot)   │  │  (Database)  │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## 2.2 Technology Stack

| Layer        | Technology              | Purpose                          |
|--------------|-------------------------|----------------------------------|
| Frontend     | Next.js 14 + TypeScript | Web app framework                |
| UI Library   | React 18                | Component library                |
| State        | Zustand                 | Client state management          |
| Canvas       | HTML5 Canvas API        | Graph visualization              |
| Styling      | Tailwind CSS            | Responsive design                |
| HTTP Client  | axios + fetch API       | API communication                |
| Backend      | Python 3.11             | Core language                    |
| Web Server   | FastAPI                 | REST API framework               |
| ASGI Server  | uvicorn                 | Production server                |
| Database     | PostgreSQL 15           | Data persistence                 |
| ORM          | SQLAlchemy              | Database abstraction             |
| AI/Chat      | Anthropic Claude API    | Chatbot LLM                      |
| Auth         | JWT tokens              | User authentication              |
| Deployment   | Vercel (Frontend)       | Hosting                          |
|              | Railway/Render (Backend)| Backend hosting                  |

## 2.3 Data Flow

### Algorithm Execution Flow
```
1. User creates graph (nodes + edges)
   ↓
2. User selects algorithm
   ↓
3. Frontend sends graph + algorithm to Backend API
   ↓
4. Backend executes algorithm step-by-step, storing each state
   ↓
5. Backend returns array of execution steps
   ↓
6. Frontend stores steps in Zustand (simulationStore)
   ↓
7. User clicks "Start Simulation" → Frontend animates through steps
   ↓
8. For each step: highlight current node, update frontier, show action
   ↓
9. User can pause/resume/jump to step
   ↓
10. At completion: display result, calc complexity, offer quiz
```

### Chat Flow
```
1. User types message in chatbot
   ↓
2. Frontend sends: message + graph context + current algorithm
   ↓
3. Backend builds context-aware prompt
   ↓
4. Backend calls Claude API with streaming
   ↓
5. Backend streams response back to Frontend (Server-Sent Events)
   ↓
6. Frontend displays response in real-time
```

---

# 3. CORE ALGORITHMS DEEP DIVE

## 3.1 BFS (Breadth-First Search)

### 3.1.1 Algorithm Overview
BFS explores a graph level-by-level using a queue (FIFO). It guarantees the shortest path in unweighted graphs.

### 3.1.2 Pseudocode
```
Algorithm: BFS(Graph, Start)
Input: Graph (adjacency list), Start node
Output: Visited nodes in order, parent pointers

1. Initialize:
   - Queue Q = []
   - Visited = {Start: True}
   - Parent = {Start: None}
   - Distance = {Start: 0}
   - Frontier = [Start]

2. While Q is not empty:
   a. current_node = Q.popleft()
   b. For each neighbor in Graph[current_node]:
      i.   If neighbor not visited:
      ii.  Mark visited[neighbor] = True
      iii. parent[neighbor] = current_node
      iv.  distance[neighbor] = distance[current_node] + 1
      v.   Q.append(neighbor)
      vi.  Emit step: {
           "action": "explore",
           "node": neighbor,
           "frontier": copy(Q),
           "visited": copy(visited)
           }

3. Return: visited, parent, distance
```

### 3.1.3 Complexity Analysis
- **Time Complexity**: O(V + E) where V = vertices, E = edges
- **Space Complexity**: O(V) for queue and visited set
- **Optimality**: Guarantees shortest path in unweighted graphs
- **Real-world Use**: Social network "degrees of separation", game state exploration

### 3.1.4 Visualization Representation
```
Nodes:
- Not visited: gray, outline
- In frontier (queue): blue, thicker outline
- Visiting: orange, animated
- Visited: green, filled

Edges:
- Unvisited: gray
- Tree edge (following): green arrow, thick
- Cross edge: red dashed

Annotations:
- Distance label on each node
- Queue contents shown in side panel
- Parent pointers shown as tree structure
```

## 3.2 DFS (Depth-First Search)

### 3.2.1 Algorithm Overview
DFS explores deeply into a branch before backtracking. Uses a stack (LIFO) or recursion.

### 3.2.2 Pseudocode
```
Algorithm: DFS(Graph, Start)
Input: Graph (adjacency list), Start node
Output: Visited nodes in DFS order

1. Initialize:
   - Stack S = [Start]
   - Visited = {Start: True}
   - Parent = {Start: None}
   - Order = [Start]
   - Frontier = [Start]

2. While S is not empty:
   a. current_node = S.pop()
   b. For each neighbor in Graph[current_node]:
      i.   If neighbor not visited:
      ii.  visited[neighbor] = True
      iii. parent[neighbor] = current_node
      iv.  S.append(neighbor)
      v.   Order.append(neighbor)
      vi.  Frontier = copy(S)
      vii. Emit step: {
           "action": "explore",
           "node": neighbor,
           "frontier": Frontier,
           "visited": visited,
           "depth": depth_of(neighbor)
           }

3. Return: visited, parent, order
```

### 3.2.3 Complexity Analysis
- **Time Complexity**: O(V + E)
- **Space Complexity**: O(V) for stack (can exceed BFS in dense graphs)
- **Optimality**: Not optimal for shortest path; finds path but not shortest
- **Real-world Use**: Topological sorting, cycle detection, maze solving

### 3.2.4 Visualization Representation
```
Nodes:
- Not visited: gray
- In frontier (stack): orange, pulsing
- Current: red, large
- Visited: blue, filled

Stack Display:
- Show stack contents vertically
- Top of stack = next to visit
- Animation: node pops from stack

Depth Indicator:
- Color gradient based on recursion depth
- Darker = deeper in recursion tree
```

## 3.3 Dijkstra's Algorithm

### 3.3.1 Algorithm Overview
Finds the shortest path from source to all other nodes. Works with non-negative edge weights. Uses a priority queue.

### 3.3.2 Pseudocode
```
Algorithm: Dijkstra(Graph, Start, Goal)
Input: Graph (weighted), Start node, Goal node
Output: Shortest distances, shortest path tree

1. Initialize:
   - Distance = {all nodes: ∞}
   - Distance[Start] = 0
   - Previous = {all nodes: None}
   - PriorityQueue Q = [(0, Start)]
   - Visited = {}
   - Frontier = [Start]

2. While Q is not empty:
   a. current_dist, current_node = Q.pop_min()
   
   b. If current_node in Visited:
      Continue
   
   c. Visited[current_node] = True
   
   d. If current_node == Goal:
      Return path
   
   e. For each (neighbor, weight) in Graph[current_node]:
      i.   new_dist = current_dist + weight
      ii.  
      iii. If new_dist < Distance[neighbor]:
           - Distance[neighbor] = new_dist
           - Previous[neighbor] = current_node
           - Q.push((new_dist, neighbor))
           - Emit step: {
             "action": "relax_edge",
             "from": current_node,
             "to": neighbor,
             "new_distance": new_dist,
             "frontier": [(d, n) for d, n in Q],
             "updated": true
             }
           Else:
           - Emit step: {
             "action": "skip_edge",
             "from": current_node,
             "to": neighbor,
             "reason": "not_better"
             }

3. Reconstruct path:
   path = []
   current = Goal
   While current is not None:
      path.prepend(current)
      current = Previous[current]
   Return path, Distance[Goal]
```

### 3.3.3 Complexity Analysis
- **Time Complexity**: O((V + E) log V) with binary heap
- **Space Complexity**: O(V) for distance and previous arrays
- **Optimality**: Guaranteed optimal for non-negative weights
- **Limitation**: Cannot handle negative edge weights
- **Real-world Use**: GPS navigation, network routing (OSPF protocol)

### 3.3.4 Edge Relaxation Concept
```
For each edge (u, v) with weight w:
Current estimate: Distance[v]
New estimate: Distance[u] + w

If new_estimate < current_estimate:
  Update Distance[v] = new_estimate (RELAX)
  Update Previous[v] = u
Else:
  No update (edge is not beneficial)

Visualization:
- Show edge weight as label
- Relaxing edge: edge turns green, distance updates
- Non-relaxing edge: edge dims, "not beneficial" label
```

### 3.3.5 Visualization Representation
```
Nodes:
- Unvisited: gray
- In frontier (priority queue): yellow, sorted by distance
- Visited: green, filled
- Current exploring: red, larger

Edges:
- Unvisited: gray
- Being relaxed: green, thick, animated
- Relaxed (in shortest path tree): dark green
- Not relaxed: gray dashed

Labels:
- Distance from start: show on each node
- Priority queue contents in sidebar
- Current best distance to each node highlighted
```

## 3.4 A* (A-Star) Algorithm

### 3.4.1 Algorithm Overview
Informed search that combines actual distance (g) and heuristic estimate (h). Faster than Dijkstra for point-to-point searches.

### 3.4.2 Pseudocode
```
Algorithm: AStar(Graph, Start, Goal, Heuristic)
Input: Graph, Start, Goal, Heuristic function h
Output: Shortest path from Start to Goal

1. Initialize:
   - g_score = {all nodes: ∞}
   - g_score[Start] = 0
   - f_score = {all nodes: ∞}
   - f_score[Start] = h(Start, Goal)
   - Previous = {all nodes: None}
   - OpenSet = PriorityQueue([(f_score[Start], Start)])
   - ClosedSet = {}
   - Frontier = [Start]

2. While OpenSet not empty:
   a. current_node = OpenSet.pop_min()
   
   b. If current_node == Goal:
      Return reconstruct_path(Previous, Goal)
   
   c. ClosedSet.add(current_node)
   
   d. For each (neighbor, weight) in Graph[current_node]:
      i.   tentative_g = g_score[current_node] + weight
      
      ii.  If neighbor in ClosedSet:
           Continue
      
      iii. If tentative_g < g_score[neighbor]:
           - previous[neighbor] = current_node
           - g_score[neighbor] = tentative_g
           - h_val = h(neighbor, Goal)
           - f_score[neighbor] = g_score[neighbor] + h_val
           - OpenSet.push((f_score[neighbor], neighbor))
           
           - Emit step: {
             "action": "evaluate_neighbor",
             "from": current_node,
             "to": neighbor,
             "g": g_score[neighbor],
             "h": h_val,
             "f": f_score[neighbor],
             "improved": true
             }

3. Return: No path found

Helper: Heuristic functions
h_manhattan(node, goal) = |node.x - goal.x| + |node.y - goal.y|
h_euclidean(node, goal) = sqrt((node.x-goal.x)² + (node.y-goal.y)²)
h_zero(node, goal) = 0  (reduces to Dijkstra)
```

### 3.4.3 Heuristic Functions
```
Definition: h(n) is admissible if h(n) <= actual_cost(n, goal)
An admissible heuristic never overestimates the cost to goal.

Manhattan Distance (Grid-based):
h = |x1 - x2| + |y1 - y2|
Use when: movement is up/down/left/right (4-directional)

Euclidean Distance:
h = sqrt((x1-x2)² + (y1-y2)²)
Use when: movement is in any direction (8-directional)

Zero Heuristic:
h = 0
Use when: want Dijkstra's behavior
```

### 3.4.4 Complexity Analysis
- **Time Complexity**: O(E log V) with good heuristic (can be O(log V) best case)
- **Space Complexity**: O(V)
- **Optimality**: Guaranteed optimal if heuristic is admissible
- **Speed**: Much faster than Dijkstra for point-to-point search
- **Real-world Use**: Game pathfinding, robotics navigation, route planning

### 3.4.5 Visualization Representation
```
Nodes:
- Unvisited: gray
- In OpenSet (frontier): blue, sorted by f_score
- In ClosedSet (explored): green, filled
- Goal node: gold star
- Current exploring: red

Edges:
- Being evaluated: yellow, thin
- In optimal path: green, thick

Labels:
- Show g(n), h(n), f(n) = g(n) + h(n) on each node
- OpenSet contents in sidebar
- Heuristic strength indicator
```

## 3.5 Kruskal's Algorithm

### 3.5.1 Algorithm Overview
Finds minimum spanning tree by greedily selecting edges in ascending weight order. Uses union-find for cycle detection.

### 3.5.2 Pseudocode
```
Algorithm: Kruskal(Graph)
Input: Weighted undirected graph
Output: Minimum spanning tree (list of edges)

1. Initialize:
   - MST_edges = []
   - UnionFind = UnionFind(all nodes)
   - Sorted_edges = sort(all edges by weight ascending)
   - Frontier = []
   - Components = (count of nodes)

2. For each edge (u, v, weight) in Sorted_edges:
   a. root_u = UnionFind.find(u)
   b. root_v = UnionFind.find(v)
   
   c. If root_u != root_v:
      i.   UnionFind.union(root_u, root_v)
      ii.  MST_edges.append((u, v, weight))
      iii. Components -= 1
      iv.  Emit step: {
           "action": "add_edge",
           "edge": (u, v),
           "weight": weight,
           "reason": "connects_components",
           "mst_size": len(MST_edges),
           "frontier": copy(MST_edges)
           }
   Else:
      v.   Emit step: {
           "action": "skip_edge",
           "edge": (u, v),
           "weight": weight,
           "reason": "creates_cycle"
           }
   
   d. If Components == 1:
      Break (tree is complete)

3. Return: MST_edges, total_weight = sum(weights)

Data Structure: Union-Find (Disjoint Set Union)
class UnionFind:
  parent = {node: node for all nodes}
  rank = {node: 0}
  
  def find(x):
    if parent[x] != x:
      parent[x] = find(parent[x])  # Path compression
    return parent[x]
  
  def union(x, y):
    root_x = find(x)
    root_y = find(y)
    if rank[root_x] < rank[root_y]:
      parent[root_x] = root_y
    elif rank[root_x] > rank[root_y]:
      parent[root_y] = root_x
    else:
      parent[root_y] = root_x
      rank[root_x] += 1
```

### 3.5.3 Union-Find Optimization
```
Path Compression:
When finding root, flatten the tree structure.
Before: chain of parents
After: all point directly to root
Effect: O(log n) → nearly O(1) amortized

Union by Rank:
Always attach shorter tree under taller tree.
Prevents degeneracy to linked list.
Effect: Keeps height logarithmic
```

### 3.5.4 Complexity Analysis
- **Time Complexity**: O(E log E) for sorting + O(E α(V)) for union-find
  - α(V) is inverse Ackermann (practically constant)
  - Overall: O(E log E)
- **Space Complexity**: O(V + E)
- **Optimality**: Guaranteed to produce minimum spanning tree
- **Real-world Use**: Network design, circuit board drilling, clustering

### 3.5.5 Visualization Representation
```
Nodes:
- Unvisited: gray
- In same component (merged): same color
- Components visualized with colored regions

Edges:
- Sorted by weight (show queue in sidebar)
- Being evaluated: yellow highlight
- Added to MST: green, thick
- Rejected (would create cycle): red dashed with "✗"

Union-Find State:
- Show parent pointers as tree structure
- Path compression visualization: chains compress into single link
- Component grouping with colored bounds
```

## 3.6 Bellman-Ford Algorithm

### 3.6.1 Algorithm Overview
Finds shortest paths from source to all nodes. Can handle negative edge weights. Detects negative cycles.

### 3.6.2 Pseudocode
```
Algorithm: BellmanFord(Graph, Start)
Input: Directed weighted graph, Start node
Output: Shortest distances, negative cycle detection

1. Initialize:
   - Distance = {all nodes: ∞}
   - Distance[Start] = 0
   - Previous = {all nodes: None}
   - Iterations = 0

2. Relax edges V-1 times:
   For iteration in range(1, V):
     a. changed = False
     b. For each edge (u, v, weight):
        i.   If Distance[u] + weight < Distance[v]:
             - Distance[v] = Distance[u] + weight
             - Previous[v] = u
             - changed = True
             - Emit step: {
               "action": "relax_edge",
               "edge": (u, v, weight),
               "iteration": iteration,
               "new_distance": Distance[v]
               }
     
     c. If not changed:
        Break (converged early)
     
     d. Iterations += 1

3. Detect negative cycles:
   For each edge (u, v, weight):
     If Distance[u] + weight < Distance[v]:
       Return: negative_cycle_detected = True
               cycle_nodes = [nodes affected by cycle]

4. Return:
   - Distance (shortest paths)
   - Previous (path reconstruction)
   - negative_cycle_found (True/False)

Negative Cycle Detection:
If distances can still improve after V-1 iterations,
a negative cycle exists. Nodes in cycle have no valid shortest path.
```

### 3.6.3 Why V-1 Iterations?
```
In any graph without cycles, shortest path has ≤ V-1 edges.
Each iteration relaxes one edge in the path.
After V-1 iterations, all shortest paths are found.

Example: Path of length 4 (4 edges, 5 nodes)
Iteration 1: Relax first edge
Iteration 2: Relax second edge
Iteration 3: Relax third edge
Iteration 4: Relax fourth edge (V-1 = 5-1 = 4)

The Vth iteration is only for detecting negative cycles.
```

### 3.6.4 Complexity Analysis
- **Time Complexity**: O(V * E) — relaxes edges V-1 times
- **Space Complexity**: O(V)
- **Optimality**: Guaranteed optimal even with negative weights
- **Limitation**: Slow for large graphs (worse than Dijkstra)
- **Advantage**: Detects negative cycles
- **Real-world Use**: Currency arbitrage detection, traffic routing with negative incentives

### 3.6.5 Visualization Representation
```
Nodes:
- Unvisited: gray
- Distance updating: yellow highlight
- Finalized distance: green
- In negative cycle: red, with warning

Edges:
- Being relaxed: blue arrow, animated
- Not improved: gray dashed
- Negative weight: red label

Iteration Counter:
- Show current iteration / V-1
- Distance changes per iteration in log
- Early termination indicator
```

---

# 4. PYTHON BACKEND SPECIFICATION

## 4.1 Backend Architecture

```
backend/
├── app.py                    ← FastAPI application entry point
├── config.py                 ← Configuration (env vars, settings)
├── requirements.txt          ← Python dependencies
├── Dockerfile                ← Container configuration
│
├── core/
│   ├── algorithms/
│   │   ├── __init__.py
│   │   ├── bfs.py           ← BFS implementation
│   │   ├── dfs.py           ← DFS implementation
│   │   ├── dijkstra.py      ← Dijkstra implementation
│   │   ├── astar.py         ← A* implementation
│   │   ├── kruskal.py       ← Kruskal implementation
│   │   ├── bellman_ford.py  ← Bellman-Ford implementation
│   │   └── base.py          ← Base algorithm class
│   │
│   ├── data_structures/
│   │   ├── __init__.py
│   │   ├── graph.py         ← Graph class
│   │   ├── node.py          ← Node class
│   │   ├── edge.py          ← Edge class
│   │   ├── priority_queue.py ← Min-heap priority queue
│   │   └── union_find.py    ← Union-find data structure
│   │
│   └── complexity/
│       ├── __init__.py
│       └── analyzer.py      ← Complexity calculation
│
├── services/
│   ├── __init__.py
│   ├── algorithm_service.py ← Orchestrates algorithm execution
│   ├── graph_service.py     ← Graph validation & operations
│   ├── quiz_service.py      ← Quiz generation & grading
│   ├── chatbot_service.py   ← Claude API integration
│   └── student_service.py   ← Student progress tracking
│
├── models/
│   ├── __init__.py
│   ├── graph_model.py       ← Pydantic models for graphs
│   ├── algorithm_model.py   ← Algorithm request/response models
│   ├── quiz_model.py        ← Quiz models
│   └── student_model.py     ← Student & progress models
│
├── routes/
│   ├── __init__.py
│   ├── algorithm_routes.py  ← Algorithm endpoints
│   ├── quiz_routes.py       ← Quiz endpoints
│   ├── chatbot_routes.py    ← Chatbot endpoints
│   └── student_routes.py    ← Student progress endpoints
│
├── db/
│   ├── __init__.py
│   ├── database.py          ← SQLAlchemy connection
│   ├── models.py            ← ORM models (Student, Quiz, Progress)
│   └── crud.py              ← Database operations
│
└── utils/
    ├── __init__.py
    ├── logger.py            ← Logging configuration
    └── validators.py        ← Input validation
```

## 4.2 Core Data Structures

### 4.2.1 Graph Class

```python
# core/data_structures/graph.py

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
```

### 4.2.2 Priority Queue Implementation

```python
# core/data_structures/priority_queue.py

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
```

### 4.2.3 Union-Find Data Structure

```python
# core/data_structures/union_find.py

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
```

## 4.3 Algorithm Implementation Pattern

### 4.3.1 Base Algorithm Class

```python
# core/algorithms/base.py

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
```

### 4.3.2 BFS Implementation

```python
# core/algorithms/bfs.py

from typing import Dict, Any, Optional, Set
from collections import deque
from .base import BaseAlgorithm, AlgorithmStep
from core.data_structures.graph import Graph

class BFS(BaseAlgorithm):
    """Breadth-First Search implementation."""
    
    def execute(self, start_node: str, goal_node: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute BFS from start node.
        
        Args:
            start_node: Starting node ID
            goal_node: Optional goal node (for early termination)
        
        Returns:
            Dictionary with execution results
        """
        # Validation
        if start_node not in self.graph.nodes:
            raise ValueError(f"Start node {start_node} not found")
        
        # Initialize
        queue = deque([start_node])
        visited = {start_node}
        distance = {node_id: float('inf') for node_id in self.graph.nodes}
        distance[start_node] = 0
        parent = {node_id: None for node_id in self.graph.nodes}
        
        self.add_step(
            "initialize",
            node=start_node,
            frontier=[start_node],
            visited=visited,
            message=f"Starting BFS from {start_node}"
        )
        
        while queue:
            current = queue.popleft()
            
            self.add_step(
                "visit_node",
                node=current,
                frontier=list(queue),
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
            
            # Explore neighbors
            for neighbor, _ in self.graph.get_neighbors(current):
                if neighbor not in visited:
                    visited.add(neighbor)
                    distance[neighbor] = distance[current] + 1
                    parent[neighbor] = current
                    queue.append(neighbor)
                    
                    self.add_step(
                        "explore",
                        node=neighbor,
                        nodes_involved=[current, neighbor],
                        frontier=list(queue),
                        visited=visited,
                        state_snapshot={
                            "distance": distance.copy(),
                            "parent": parent.copy()
                        },
                        message=f"Explored neighbor {neighbor} from {current}"
                    )
        
        return {
            "algorithm": "BFS",
            "visited_order": list(visited),
            "distance": distance,
            "parent_tree": parent,
            "steps": [step.to_dict() for step in self.steps]
        }
```

### 4.3.3 Dijkstra Implementation

```python
# core/algorithms/dijkstra.py

from typing import Dict, Any, Optional, Set
from core.data_structures.priority_queue import MinHeap
from .base import BaseAlgorithm

class Dijkstra(BaseAlgorithm):
    """Dijkstra's shortest path algorithm."""
    
    def execute(self, start_node: str, goal_node: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute Dijkstra's algorithm.
        
        Args:
            start_node: Starting node ID
            goal_node: Optional goal node (for early termination)
        
        Returns:
            Dictionary with shortest distances and parent pointers
        """
        if start_node not in self.graph.nodes:
            raise ValueError(f"Start node {start_node} not found")
        
        # Initialize
        distance = {node_id: float('inf') for node_id in self.graph.nodes}
        distance[start_node] = 0
        previous = {node_id: None for node_id in self.graph.nodes}
        visited: Set[str] = set()
        pq = MinHeap()
        pq.push(0, start_node)
        
        self.add_step(
            "initialize",
            node=start_node,
            frontier=[start_node],
            message="Dijkstra initialized"
        )
        
        while not pq.is_empty():
            current_dist, current = pq.pop()
            
            if current in visited:
                continue
            
            visited.add(current)
            
            self.add_step(
                "visit_node",
                node=current,
                state_snapshot={"distance": distance.copy()},
                message=f"Processing node {current} with distance {current_dist}"
            )
            
            if current == goal_node:
                self.add_step(
                    "goal_reached",
                    node=goal_node,
                    message=f"Reached goal {goal_node} with distance {distance[goal_node]}"
                )
                break
            
            # Relax edges
            for neighbor, weight in self.graph.get_neighbors(current):
                new_dist = distance[current] + weight
                
                if new_dist < distance[neighbor]:
                    distance[neighbor] = new_dist
                    previous[neighbor] = current
                    pq.push(new_dist, neighbor)
                    
                    self.add_step(
                        "relax_edge",
                        edge=(current, neighbor),
                        nodes_involved=[current, neighbor],
                        state_snapshot={
                            "distance": distance.copy(),
                            "previous": previous.copy()
                        },
                        message=f"Relaxed edge ({current}, {neighbor}): new distance {new_dist}"
                    )
                else:
                    self.add_step(
                        "skip_edge",
                        edge=(current, neighbor),
                        message=f"Edge ({current}, {neighbor}) not improved"
                    )
        
        return {
            "algorithm": "Dijkstra",
            "distances": distance,
            "previous": previous,
            "visited": list(visited),
            "steps": [step.to_dict() for step in self.steps]
        }
```

## 4.4 Service Layer

### 4.4.1 Algorithm Service

```python
# services/algorithm_service.py

from typing import Dict, Any, Optional
from core.data_structures.graph import Graph
from core.algorithms.bfs import BFS
from core.algorithms.dfs import DFS
from core.algorithms.dijkstra import Dijkstra
from core.algorithms.astar import AStar
from core.algorithms.kruskal import Kruskal
from core.algorithms.bellman_ford import BellmanFord
from core.complexity.analyzer import ComplexityAnalyzer

class AlgorithmService:
    """Orchestrates algorithm execution and analysis."""
    
    ALGORITHMS = {
        "BFS": BFS,
        "DFS": DFS,
        "Dijkstra": Dijkstra,
        "A*": AStar,
        "Kruskal": Kruskal,
        "Bellman-Ford": BellmanFord
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
        
        return result
    
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
```

### 4.4.2 Chatbot Service

```python
# services/chatbot_service.py

import os
from typing import List, Dict, Any, Optional
import anthropic

class ChatbotService:
    """Claude-based chatbot integration."""
    
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    def build_system_prompt(self, context: Dict[str, Any]) -> str:
        """Build dynamic system prompt with context."""
        return f"""You are AlgoMind, a supportive and encouraging AI tutor for an algorithm simulation lab. 
You help students understand graph algorithms through clear explanations, step-by-step guidance, and real-world analogies.

PERSONALITY:
- Always be warm, patient, and enthusiastic
- Celebrate effort and progress, not just correct answers
- Never make students feel stupid for basic questions
- Use analogies and real-world examples
- Keep responses concise (3-5 sentences for simple questions)

CURRENT CONTEXT:
- Algorithm: {context.get('algorithm', 'Unknown')}
- Graph Size: {context.get('graph_size', 'Unknown')}
- Current Step: {context.get('current_step', 'Not running')}
- Student Progress: {context.get('progress', 'Unknown')}

CAPABILITIES:
- Explain how algorithms work conceptually
- Compare algorithms when asked
- Explain time/space complexity
- Give hints (never direct answers) for quizzes

RULES:
- Never give direct quiz answers
- If student is frustrated, acknowledge it and offer fresh angle
- Always end with an encouraging follow-up question
"""
    
    def get_response(
        self,
        messages: List[Dict[str, str]],
        context: Dict[str, Any],
        stream: bool = True
    ):
        """
        Get ChatBot response from Claude.
        
        Args:
            messages: Conversation history
            context: Algorithm context
            stream: Whether to stream response
        
        Yields/Returns:
            Response text or stream of text chunks
        """
        system_prompt = self.build_system_prompt(context)
        
        if stream:
            with self.client.messages.stream(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                system=system_prompt,
                messages=messages
            ) as stream:
                for text in stream.text_stream:
                    yield text
        else:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                system=system_prompt,
                messages=messages
            )
            return response.content[0].text
```

## 4.5 Complexity Analyzer

```python
# core/complexity/analyzer.py

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
            return (v + e) * __import__('math').log(v + 1)
        elif algorithm == "A*":
            return e * __import__('math').log(v + 1)
        elif algorithm == "Kruskal":
            return e * __import__('math').log(e + 1)
        elif algorithm == "Bellman-Ford":
            return v * e
        return 0
```

---

# 5. FRONTEND SPECIFICATION

## 5.1 Frontend Architecture

```
frontend/
├── app/
│   ├── layout.tsx           ← Root layout
│   ├── page.tsx             ← Home page
│   ├── providers.tsx        ← Providers (Zustand, etc.)
│   ├── page.module.css      ← Styling
│   │
│   ├── simulator/
│   │   ├── page.tsx         ← Main simulator page
│   │   ├── layout.tsx       ← Simulator layout
│   │   └── simulator.module.css
│   │
│   ├── quiz/
│   │   ├── page.tsx         ← Quiz page
│   │   └── quiz.module.css
│   │
│   ├── dashboard/
│   │   ├── page.tsx         ← Student progress dashboard
│   │   └── dashboard.module.css
│   │
│   └── api/
│       └── chat/
│           └── route.ts     ← Chat streaming endpoint
│
├── components/
│   ├── Simulator/
│   │   ├── Simulator.tsx    ← Main simulator component
│   │   ├── Canvas.tsx       ← Canvas rendering component
│   │   ├── Controls.tsx     ← Play/pause/reset buttons
│   │   ├── Debugger.tsx     ← Step inspector
│   │   └── GraphEditor.tsx  ← Graph creation interface
│   │
│   ├── ChatBot/
│   │   ├── ChatBot.tsx      ← Chat panel
│   │   ├── ChatMessage.tsx  ← Message bubble
│   │   ├── ChatInput.tsx    ← Input field
│   │   ├── TypingIndicator.tsx
│   │   └── SuggestedPrompts.tsx
│   │
│   ├── Quiz/
│   │   ├── QuizModule.tsx   ← Quiz container
│   │   ├── Question.tsx     ← Single question
│   │   └── Results.tsx      ← Quiz results
│   │
│   ├── Common/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   ├── Sidebar.tsx
│   │   └── Modal.tsx
│   │
│   └── Visualization/
│       ├── Graph.tsx        ← Graph visualization helper
│       ├── Node.tsx         ← Node component
│       ├── Edge.tsx         ← Edge component
│       └── Legend.tsx       ← Color legend
│
├── hooks/
│   ├── useGraphStore.ts     ← Graph state hook
│   ├── useSimulation.ts     ← Simulation state hook
│   ├── useChat.ts           ← Chat hook
│   ├── useCanvas.ts         ← Canvas hook
│   └── useAutoSave.ts       ← Auto-save hook
│
├── store/
│   ├── graphStore.ts        ← Zustand graph state
│   ├── simulationStore.ts   ← Zustand simulation state
│   ├── chatStore.ts         ← Zustand chat state
│   └── userStore.ts         ← Zustand user progress
│
├── services/
│   ├── api.ts               ← API client
│   ├── algorithmService.ts  ← Algorithm API calls
│   ├── chatService.ts       ← Chat API calls
│   └── storageService.ts    ← LocalStorage/SessionStorage
│
├── types/
│   ├── index.ts             ← TypeScript types
│   ├── algorithm.ts         ← Algorithm types
│   ├── graph.ts             ← Graph types
│   └── chat.ts              ← Chat types
│
├── utils/
│   ├── canvas.ts            ← Canvas drawing utilities
│   ├── colors.ts            ← Color schemes
│   ├── formatting.ts        ← Format utilities
│   └── validation.ts        ← Validation utilities
│
├── styles/
│   ├── globals.css          ← Global styles
│   ├── variables.css        ← CSS variables
│   └── animations.css       ← Animations
│
├── public/
│   ├── images/
│   └── icons/
│
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 5.2 State Management (Zustand)

### 5.2.1 Graph Store

```typescript
// store/graphStore.ts

import { create } from 'zustand';
import { Node, Edge, Graph } from '@/types/graph';

interface GraphState {
  // State
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;
  selectedEdge: string | null;
  isDirected: boolean;
  
  // Actions
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  updateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
  
  setGraph: (graph: Graph) => void;
  clearGraph: () => void;
  
  toggleDirected: () => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  isDirected: false,
  
  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node]
    })),
  
  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId)
    })),
  
  updateNode: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, ...updates } : n
      )
    })),
  
  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge]
    })),
  
  removeEdge: (edgeId) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId)
    })),
  
  updateEdge: (edgeId, updates) =>
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId ? { ...e, ...updates } : e
      )
    })),
  
  selectNode: (nodeId) => set({ selectedNode: nodeId }),
  selectEdge: (edgeId) => set({ selectedEdge: edgeId }),
  
  setGraph: (graph) =>
    set({
      nodes: graph.nodes,
      edges: graph.edges,
      isDirected: graph.isDirected
    }),
  
  clearGraph: () =>
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      selectedEdge: null
    }),
  
  toggleDirected: () =>
    set((state) => ({ isDirected: !state.isDirected }))
}));
```

### 5.2.2 Simulation Store

```typescript
// store/simulationStore.ts

import { create } from 'zustand';
import { AlgorithmStep } from '@/types/algorithm';

interface SimulationState {
  // State
  algorithm: string | null;
  startNode: string | null;
  goalNode: string | null;
  isRunning: boolean;
  isPaused: boolean;
  currentStepIndex: number;
  steps: AlgorithmStep[];
  result: any;
  
  // Actions
  setAlgorithm: (algorithm: string) => void;
  setStartNode: (nodeId: string) => void;
  setGoalNode: (nodeId: string | null) => void;
  
  startSimulation: (steps: AlgorithmStep[], result: any) => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepIndex: number) => void;
  
  getCurrentStep: () => AlgorithmStep | null;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  algorithm: null,
  startNode: null,
  goalNode: null,
  isRunning: false,
  isPaused: false,
  currentStepIndex: 0,
  steps: [],
  result: null,
  
  setAlgorithm: (algorithm) => set({ algorithm }),
  setStartNode: (nodeId) => set({ startNode: nodeId }),
  setGoalNode: (nodeId) => set({ goalNode: nodeId }),
  
  startSimulation: (steps, result) =>
    set({
      isRunning: true,
      isPaused: false,
      currentStepIndex: 0,
      steps,
      result
    }),
  
  pauseSimulation: () => set({ isPaused: true }),
  resumeSimulation: () => set({ isPaused: false }),
  
  resetSimulation: () =>
    set({
      isRunning: false,
      isPaused: false,
      currentStepIndex: 0,
      steps: [],
      result: null
    }),
  
  nextStep: () =>
    set((state) => ({
      currentStepIndex: Math.min(state.currentStepIndex + 1, state.steps.length - 1)
    })),
  
  prevStep: () =>
    set((state) => ({
      currentStepIndex: Math.max(state.currentStepIndex - 1, 0)
    })),
  
  goToStep: (stepIndex) =>
    set({
      currentStepIndex: Math.max(0, Math.min(stepIndex, get().steps.length - 1))
    }),
  
  getCurrentStep: () => {
    const state = get();
    return state.steps[state.currentStepIndex] || null;
  }
}));
```

## 5.3 Canvas Visualization Component

### 5.3.1 Canvas Drawing Utilities

```typescript
// utils/canvas.ts

interface DrawOptions {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
}

export class CanvasDrawer {
  constructor(private ctx: CanvasRenderingContext2D) {}
  
  drawCircle(
    x: number,
    y: number,
    radius: number,
    options: DrawOptions = {}
  ) {
    const {
      fillColor = '#3b82f6',
      strokeColor = '#1f2937',
      strokeWidth = 2
    } = options;
    
    this.ctx.fillStyle = fillColor;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = strokeWidth;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
  }
  
  drawText(
    text: string,
    x: number,
    y: number,
    options: DrawOptions = {}
  ) {
    const {
      fillColor = '#ffffff',
      fontSize = 16,
      fontFamily = 'Arial'
    } = options;
    
    this.ctx.fillStyle = fillColor;
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    this.ctx.fillText(text, x, y);
  }
  
  drawArrow(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    options: DrawOptions = {}
  ) {
    const {
      strokeColor = '#1f2937',
      strokeWidth = 2
    } = options;
    
    const headlen = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = strokeWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
    
    // Arrow head
    this.ctx.beginPath();
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    this.ctx.stroke();
  }
}
```

### 5.3.2 Canvas Component

```typescript
// components/Simulator/Canvas.tsx

'use client';

import React, { useEffect, useRef } from 'react';
import { useGraphStore } from '@/store/graphStore';
import { useSimulationStore } from '@/store/simulationStore';
import { CanvasDrawer } from '@/utils/canvas';

interface CanvasProps {
  width?: number;
  height?: number;
}

export const Canvas: React.FC<CanvasProps> = ({ width = 800, height = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { nodes, edges } = useGraphStore();
  const { steps, currentStepIndex } = useSimulationStore();
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
    
    const drawer = new CanvasDrawer(ctx);
    
    // Draw edges first
    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        drawer.drawArrow(
          sourceNode.x,
          sourceNode.y,
          targetNode.x,
          targetNode.y,
          {
            strokeColor: edge.color || '#6b7280',
            strokeWidth: 2
          }
        );
        
        // Draw weight label
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        drawer.drawText(edge.weight.toString(), midX, midY - 10, {
          fontSize: 12,
          fillColor: '#1f2937'
        });
      }
    });
    
    // Draw nodes
    nodes.forEach((node) => {
      drawer.drawCircle(node.x, node.y, 25, {
        fillColor: node.color || '#3b82f6',
        strokeColor: '#1f2937',
        strokeWidth: 2
      });
      
      drawer.drawText(node.label, node.x, node.y, {
        fillColor: '#ffffff',
        fontSize: 14
      });
    });
  }, [nodes, edges, width, height]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: '1px solid #d1d5db', borderRadius: '8px' }}
    />
  );
};
```

---

# 6. VISUALIZATION ENGINE

## 6.1 Animation System

### 6.1.1 Step-by-Step Animation

```typescript
// utils/animation.ts

interface AnimationFrame {
  timestamp: number;
  nodeUpdates: Map<string, Partial<Node>>;
  edgeUpdates: Map<string, Partial<Edge>>;
}

class StepAnimator {
  private frameDuration: number = 500; // ms per step
  private isAnimating: boolean = false;
  
  async animateStep(
    step: AlgorithmStep,
    onUpdate: (frame: AnimationFrame) => void
  ): Promise<void> {
    this.isAnimating = true;
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / this.frameDuration, 1);
        
        // Calculate intermediate state
        const frame = this.interpolateStep(step, progress);
        onUpdate(frame);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isAnimating = false;
          resolve();
        }
      };
      
      animate();
    });
  }
  
  private interpolateStep(step: AlgorithmStep, progress: number): AnimationFrame {
    const nodeUpdates = new Map<string, Partial<Node>>();
    const edgeUpdates = new Map<string, Partial<Edge>>();
    
    // Apply easing function (ease-in-out)
    const eased = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;
    
    // Update node colors based on action
    if (step.action === 'explore' && step.node) {
      nodeUpdates.set(step.node, {
        color: this._interpolateColor('#3b82f6', '#10b981', eased)
      });
    }
    
    return {
      timestamp: Date.now(),
      nodeUpdates,
      edgeUpdates
    };
  }
  
  private _interpolateColor(from: string, to: string, progress: number): string {
    // Implement color interpolation (RGB)
    const fromRgb = this._hexToRgb(from);
    const toRgb = this._hexToRgb(to);
    
    const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * progress);
    const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * progress);
    const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * progress);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  private _hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return {
      r: parseInt(result![1], 16),
      g: parseInt(result![2], 16),
      b: parseInt(result![3], 16)
    };
  }
}
```

## 6.2 Color Schemes

```typescript
// utils/colors.ts

export const ALGORITHM_COLORS = {
  unvisited: '#9ca3af',      // Gray
  frontier: '#3b82f6',       // Blue
  visiting: '#f97316',       // Orange
  visited: '#10b981',        // Green
  current: '#ef4444',        // Red
  goal: '#fbbf24',           // Yellow
  solution: '#8b5cf6'        // Purple
};

export const STATE_INDICATORS = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f97316',
  info: '#3b82f6'
};

export function getNodeColor(state: string): string {
  return ALGORITHM_COLORS[state as keyof typeof ALGORITHM_COLORS] || '#9ca3af';
}
```

---

# 7. STEP-BY-STEP SIMULATOR

## 7.1 Simulator Component

```typescript
// components/Simulator/Simulator.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useGraphStore } from '@/store/graphStore';
import { useSimulationStore } from '@/store/simulationStore';
import { algorithmService } from '@/services/algorithmService';
import { Canvas } from './Canvas';
import { Controls } from './Controls';
import { Debugger } from './Debugger';
import { StepAnimator } from '@/utils/animation';

export const Simulator: React.FC = () => {
  const graphStore = useGraphStore();
  const simulationStore = useSimulationStore();
  const [isLoading, setIsLoading] = useState(false);
  const animator = new StepAnimator();
  
  const handleRunAlgorithm = async () => {
    setIsLoading(true);
    try {
      const result = await algorithmService.execute(
        {
          nodes: graphStore.nodes,
          edges: graphStore.edges,
          is_directed: graphStore.isDirected
        },
        simulationStore.algorithm!,
        {
          start_node: simulationStore.startNode,
          goal_node: simulationStore.goalNode
        }
      );
      
      simulationStore.startSimulation(result.steps, result);
    } catch (error) {
      console.error('Algorithm execution failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNextStep = async () => {
    const currentStep = simulationStore.getCurrentStep();
    if (currentStep) {
      await animator.animateStep(currentStep, (frame) => {
        // Update UI with animation frame
        // This would update Zustand stores
      });
    }
    simulationStore.nextStep();
  };
  
  return (
    <div className="flex h-screen gap-4 p-4">
      {/* Main visualization */}
      <div className="flex-1 flex flex-col">
        <Canvas width={800} height={600} />
        <Controls
          onRun={handleRunAlgorithm}
          onNext={handleNextStep}
          isLoading={isLoading}
        />
      </div>
      
      {/* Debugger/Inspector */}
      <div className="w-80 border-l pl-4">
        <Debugger />
      </div>
    </div>
  );
};
```

---

# 8. QUIZ & ASSESSMENT SYSTEM

## 8.1 Quiz Service (Backend)

```python
# services/quiz_service.py

from typing import Dict, List, Any
import random

class QuizService:
    """Generates and grades algorithm quizzes."""
    
    @staticmethod
    def generate_quiz(algorithm: str, difficulty: str = "medium") -> Dict[str, Any]:
        """
        Generate a quiz for an algorithm.
        
        Args:
            algorithm: Algorithm name
            difficulty: "easy", "medium", "hard"
        
        Returns:
            Quiz object with questions
        """
        questions = QuizService._generate_questions(algorithm, difficulty)
        return {
            "algorithm": algorithm,
            "difficulty": difficulty,
            "questions": questions,
            "total_questions": len(questions)
        }
    
    @staticmethod
    def _generate_questions(algorithm: str, difficulty: str) -> List[Dict[str, Any]]:
        """Generate questions for specific algorithm."""
        question_bank = {
            "BFS": [
                {
                    "type": "multiple_choice",
                    "question": "What data structure does BFS use?",
                    "options": ["Stack", "Queue", "Priority Queue", "Heap"],
                    "correct": 1,
                    "explanation": "BFS uses a queue (FIFO) to explore nodes level by level."
                },
                {
                    "type": "true_false",
                    "question": "BFS always finds the shortest path in weighted graphs.",
                    "correct": False,
                    "explanation": "BFS guarantees shortest path only in unweighted graphs."
                },
                {
                    "type": "code_trace",
                    "question": "Trace BFS from node A in the given graph. What is the visit order?",
                    "graph": {"nodes": ["A", "B", "C", "D"], "edges": [("A", "B"), ("A", "C"), ("B", "D")]},
                    "correct": ["A", "B", "C", "D"],
                    "explanation": "BFS explores level by level: first A, then B and C, then D."
                }
            ],
            # ... other algorithms
        }
        
        questions = question_bank.get(algorithm, [])
        
        # Filter by difficulty (for now, return all)
        return random.sample(questions, min(5, len(questions)))
    
    @staticmethod
    def grade_answer(
        question: Dict[str, Any],
        student_answer: Any
    ) -> Dict[str, Any]:
        """
        Grade a student's answer.
        
        Returns:
            {
                "is_correct": bool,
                "feedback": str,
                "explanation": str
            }
        """
        is_correct = student_answer == question["correct"]
        
        return {
            "is_correct": is_correct,
            "feedback": "Correct!" if is_correct else "Incorrect, try again.",
            "explanation": question.get("explanation", "")
        }
```

---

# 9. CHATBOT INTEGRATION

## 9.1 Chat API Route

```typescript
// app/api/chat/route.ts

import { StreamingTextResponse } from 'ai';
import { chatbotService } from '@/lib/chatbotService';

export async function POST(req: Request) {
  const { messages, context } = await req.json();
  
  try {
    const stream = await chatbotService.getResponse(messages, context);
    return new StreamingTextResponse(stream);
  } catch (error) {
    return new Response('Error processing request', { status: 500 });
  }
}
```

---

# 10. DATABASE SCHEMA

## 10.1 SQLAlchemy ORM Models

```python
# db/models.py

from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Student(Base):
    __tablename__ = "students"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(String, primary_key=True)
    student_id = Column(String, ForeignKey("students.id"))
    algorithm = Column(String, index=True)
    score = Column(Float)  # 0-100
    total_questions = Column(Integer)
    correct_answers = Column(Integer)
    attempted_at = Column(DateTime, default=datetime.utcnow)

class StudentProgress(Base):
    __tablename__ = "student_progress"
    
    id = Column(String, primary_key=True)
    student_id = Column(String, ForeignKey("students.id"), unique=True)
    algorithms_started = Column(JSON)  # ["BFS", "DFS", ...]
    algorithms_mastered = Column(JSON)  # Algorithms with ≥80% quiz score
    total_time_spent = Column(Integer)  # seconds
    last_accessed = Column(DateTime, default=datetime.utcnow)
```

---

# 11. API ENDPOINTS

## 11.1 Algorithm Endpoints

```
POST /api/v1/algorithms/execute
Request:
{
  "graph": {
    "nodes": [{"id": "A", "label": "A", "x": 100, "y": 100}, ...],
    "edges": [{"source": "A", "target": "B", "weight": 1}, ...],
    "is_directed": false
  },
  "algorithm": "BFS",
  "parameters": {
    "start_node": "A",
    "goal_node": "D"
  }
}

Response:
{
  "algorithm": "BFS",
  "steps": [
    {
      "step_number": 1,
      "action": "initialize",
      "node": "A",
      "frontier": ["A"],
      "message": "Starting BFS from A"
    },
    ...
  ],
  "complexity": {
    "time_complexity": "O(V + E)",
    "space_complexity": "O(V)",
    "estimated_operations": 15
  }
}
```

## 11.2 Quiz Endpoints

```
GET /api/v1/quiz/generate?algorithm=BFS&difficulty=medium
Response:
{
  "algorithm": "BFS",
  "difficulty": "medium",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "What data structure...",
      "options": ["Stack", "Queue", ...],
      "correct": 1  // Don't send to frontend
    }
  ]
}

POST /api/v1/quiz/submit
Request:
{
  "quiz_id": "quiz_123",
  "answers": {
    "q1": 1,
    "q2": true,
    ...
  }
}

Response:
{
  "score": 85,
  "correct": 4,
  "total": 5,
  "feedback": [
    {
      "question_id": "q1",
      "is_correct": true,
      "explanation": "..."
    }
  ]
}
```

## 11.3 Chatbot Endpoints

```
POST /api/v1/chatbot/message
Request:
{
  "messages": [
    {"role": "user", "content": "How does BFS work?"}
  ],
  "context": {
    "algorithm": "BFS",
    "graph_size": "5 nodes, 6 edges",
    "current_step": 3,
    "progress": "started"
  }
}

Response: (Server-Sent Events)
event: message
data: "BFS works by..."

event: message
data: "exploring nodes level by level."
```

---

# 12. COMPLETE FILE STRUCTURE

```
algomind/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   │
│   ├── core/
│   │   ├── algorithms/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── bfs.py
│   │   │   ├── dfs.py
│   │   │   ├── dijkstra.py
│   │   │   ├── astar.py
│   │   │   ├── kruskal.py
│   │   │   └── bellman_ford.py
│   │   │
│   │   ├── data_structures/
│   │   │   ├── __init__.py
│   │   │   ├── graph.py
│   │   │   ├── node.py
│   │   │   ├── edge.py
│   │   │   ├── priority_queue.py
│   │   │   └── union_find.py
│   │   │
│   │   └── complexity/
│   │       ├── __init__.py
│   │       └── analyzer.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── algorithm_service.py
│   │   ├── graph_service.py
│   │   ├── quiz_service.py
│   │   ├── chatbot_service.py
│   │   └── student_service.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── graph_model.py
│   │   ├── algorithm_model.py
│   │   ├── quiz_model.py
│   │   └── student_model.py
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── algorithm_routes.py
│   │   ├── quiz_routes.py
│   │   ├── chatbot_routes.py
│   │   └── student_routes.py
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── crud.py
│   │
│   └── utils/
│       ├── __init__.py
│       ├── logger.py
│       └── validators.py
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   │
│   │   ├── simulator/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── quiz/
│   │   │   └── page.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── Simulator/
│   │   │   ├── Simulator.tsx
│   │   │   ├── Canvas.tsx
│   │   │   ├── Controls.tsx
│   │   │   ├── Debugger.tsx
│   │   │   └── GraphEditor.tsx
│   │   │
│   │   ├── ChatBot/
│   │   │   ├── ChatBot.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   └── SuggestedPrompts.tsx
│   │   │
│   │   ├── Quiz/
│   │   │   ├── QuizModule.tsx
│   │   │   ├── Question.tsx
│   │   │   └── Results.tsx
│   │   │
│   │   ├── Common/
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   └── Visualization/
│   │       ├── Graph.tsx
│   │       ├── Node.tsx
│   │       ├── Edge.tsx
│   │       └── Legend.tsx
│   │
│   ├── hooks/
│   │   ├── useGraphStore.ts
│   │   ├── useSimulation.ts
│   │   ├── useChat.ts
│   │   ├── useCanvas.ts
│   │   └── useAutoSave.ts
│   │
│   ├── store/
│   │   ├── graphStore.ts
│   │   ├── simulationStore.ts
│   │   ├── chatStore.ts
│   │   └── userStore.ts
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── algorithmService.ts
│   │   ├── chatService.ts
│   │   └── storageService.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── algorithm.ts
│   │   ├── graph.ts
│   │   └── chat.ts
│   │
│   ├── utils/
│   │   ├── canvas.ts
│   │   ├── colors.ts
│   │   ├── animation.ts
│   │   ├── formatting.ts
│   │   └── validation.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── animations.css
│   │
│   ├── public/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

---

# 13. IMPLEMENTATION PHASES

## Phase 1: Backend Core (Weeks 1-2)

**Goal**: Build algorithm execution engine

### Week 1
- [ ] Set up FastAPI project structure
- [ ] Implement Graph, Node, Edge data structures
- [ ] Implement BFS algorithm with step tracking
- [ ] Create unit tests for BFS
- [ ] Set up PostgreSQL database schema

### Week 2
- [ ] Implement DFS algorithm
- [ ] Implement Dijkstra algorithm
- [ ] Create complexity analyzer
- [ ] Build algorithm service (orchestrator)
- [ ] Set up API routes for algorithm execution
- [ ] Test with various graph inputs

## Phase 2: Frontend Core (Weeks 2-3)

**Goal**: Build basic UI and graph editor

### Week 2
- [ ] Set up Next.js project
- [ ] Create layout and navigation
- [ ] Build graph editor component (add/remove nodes and edges)
- [ ] Implement Zustand stores (graphStore, simulationStore)
- [ ] Create TypeScript types

### Week 3
- [ ] Build canvas rendering for graphs
- [ ] Connect frontend to backend (API integration)
- [ ] Test graph creation and algorithm execution
- [ ] Create controls (play, pause, next step)

## Phase 3: Visualization & Animation (Weeks 3-4)

**Goal**: Add step-by-step visualization with animations

### Week 3
- [ ] Implement canvas drawing utilities
- [ ] Create color scheme system
- [ ] Build node/edge highlighting logic

### Week 4
- [ ] Implement step animation system
- [ ] Add transition animations
- [ ] Create algorithm step inspector/debugger component
- [ ] Test animations with different algorithms

## Phase 4: Advanced Algorithms (Week 5)

**Goal**: Implement remaining algorithms

- [ ] Implement A* algorithm
- [ ] Implement Kruskal algorithm
- [ ] Implement Bellman-Ford algorithm
- [ ] Test edge cases and negative cycles
- [ ] Update complexity analyzer for all algorithms

## Phase 5: Quiz System (Week 5-6)

**Goal**: Build quiz generation and grading

- [ ] Create quiz service (backend)
- [ ] Implement question types (multiple choice, true/false, code trace)
- [ ] Build quiz UI component (frontend)
- [ ] Connect quiz to student progress tracking
- [ ] Store quiz results in database

## Phase 6: Chatbot Integration (Week 6-7)

**Goal**: Add AI tutoring capability

- [ ] Set up Claude API integration
- [ ] Build system prompt builder with context injection
- [ ] Create chat UI component (floating panel)
- [ ] Implement message streaming
- [ ] Add suggested prompts per algorithm
- [ ] Connect chatbot to graph state context

## Phase 7: Polish & Testing (Week 7-8)

**Goal**: Refine UX and ensure quality

- [ ] Mobile responsive design
- [ ] Message persistence (localStorage)
- [ ] User progress dashboard
- [ ] Tone refinement and prompt engineering
- [ ] Performance optimization
- [ ] Comprehensive testing (unit + integration)
- [ ] Error handling and edge cases

## Phase 8: Deployment (Week 8-9)

**Goal**: Deploy to production

- [ ] Docker containerization (backend + frontend)
- [ ] Environment configuration
- [ ] Database migration
- [ ] Deploy to Vercel (frontend)
- [ ] Deploy to Railway/Render (backend)
- [ ] Set up monitoring and logging
- [ ] Production testing and validation

---

# 14. ENVIRONMENT & DEPLOYMENT

## 14.1 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/algomind_db
SQLALCHEMY_ECHO=True

# API
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=development

# CORS
CORS_ORIGINS=["http://localhost:3000", "https://algomind.vercel.app"]

# AI/Chatbot
ANTHROPIC_API_KEY=sk-...

# Logging
LOG_LEVEL=INFO
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_ENVIRONMENT=development
```

## 14.2 Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: algomind_user
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: algomind_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://algomind_user:secure_password@postgres:5432/algomind_db
    depends_on:
      - postgres
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8000/api/v1
    depends_on:
      - backend

volumes:
  postgres_data:
```

## 14.3 Deployment Steps

### Frontend Deployment (Vercel)
```bash
# Connect GitHub repo to Vercel
# Set environment variables:
# - NEXT_PUBLIC_API_URL=https://algomind-api.railway.app/api/v1

# Vercel auto-deploys on push to main
```

### Backend Deployment (Railway)
```bash
# Create Railway account
# Connect GitHub repo
# Set environment variables (via Railway dashboard):
# - DATABASE_URL (Railway PostgreSQL)
# - ANTHROPIC_API_KEY
# - CORS_ORIGINS=["https://algomind.vercel.app"]

# Railway auto-deploys on push to main
```

---

## CONCLUSION

This is a comprehensive technical specification for building AlgoMind from the ground up. The modular architecture allows for:

- **Clear separation of concerns** between frontend and backend
- **Scalability** through service-oriented design
- **Extensibility** to add new algorithms easily
- **Testability** with isolated components

**Total development time: 8-9 weeks** for a dedicated developer
**Estimated complexity: High** but well-structured

**Next steps:**
1. Set up backend Python project and FastAPI
2. Implement Graph data structure and BFS
3. Build basic Next.js frontend with Zustand
4. Connect frontend to backend
5. Add visualization and animation
6. Implement remaining algorithms
7. Build quiz and chatbot systems
8. Deploy to production

Good luck with the project! 🚀
