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
            ) as stream_resp:
                for text in stream_resp.text_stream:
                    yield text
        else:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                system=system_prompt,
                messages=messages
            )
            return response.content[0].text
