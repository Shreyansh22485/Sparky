import React from 'react';

const MarkdownRenderer = ({ children }) => {
  if (!children || typeof children !== 'string') {
    return <div>{children}</div>;
  }

  const renderMarkdown = (text) => {
    // Split text by lines to handle different formatting
    const lines = text.split('\n');
    const elements = [];
    let currentIndex = 0;

    lines.forEach((line, lineIndex) => {
      if (!line.trim()) {
        elements.push(<br key={`br-${lineIndex}`} />);
        return;
      }

      // Handle headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${lineIndex}`} className="text-xl font-bold text-walmart-blue mb-2 mt-4">
            {line.substring(2)}
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${lineIndex}`} className="text-lg font-bold text-walmart-blue mb-2 mt-3">
            {line.substring(3)}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${lineIndex}`} className="text-base font-bold text-walmart-blue mb-1 mt-2">
            {line.substring(4)}
          </h3>
        );
        return;
      }

      // Handle bold text patterns
      let processedLine = line;
      
      // Process **bold** patterns
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, (match, content) => {
        const id = `bold-${currentIndex++}`;
        return `<strong class="font-bold text-gray-900">${content}</strong>`;
      });

      // Handle bullet points with better emoji support
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        const bulletText = line.replace(/^[•\-]\s*/, '');
        const emojiMatch = bulletText.match(/^([🎯⭐💝🚚💯🎊🛍️📋⚖️🔄]) (.*)/);
        
        if (emojiMatch) {
          elements.push(
            <div key={`bullet-${lineIndex}`} className="bullet-point">
              <div className="emoji">{emojiMatch[1]}</div>
              <div className="text" dangerouslySetInnerHTML={{ __html: emojiMatch[2] }} />
            </div>
          );
        } else {
          elements.push(
            <div key={`bullet-${lineIndex}`} className="bullet-point">
              <div className="emoji">•</div>
              <div className="text" dangerouslySetInnerHTML={{ __html: processedLine.replace(/^[•\-]\s*/, '') }} />
            </div>
          );
        }
        return;
      }

      // Handle requirements (Budget, Age, Occasion) - special styling
      const requirementMatch = line.match(/^\*\*([��])\s*(.*?):\*\*\s*(.*)$/);
      if (requirementMatch) {
        const [, emoji, label, value] = requirementMatch;
        elements.push(
          <div key={`requirement-${lineIndex}`} className="requirement-item">
            <div className="requirement-icon">{emoji}</div>
            <div className="requirement-label">{label}:</div>
            <div className="requirement-value">{value}</div>
          </div>
        );
        return;
      }

      // Handle feature items with emoji and description
      const featureMatch = line.match(/^\*\*([🎯🛒🤖⚡])\s*(.*?)\*\*\s*-\s*(.*)$/);
      if (featureMatch) {
        const [, emoji, title, description] = featureMatch;
        elements.push(
          <div key={`feature-${lineIndex}`} className="feature-item">
            <div className="feature-icon">{emoji}</div>
            <div className="feature-content">
              <div className="feature-title">{title}</div>
              <div className="feature-description">{description}</div>
            </div>
          </div>
        );
        return;
      }

      // Handle emoji headers (🔍 **Text**)
      const emojiHeaderMatch = line.match(/^([🔍🛒💳📋🎯🌟📝✅🛍️⚡🎉💰📦🚚🎊🤔📏🎮🔄⭐💸🎁]+)\s*\*\*(.*?)\*\*/);
      if (emojiHeaderMatch) {
        const [, emoji, content] = emojiHeaderMatch;
        elements.push(
          <div key={`emoji-header-${lineIndex}`} className="flex items-center my-3">
            <span className="text-2xl mr-3">{emoji}</span>
            <h3 className="text-lg font-bold text-walmart-blue">{content}</h3>
          </div>
        );
        return;
      }

      // Regular paragraph with inline formatting
      if (processedLine.includes('<strong')) {
        elements.push(
          <p key={`p-${lineIndex}`} className="my-1 leading-relaxed" 
             dangerouslySetInnerHTML={{ __html: processedLine }} />
        );
      } else {
        elements.push(
          <p key={`p-${lineIndex}`} className="my-1 leading-relaxed">
            {processedLine}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="ai-message-content">
      {renderMarkdown(children)}
    </div>
  );
};

export default MarkdownRenderer;
