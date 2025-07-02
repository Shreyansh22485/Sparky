// Enhanced demo scenarios for Sparky AI Assistant
export const demoScenarios = [
  {
    id: 'birthday-gift',
    title: 'Birthday Gift Shopping',
    description: 'Find the perfect gift for a child with budget constraints',
    userMessage: "I need a birthday gift for my 8-year-old nephew, budget $50",
    expectedFlow: [
      'Product Discovery Agent activates',
      'Analyzes age (8 years) and budget ($50)',
      'Filters toys suitable for 8-year-olds under $50',
      'Presents top 3 recommendations with images',
      'User selects item → Cart Agent takes over',
      'Payment Agent handles checkout'
    ]
  },
  {
    id: 'bbq-planning',
    title: 'BBQ Party Planning',
    description: 'Complete party planning with multiple product categories',
    userMessage: "I want to plan a BBQ for 10 people this weekend",
    expectedFlow: [
      'Product Discovery Agent analyzes requirements',
      'Identifies outdoor/grilling products needed',
      'Suggests grill, charcoal, utensils, etc.',
      'Bundles related items for convenience',
      'Calculates total for 10 people',
      'End-to-end purchase completion'
    ]
  },
  {
    id: 'smart-reorder',
    title: 'Smart Reordering',
    description: 'AI remembers preferences and suggests reorders',
    userMessage: "Reorder my usual household essentials",
    expectedFlow: [
      'Cart Agent accesses purchase history',
      'Suggests frequently bought items',
      'One-click reorder functionality',
      'Automatic subscription options',
      'Quick checkout process'
    ]
  }
];

export const featureHighlights = [
  {
    title: 'Multi-Agent Architecture',
    description: 'Specialized agents for discovery, cart management, and payments',
    icon: '🤖'
  },
  {
    title: 'Conversational Commerce',
    description: 'Complete shopping experience through natural language',
    icon: '💬'
  },
  {
    title: 'Context-Aware Recommendations',
    description: 'Understands budget, age, occasion, and preferences',
    icon: '🎯'
  },
  {
    title: 'Seamless Checkout',
    description: 'End-to-end purchase without leaving the chat interface',
    icon: '💳'
  },
  {
    title: 'Real-time Interaction',
    description: 'Instant responses with visual product displays',
    icon: '⚡'
  },
  {
    title: 'Smart Cart Management',
    description: 'Intelligent cart updates and total calculations',
    icon: '🛒'
  }
];
