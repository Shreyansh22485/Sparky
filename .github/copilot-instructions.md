<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Sparky AI Assistant - Multi-Agent Shopping System

## Project Context
This is a Walmart Sparkathon 2025 prototype demonstrating an enhanced version of Sparky AI assistant with multi-agent capabilities for end-to-end shopping experiences.

## Code Style Guidelines
- Use modern React with hooks and functional components
- Implement Tailwind CSS for styling with Walmart brand colors (#004c91, #ffc220)
- Follow the multi-agent architecture pattern established in `sparkyAgents.js`
- Maintain conversation context across agent interactions
- Use Framer Motion for smooth animations and transitions

## Architecture Principles
- **Multi-Agent System**: Different agents for discovery, cart management, and payments
- **Context Preservation**: Maintain user context across agent handoffs
- **Conversational UI**: All interactions happen within the chat interface
- **Mobile-First**: Responsive design for all devices
- **Visual Feedback**: Clear indicators for active agents and loading states

## Component Patterns
- Chat interface with message bubbles and agent indicators
- Product cards with images, pricing, and add-to-cart buttons
- Order summaries with itemized breakdowns
- Animated typing indicators and state transitions

## Data Flow
- User input → Intent classification → Agent routing → Response generation
- Cart state management through SparkyAgentSystem context
- Product filtering based on extracted requirements (age, budget, occasion)

## Key Features to Maintain
- Real-time agent switching with visual indicators
- Product recommendations with actual images
- Cart management with running totals
- End-to-end purchase flow simulation
- Responsive and accessible design
