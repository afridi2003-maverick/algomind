import random
import uuid
from typing import Dict, Any, List, Optional

class QuizService:
    """Dynamically generates quizzes for algorithm comprehension assessment."""
    
    QUESTION_BANK = {
        "BFS": [
            {
                "type": "multiple_choice",
                "question": "What data structure does BFS primarily use?",
                "options": ["Stack", "Queue", "Priority Queue", "Linked List"],
                "correct": 1,
                "explanation": "BFS uses a Queue (FIFO) to explore nodes level-by-level."
            },
            {
                "type": "multiple_choice",
                "question": "What is the time complexity of BFS?",
                "options": ["O(V)", "O(E)", "O(V + E)", "O(V × E)"],
                "correct": 2,
                "explanation": "BFS visits every vertex and edge once, giving O(V + E)."
            },
            {
                "type": "true_false",
                "question": "BFS guarantees the shortest path in a weighted graph.",
                "correct": False,
                "explanation": "BFS guarantees shortest path only in unweighted graphs. For weighted graphs, use Dijkstra or Bellman-Ford."
            },
            {
                "type": "multiple_choice",
                "question": "In BFS, which node is explored first?",
                "options": ["The deepest node", "The node added first to the queue", "The node with lowest weight", "A random node"],
                "correct": 1,
                "explanation": "BFS is FIFO – the first node enqueued is the first dequeued."
            },
            {
                "type": "code_trace",
                "question": "If BFS starts at node A in graph A→B, A→C, B→D, C→D, what is the visit order?",
                "options": ["A, B, C, D", "A, C, B, D", "A, B, D, C", "A, D, B, C"],
                "correct": 0,
                "explanation": "BFS explores level by level: A first, then B and C (A's neighbors), then D."
            }
        ],
        "DFS": [
            {
                "type": "multiple_choice",
                "question": "What data structure does DFS primarily use?",
                "options": ["Queue", "Stack", "Heap", "Hash Table"],
                "correct": 1,
                "explanation": "DFS uses a Stack (LIFO) or recursion to explore deeply before backtracking."
            },
            {
                "type": "true_false",
                "question": "DFS always finds the shortest path between two nodes.",
                "correct": False,
                "explanation": "DFS finds A path, but not necessarily the shortest. It explores depth-first, not breadth-first."
            },
            {
                "type": "multiple_choice",
                "question": "DFS is commonly used for which of the following?",
                "options": ["Shortest path in weighted graphs", "Topological sorting", "Minimum spanning tree", "Network flow"],
                "correct": 1,
                "explanation": "DFS is used for topological sorting, cycle detection, and connected components."
            },
            {
                "type": "multiple_choice",
                "question": "What is the space complexity of DFS?",
                "options": ["O(1)", "O(V)", "O(E)", "O(V + E)"],
                "correct": 1,
                "explanation": "DFS stack can hold at most V nodes in the worst case."
            },
            {
                "type": "code_trace",
                "question": "In DFS starting at A with graph A→B, A→C, B→D: after visiting A and pushing B,C, which is visited next?",
                "options": ["B (if pushed first)", "C (top of stack)", "D", "Random"],
                "correct": 1,
                "explanation": "The last pushed node is popped first (LIFO). If C was pushed after B, C is visited next."
            }
        ],
        "Dijkstra": [
            {
                "type": "multiple_choice",
                "question": "What data structure does Dijkstra's algorithm use?",
                "options": ["Stack", "Queue", "Priority Queue (Min-Heap)", "Deque"],
                "correct": 2,
                "explanation": "Dijkstra uses a min-heap priority queue to always process the closest unvisited node."
            },
            {
                "type": "true_false",
                "question": "Dijkstra's algorithm can handle negative edge weights.",
                "correct": False,
                "explanation": "Dijkstra assumes non-negative weights. For negative weights, use Bellman-Ford."
            },
            {
                "type": "multiple_choice",
                "question": "What is the time complexity of Dijkstra with a binary heap?",
                "options": ["O(V²)", "O(V + E)", "O((V + E) log V)", "O(V × E)"],
                "correct": 2,
                "explanation": "With a binary heap, each vertex extraction is O(log V) and each edge relaxation is O(log V)."
            },
            {
                "type": "multiple_choice",
                "question": "What does 'edge relaxation' mean in Dijkstra's algorithm?",
                "options": ["Removing an edge", "Checking if a shorter path exists via this edge", "Adding a new edge", "Reversing edge direction"],
                "correct": 1,
                "explanation": "Relaxation checks if going through the current node gives a shorter path to a neighbor."
            },
            {
                "type": "true_false",
                "question": "Dijkstra's algorithm is a greedy algorithm.",
                "correct": True,
                "explanation": "Dijkstra greedily selects the unvisited node with the smallest tentative distance."
            }
        ],
        "AStar": [
            {
                "type": "multiple_choice",
                "question": "A* evaluates nodes based on which function?",
                "options": ["f(n) = g(n)", "f(n) = h(n)", "f(n) = g(n) + h(n)", "f(n) = g(n) × h(n)"],
                "correct": 2,
                "explanation": "A* uses f(n) = g(n) + h(n), combining actual cost g and heuristic estimate h."
            },
            {
                "type": "true_false",
                "question": "A* is guaranteed optimal if the heuristic is admissible.",
                "correct": True,
                "explanation": "An admissible heuristic never overestimates the true cost, ensuring A* finds the optimal path."
            },
            {
                "type": "multiple_choice",
                "question": "What happens when h(n) = 0 for all nodes in A*?",
                "options": ["A* becomes BFS", "A* becomes DFS", "A* becomes Dijkstra", "A* fails"],
                "correct": 2,
                "explanation": "With h(n)=0, f(n)=g(n), which is exactly Dijkstra's algorithm."
            },
            {
                "type": "multiple_choice",
                "question": "Which heuristic is commonly used for grid-based pathfinding?",
                "options": ["Hamming distance", "Manhattan distance", "Cosine similarity", "Jaccard index"],
                "correct": 1,
                "explanation": "Manhattan distance (|x1-x2| + |y1-y2|) is standard for 4-directional grid movement."
            },
            {
                "type": "true_false",
                "question": "A* always explores fewer nodes than Dijkstra.",
                "correct": False,
                "explanation": "A* typically explores fewer nodes WITH a good heuristic, but a bad heuristic can make it worse."
            }
        ],
        "Kruskal": [
            {
                "type": "multiple_choice",
                "question": "What does Kruskal's algorithm find?",
                "options": ["Shortest path", "Minimum Spanning Tree", "Maximum flow", "Topological order"],
                "correct": 1,
                "explanation": "Kruskal's finds the Minimum Spanning Tree — a subset of edges connecting all vertices with minimum total weight."
            },
            {
                "type": "multiple_choice",
                "question": "What data structure is critical for Kruskal's algorithm?",
                "options": ["Priority Queue", "Stack", "Union-Find (Disjoint Set)", "Hash Map"],
                "correct": 2,
                "explanation": "Union-Find efficiently detects cycles by tracking connected components."
            },
            {
                "type": "true_false",
                "question": "Kruskal's algorithm processes edges in descending order of weight.",
                "correct": False,
                "explanation": "Kruskal sorts edges in ASCENDING order and greedily picks the lightest edge that doesn't create a cycle."
            },
            {
                "type": "multiple_choice",
                "question": "An MST of a graph with V vertices has how many edges?",
                "options": ["V", "V - 1", "V + 1", "E"],
                "correct": 1,
                "explanation": "A spanning tree of V vertices always has exactly V-1 edges."
            },
            {
                "type": "multiple_choice",
                "question": "What is the time complexity of Kruskal's algorithm?",
                "options": ["O(V + E)", "O(V²)", "O(E log E)", "O(V × E)"],
                "correct": 2,
                "explanation": "Dominated by sorting E edges. Union-Find operations are nearly O(1) amortized."
            }
        ],
        "BellmanFord": [
            {
                "type": "multiple_choice",
                "question": "How many iterations does Bellman-Ford perform in the worst case?",
                "options": ["E - 1", "V - 1", "V", "E"],
                "correct": 1,
                "explanation": "Bellman-Ford relaxes all edges V-1 times. The Vth iteration checks for negative cycles."
            },
            {
                "type": "true_false",
                "question": "Bellman-Ford can handle negative edge weights.",
                "correct": True,
                "explanation": "Unlike Dijkstra, Bellman-Ford correctly handles negative weights and detects negative cycles."
            },
            {
                "type": "multiple_choice",
                "question": "What does it mean if distances can still improve after V-1 iterations?",
                "options": ["Algorithm is incomplete", "A negative cycle exists", "Graph is disconnected", "Heuristic is inadmissible"],
                "correct": 1,
                "explanation": "If relaxation still improves distances after V-1 rounds, a negative weight cycle exists."
            },
            {
                "type": "multiple_choice",
                "question": "What is the time complexity of Bellman-Ford?",
                "options": ["O(V + E)", "O(E log V)", "O(V × E)", "O(V²)"],
                "correct": 2,
                "explanation": "Bellman-Ford iterates V-1 times, each time relaxing all E edges: O(V × E)."
            },
            {
                "type": "true_false",
                "question": "Bellman-Ford is faster than Dijkstra for graphs without negative weights.",
                "correct": False,
                "explanation": "Dijkstra with a binary heap is O((V+E) log V), which is faster than Bellman-Ford's O(V×E)."
            }
        ]
    }
    
    @staticmethod
    def generate_quiz(algorithm: str, num_questions: int = 5) -> Dict[str, Any]:
        """
        Generate a quiz for a specific algorithm.
        
        Args:
            algorithm: Algorithm name (BFS, DFS, Dijkstra, AStar, Kruskal, BellmanFord)
            num_questions: Number of questions to include
            
        Returns:
            Quiz object with questions and metadata
        """
        if algorithm not in QuizService.QUESTION_BANK:
            raise ValueError(f"No quiz bank for algorithm: {algorithm}")
            
        all_questions = QuizService.QUESTION_BANK[algorithm]
        selected = random.sample(all_questions, min(num_questions, len(all_questions)))
        
        quiz_id = str(uuid.uuid4())
        
        questions = []
        for i, q in enumerate(selected):
            question_data = {
                "id": f"{quiz_id}_q{i}",
                "type": q["type"],
                "question": q["question"],
                "explanation": q["explanation"]
            }
            
            if q["type"] == "multiple_choice" or q["type"] == "code_trace":
                question_data["options"] = q["options"]
                question_data["correct_index"] = q["correct"]
            elif q["type"] == "true_false":
                question_data["options"] = ["True", "False"]
                question_data["correct_index"] = 0 if q["correct"] else 1
                
            questions.append(question_data)
            
        return {
            "quiz_id": quiz_id,
            "algorithm": algorithm,
            "total_questions": len(questions),
            "questions": questions
        }
    
    @staticmethod
    def grade_quiz(quiz_data: Dict[str, Any], answers: List[int]) -> Dict[str, Any]:
        """
        Grade a submitted quiz.
        
        Args:
            quiz_data: The original quiz object
            answers: List of selected answer indices
            
        Returns:
            Grading result with score, correct count, and per-question feedback
        """
        questions = quiz_data["questions"]
        correct_count = 0
        feedback = []
        
        for i, (q, answer) in enumerate(zip(questions, answers)):
            is_correct = answer == q["correct_index"]
            if is_correct:
                correct_count += 1
                
            feedback.append({
                "question_id": q["id"],
                "selected": answer,
                "correct": q["correct_index"],
                "is_correct": is_correct,
                "explanation": q["explanation"]
            })
            
        total = len(questions)
        score = round((correct_count / total) * 100, 1) if total > 0 else 0
        
        return {
            "quiz_id": quiz_data["quiz_id"],
            "algorithm": quiz_data["algorithm"],
            "score": score,
            "correct_answers": correct_count,
            "total_questions": total,
            "feedback": feedback,
            "passed": score >= 80
        }
