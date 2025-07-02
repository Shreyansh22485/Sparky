import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ShoppingCart, 
  Sparkles, 
  User, 
  Bot,
  Package,
  CreditCard,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import SparkyAgentSystem from '../services/sparkyAgents';
import DemoHelper from './DemoHelper';
import MarkdownRenderer from './MarkdownRenderer';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sparkySystem] = useState(new SparkyAgentSystem());
  const [currentProducts, setCurrentProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showDemoHelper, setShowDemoHelper] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Initial greeting
    handleInitialGreeting();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInitialGreeting = async () => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await sparkySystem.generalAgent('hello');
    setMessages([{
      id: Date.now(),
      type: 'ai',
      content: response.message,
      agent: response.agent,
      timestamp: new Date()
    }]);
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Hide demo helper after first message
    setShowDemoHelper(false);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Simulate thinking time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await sparkySystem.processMessage(inputMessage);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.message,
        agent: response.agent,
        products: response.products || [],
        actions: response.actions || [],
        orderSummary: response.orderSummary,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (response.products) {
        setCurrentProducts(response.products);
      }
      
      // Update cart if changed
      setCart(sparkySystem.context.cart);
      
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm having trouble processing your request. Please try again!",
        agent: 'error',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsTyping(false);
  };

  const handleAddToCart = (product) => {
    sparkySystem.addToCart(product);
    setCart([...sparkySystem.context.cart]);
    
    // Add confirmation message
    const confirmMessage = {
      id: Date.now(),
      type: 'ai',
      content: `✅ Added "${product.name}" to your cart! Total items: ${sparkySystem.context.cart.length}`,
      agent: 'cart',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, confirmMessage]);
  };

  const handleProductDetails = async (product) => {
    // Set the selected product in context
    sparkySystem.context.selectedProduct = product;
    
    // Create a user message first
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: `Tell me more about ${product.name}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Process the message
    setIsTyping(true);
    try {
      const response = await sparkySystem.processMessage(`Tell me more about ${product.name}`);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.message,
        agent: response.agent,
        products: response.products || [],
        actions: response.actions || [],
        orderSummary: response.orderSummary,
        product: response.product, // Pass the product for the detail card
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (response.products) {
        setCurrentProducts(response.products);
      }
      
      setCart(sparkySystem.context.cart);
      
    } catch (error) {
      console.error('Error getting product details:', error);
    }
    setIsTyping(false);
  };

  const handleSeeMore = async (currentProduct) => {
    // Create a user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: `Show me similar products to ${currentProduct.name}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Process the message to get similar products
    setIsTyping(true);
    try {
      const response = await sparkySystem.processMessage(`Show me similar products in ${currentProduct.category} category`);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.message,
        agent: response.agent,
        products: response.products || [],
        actions: response.actions || [],
        interactionTips: response.interactionTips,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (response.products) {
        setCurrentProducts(response.products);
      }
      
    } catch (error) {
      console.error('Error getting similar products:', error);
    }
    setIsTyping(false);
  };

  const handleAskAboutProduct = async (product) => {
    // Set context and create a user message that prompts for questions
    sparkySystem.context.selectedProduct = product;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: `I have questions about ${product.name}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Create an AI response that offers to answer questions
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: `🤔 **Product Q&A Agent ready!**

I'm here to answer any questions about **${product.name}**!

You can ask me about:
• 🎯 **Age appropriateness** - "Is this good for an 8-year-old?"
• 📏 **Size & dimensions** - "How big is this product?"
• 🎮 **How to use** - "How does this work?"
• 🚚 **Shipping & delivery** - "When will this arrive?"
• 💰 **Price matching** - "Can you match a lower price?"
• 🔄 **Returns & warranty** - "What's your return policy?"
• ⭐ **Customer reviews** - "What do other customers say?"

What would you like to know about this product?`,
      agent: 'details',
      product: product,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleBuyNow = async (product) => {
    // Set the selected product for buy now
    sparkySystem.context.selectedProduct = product;
    
    // Process buy now directly through payment agent (no chat message)
    setIsTyping(true);
    try {
      const response = await sparkySystem.paymentAgent(`Buy ${product.name} now`);
      
      const aiMessage = {
        id: Date.now(),
        type: 'ai',
        content: response.message,
        agent: response.agent,
        orderSummary: response.orderSummary,
        purchaseType: response.purchaseType,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error processing buy now:', error);
    }
    setIsTyping(false);
  };

  const handleCartCheckout = async () => {
    // Create a user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: 'Checkout my cart',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Process cart checkout through payment agent
    setIsTyping(true);
    try {
      const response = await sparkySystem.processMessage('Checkout');
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.message,
        agent: response.agent,
        orderSummary: response.orderSummary,
        purchaseType: response.purchaseType,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error processing checkout:', error);
    }
    setIsTyping(false);
  };

  const handleQuickStart = (message) => {
    setInputMessage(message);
    setShowDemoHelper(false);
    // Auto-send the message after a short delay
    setTimeout(() => {
      const inputElement = document.querySelector('input[type="text"]');
      if (inputElement) {
        inputElement.value = message;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => {
          handleSendMessage();
        }, 100);
      }
    }, 100);
  };

  const handleQuickAction = async (action, data) => {
    setIsTyping(true);
    
    let response;
    switch (action) {
      case 'show_cart':
        response = await sparkySystem.cartManagementAgent('show my cart');
        break;
      case 'checkout':
        response = await sparkySystem.paymentAgent('proceed to checkout');
        break;
      case 'complete_order':
        const order = await sparkySystem.completeOrder();
        response = {
          agent: 'payment',
          message: `🎉 **Order Confirmed Successfully!**
          
**Order #${order.orderNumber}**
💰 **Total Paid:** $${order.total.toFixed(2)}
🚚 **Delivery:** ${order.estimatedDelivery}
📧 **Confirmation sent to your email**

${order.discount && order.discount.amount > 0 ? 
  `💸 **You saved $${order.discount.amount.toFixed(2)} with ${order.discount.name}!**` : ''}

🎊 **Thank you for shopping with Walmart!** 
Your order is being processed and will be shipped soon.

Need anything else? I'm here to help!`
        };
        // Clear cart after successful order
        setCart([]);
        sparkySystem.context.cart = [];
        break;
      default:
        response = { message: 'Action not recognized', agent: 'error' };
    }
    
    const aiMessage = {
      id: Date.now(),
      type: 'ai',
      content: response.message,
      agent: response.agent,
      orderSummary: response.orderSummary,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const getAgentIcon = (agent) => {
    switch (agent) {
      case 'discovery': return <Package className="w-4 h-4" />;
      case 'details': return <Check className="w-4 h-4" />;
      case 'cart': return <ShoppingCart className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getAgentColor = (agent) => {
    switch (agent) {
      case 'discovery': return 'bg-green-500';
      case 'details': return 'bg-orange-500';
      case 'cart': return 'bg-blue-500';
      case 'payment': return 'bg-purple-500';
      default: return 'bg-walmart-blue';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="walmart-gradient text-white p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="sparky-pulse bg-white/20 p-2 rounded-full">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Sparky AI Assistant</h1>
              <p className="text-sm opacity-90">Your intelligent shopping companion</p>
            </div>
          </div>
          
          {cart.length > 0 && (
            <div className="flex items-center space-x-2">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-full cursor-pointer hover:bg-white/30 transition-colors"
                onClick={() => handleQuickAction('show_cart')}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-semibold">{cart.length}</span>
              </motion.div>
              <button
                onClick={() => handleCartCheckout()}
                className="bg-yellow-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-yellow-600 transition-colors flex items-center space-x-1"
              >
                <CreditCard className="w-4 h-4" />
                <span>Checkout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-4 max-w-4xl mx-auto w-full">
        {/* Demo Helper - Show only when no messages */}
        {showDemoHelper && messages.length === 0 && (
          <DemoHelper onQuickStart={handleQuickStart} />
        )}
        
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {message.type === 'ai' && (
                  <div className={`agent-badge ${message.agent}`}>
                    <div className={`p-1 rounded-full ${getAgentColor(message.agent)} text-white mr-2`}>
                      {getAgentIcon(message.agent)}
                    </div>
                    <span className="capitalize">
                      {message.agent} Agent
                    </span>
                  </div>
                )}
                
                <div className={`p-3 rounded-lg shadow-sm ${
                  message.type === 'user' 
                    ? 'chat-bubble-user ml-auto' 
                    : 'chat-bubble-ai'
                }`}>
                  {message.type === 'user' ? (
                    <div className="text-sm">{message.content}</div>
                  ) : (
                    <MarkdownRenderer>{message.content}</MarkdownRenderer>
                  )}
                  
                  {/* Quick Action Buttons for Product Details */}
                  {message.agent === 'details' && message.product && (
                    <div className="product-detail-buttons">
                      <button
                        onClick={() => handleAddToCart(message.product)}
                        className="action-button-primary"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </button>
                      <button
                        onClick={() => handleBuyNow(message.product)}
                        className="buy-now-button"
                      >
                        <CreditCard className="w-5 h-5" />
                        <span>Buy Now</span>
                      </button>
                      <button
                        onClick={() => handleSeeMore(message.product)}
                        className="action-button-secondary"
                      >
                        See Similar Products
                      </button>
                      <button
                        onClick={() => handleAskAboutProduct(message.product)}
                        className="action-button-tertiary"
                      >
                        Ask Questions
                      </button>
                    </div>
                  )}

                  {/* Cart Items Display */}
                  {message.agent === 'cart' && message.cart && message.cart.length > 0 && (
                    <div className="cart-total">
                      <h4 className="font-semibold text-blue-800 mb-3">🛒 Your Cart Items:</h4>
                      <div className="space-y-2">
                        {message.cart.map((item, index) => (
                          <div key={index} className="cart-item flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="product-image w-12 h-12 object-cover"
                              />
                              <div>
                                <h5 className="product-title">{item.name}</h5>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="product-price">${(item.price * item.quantity).toFixed(2)}</div>
                              <div className="text-xs text-gray-500">${item.price} each</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">Total: ${message.total?.toFixed(2)}</span>
                          <button
                            onClick={() => handleCartCheckout()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Checkout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Recommendations */}
                  {message.products && message.products.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.products.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="product-card"
                        >
                          <div className="flex space-x-3">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="product-image w-16 h-16 object-cover rounded cursor-pointer"
                              onClick={() => handleProductDetails(product)}
                            />
                            <div className="flex-1">
                              <h4 
                                className="product-title text-sm cursor-pointer"
                                onClick={() => handleProductDetails(product)}
                              >
                                {product.name}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1">{product.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2">
                                  <span className="product-price">${product.price}</span>
                                  {product.originalPrice > product.price && (
                                    <span className="text-xs text-gray-500 line-through">
                                      ${product.originalPrice}
                                    </span>
                                  )}
                                  <div className="product-rating">
                                    <span className="star text-xs">★</span>
                                    <span className="rating-text">{product.rating}</span>
                                  </div>
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleProductDetails(product)}
                                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors"
                                  >
                                    Details
                                  </button>
                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    className="action-button-primary px-3 py-1 rounded text-xs transition-all duration-200 flex items-center space-x-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Interaction Tips */}
                      {message.interactionTips && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                          <h5 className="text-sm font-semibold text-blue-800 mb-2">💡 Quick Actions:</h5>
                          <div className="text-xs text-blue-700 space-y-1">
                            {message.interactionTips.map((tip, index) => (
                              <div key={index}>{tip}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Order Summary */}
                  {message.orderSummary && (
                    <div className="order-summary-card">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        {message.purchaseType === 'buy_now' ? 'Buy Now - Order Summary' : 'Cart Checkout Summary'}
                      </h4>
                      
                      {/* Show discount if available */}
                      {message.orderSummary.discount && message.orderSummary.discount.amount > 0 && (
                        <div className="discount-highlight">
                          <div className="flex items-center discount-text">
                            <Sparkles className="discount-icon w-4 h-4 mr-2" />
                            <span className="font-semibold">🎉 Best Discount Applied!</span>
                          </div>
                          <div className="text-sm mt-1">
                            <strong>{message.orderSummary.discount.name}</strong> - Save ${message.orderSummary.discount.amount.toFixed(2)}
                            {message.orderSummary.discount.code !== 'NONE' && (
                              <span className="ml-2 bg-yellow-200 px-2 py-1 rounded text-xs">
                                Code: {message.orderSummary.discount.code}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2 text-sm">
                        {/* Show original total if discount applied */}
                        {message.orderSummary.originalTotal && (
                          <div className="flex justify-between text-gray-600">
                            <span>Original Subtotal:</span>
                            <span className="line-through">${message.orderSummary.originalTotal.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${message.orderSummary.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>${message.orderSummary.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>{message.orderSummary.shipping === 0 ? 'FREE' : '$' + message.orderSummary.shipping.toFixed(2)}</span>
                        </div>
                        {message.orderSummary.deliveryDate && (
                          <div className="flex justify-between text-blue-600 font-medium">
                            <span>Delivery:</span>
                            <span>{message.orderSummary.deliveryDate}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold border-t pt-2 text-lg">
                          <span>Total:</span>
                          <span className="text-green-600">${message.orderSummary.finalTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => handleQuickAction('complete_order')}
                          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Check className="w-5 h-5" />
                          <span>Complete Purchase</span>
                        </button>
                        <button
                          onClick={() => setInputMessage("Apply more coupons")}
                          className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          More Coupons
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              
              <div className={`flex-shrink-0 ${message.type === 'user' ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-gray-300' : 'walmart-gradient'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 walmart-gradient rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="chat-bubble-ai">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Sparky anything... 'I need a birthday gift for my nephew, budget $50'"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-walmart-blue focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={isTyping || !inputMessage.trim()}
              className="walmart-gradient text-white p-2 rounded-full hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex space-x-2 mt-3 flex-wrap">
            <button
              onClick={() => setInputMessage("I need a birthday gift for my 8-year-old nephew, budget $50")}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
            >
              🎁 Birthday Gift Help
            </button>
            <button
              onClick={() => setInputMessage("Tell me more about the LEGO set")}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
            >
              📋 Product Details
            </button>
            <button
              onClick={() => setInputMessage("Plan a BBQ for 10 people")}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
            >
              🍖 BBQ Planning
            </button>
            <button
              onClick={() => handleQuickAction('show_cart')}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
            >
              🛒 Check Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
