import React from 'react';
import { Sparkles, ShoppingBag, MessageSquare, Zap } from 'lucide-react';

const DemoHelper = ({ onQuickStart }) => {
  const quickActions = [
    {
      id: 'birthday',
      title: 'Birthday Gift',
      subtitle: 'Find perfect gift with budget',
      message: "I need a birthday gift for my 8-year-old nephew, budget $50",
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'bbq',
      title: 'BBQ Planning',
      subtitle: 'Complete party planning',
      message: "I want to plan a BBQ for 10 people this weekend",
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-orange-500'
    },
    {
      id: 'help',
      title: 'Get Help',
      subtitle: 'Learn about Sparky',
      message: "What can you help me with?",
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mx-4 mb-4">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-6 h-6 text-walmart-blue" />
        <h3 className="text-lg font-semibold text-gray-800">Try Sparky's New Powers!</h3>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">
        Experience end-to-end shopping with our multi-agent AI system. Try these demo scenarios:
      </p>
      
      <div className="grid gap-3">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onQuickStart(action.message)}
            className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
          >
            <div className={`p-2 rounded-full text-white ${action.color}`}>
              {action.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{action.title}</div>
              <div className="text-sm text-gray-600">{action.subtitle}</div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-xs text-blue-800 font-medium mb-1">💡 Multi-Agent Experience</div>
        <div className="text-xs text-blue-700">
          Watch different AI agents handle discovery, cart management, and payments seamlessly!
        </div>
      </div>
    </div>
  );
};

export default DemoHelper;
