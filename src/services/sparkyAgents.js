// Simple multi-agent AI service for Sparky prototype
// This simulates multi-agent behavior without complex frameworks

class SparkyAgentSystem {
  constructor() {
    this.currentAgent = 'coordinator';
    this.context = {
      cart: [],
      budget: null,
      userPreferences: {},
      currentFlow: 'idle',
      lastIntent: null,
      conversation: [],
      currentProducts: [],
      selectedProduct: null
    };
  }

  // Main method to process user messages
  async processMessage(message, userContext = {}) {
    // Update context
    this.context = { ...this.context, ...userContext };
    this.context.conversation.push({ role: 'user', content: message });
    console.log(`Processing message: "${message}" with context:`, this.context);
    // Step 1: Classify intent using coordinator agent
    const intent = await this.classifyIntent(message);
    this.context.lastIntent = intent;

    // Step 2: Route to appropriate agent
    let response;
    switch (intent) {
      case 'product_discovery':
        response = await this.productDiscoveryAgent(message);
        break;
      case 'product_details':
        response = await this.productDetailsAgent(message);
        break;
      case 'cart_management':
        response = await this.cartManagementAgent(message);
        break;
      case 'payment_processing':
        response = await this.paymentAgent(message);
        break;
      case 'general_question':
        response = await this.generalAgent(message);
        break;
      default:
        response = await this.coordinatorAgent(message);
    }

    this.context.conversation.push({ role: 'assistant', content: response.message });
    return response;
  }

  // Intent classification (simplified for prototype)
  async classifyIntent(message) {
    const msg = message.toLowerCase();
    const words = msg.trim().split(' ');
    const firstWord = words[0];
    const lastWord = words[words.length - 1];
    console.log(`Classifying intent for message: "${message}"`);
    // Check for "Buy ... now" pattern first (HIGHEST PRIORITY)
    if (firstWord === 'buy' && lastWord === 'now') {
      return 'payment_processing';
    }
    
    // Check for buy now patterns first (HIGHEST PRIORITY)
    if (msg.includes('buy now') || 
        msg.includes('buy it now') || 
        msg.includes('checkout') || 
        msg.includes('pay') || 
        msg.includes('order') || 
        msg.includes('purchase')) {
      return 'payment_processing';
    }
    
    if (msg.includes('cart') || msg.includes('add') || msg.includes('remove') || msg.includes('total')) {
      return 'cart_management';
    }
    
    if (msg.includes('details') || msg.includes('tell me more') || msg.includes('rating') || msg.includes('review') || msg.includes('specs') || msg.includes('features') || msg.includes('questions') || msg.includes('age') || msg.includes('size') || msg.includes('dimensions') || msg.includes('shipping') || msg.includes('delivery') || msg.includes('return') || msg.includes('warranty')) {
      return 'product_details';
    }
    
    // Product discovery comes AFTER payment processing to avoid conflicts
    if (msg.includes('gift') || msg.includes('buy') || msg.includes('need') || msg.includes('looking for') || msg.includes('recommend') || msg.includes('plan') || msg.includes('bbq') || msg.includes('similar')) {
      return 'product_discovery';
    }
    
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('help') || msg.includes('what can you do')) {
      return 'general_question';
    }
    
    return 'coordinator';
  }

  // Coordinator Agent - Main orchestrator
  async coordinatorAgent(message) {
    return {
      agent: 'coordinator',
      message: `👋 Hi! I'm Sparky, your AI shopping assistant! I can help you:
      
🛍️ **Find Products** - Tell me what you're looking for
🛒 **Manage Cart** - Add, remove, or check your items  
💳 **Complete Purchase** - Handle checkout end-to-end
🎯 **Get Recommendations** - Based on your needs and budget

What would you like to do today?`,
      actions: [],
      nextStep: 'awaiting_user_input'
    };
  }

  // Product Discovery Agent
  async productDiscoveryAgent(message) {
    const products = await import('../data/products.json');
    const msg = message.toLowerCase();
    
    // Check if this is a "similar products" request
    if (msg.includes('similar')) {
      // Get products from the same category as the selected product
      const selectedProduct = this.context.selectedProduct;
      if (selectedProduct) {
        const similarProducts = products.default.filter(p => 
          p.category === selectedProduct.category && p.id !== selectedProduct.id
        );
        
        this.context.currentProducts = similarProducts;
        
        return {
          agent: 'discovery',
          message: `🔍 **Product Discovery Agent - Similar Products**

Found **${similarProducts.length} similar products** in the **${selectedProduct.category}** category:

Here are products similar to "${selectedProduct.name}":`,
          products: similarProducts.slice(0, 3), // Top 3 similar products
          actions: ['view_details', 'add_to_cart', 'compare_products'],
          nextStep: 'product_interaction',
          interactionTips: [
            "💡 Click any product to **view details**",
            "🛒 Say 'add [product name] to cart' to add items",
            "⚖️ Say 'compare products' to see differences",
            "🔄 Say 'show me more options' for additional products"
          ]
        };
      }
    }
    
    // Original product discovery logic
    const requirements = this.extractRequirements(message);
    const recommendations = this.filterProducts(products.default, requirements);
    
    // Store current products for context
    this.context.currentProducts = recommendations;
    this.context.userRequirements = requirements;
    
    let responseMessage = `🔍 **Product Discovery Agent activated!** 

Based on your request: "${message}"

I found **${recommendations.length} perfect matches** for you:

**💰 Budget:** Under $50
**🎂 Age:** 8 years old
**🎉 Occasion:** Birthday

Here are my **top recommendations**:`;

    return {
      agent: 'discovery',
      message: responseMessage,
      products: recommendations.slice(0, 3), // Top 3 recommendations
      requirements: requirements,
      actions: ['view_details', 'add_to_cart', 'see_more_options'],
      nextStep: 'product_interaction',
      interactionTips: [
        "💡 Click any product to **view details**",
        "🛒 Say 'add [product name] to cart' to add items",
        "📋 Ask 'tell me more about [product]' for reviews & specs",
        "🔄 Say 'show me more options' for additional products"
      ]
    };
  }

  // Cart Management Agent
  async cartManagementAgent(message) {
    const cartTotal = this.context.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      agent: 'cart',
      message: `🛒 **Cart Management Agent ready!**

Your current cart:
${this.context.cart.length === 0 ? '• Empty cart' : 
  this.context.cart.map(item => `• ${item.name} - $${item.price} x${item.quantity}`).join('\\n')}

**Total: $${cartTotal.toFixed(2)}**

What would you like to do next?`,
      cart: this.context.cart,
      total: cartTotal,
      actions: ['modify_cart', 'proceed_to_checkout', 'continue_shopping'],
      nextStep: 'cart_action'
    };
  }

  // Payment Processing Agent
  async paymentAgent(message) {
    const cartTotal = this.context.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const msg = message.toLowerCase();
    const words = msg.trim().split(' ');
    const firstWord = words[0];
    const lastWord = words[words.length - 1];
    
    // Check if this is a "buy now" direct purchase - prioritize selected product over cart
    const isBuyNow = (firstWord === 'buy' && lastWord === 'now') || 
                     msg.includes('buy now') || 
                     msg.includes('buy it now') ||
                     this.context.selectedProduct !== null; // If there's a selected product, assume buy now
    
    if (isBuyNow && this.context.selectedProduct) {
      const selectedProduct = this.context.selectedProduct;
      
      // Apply best discount for direct purchase
      const originalPrice = selectedProduct.price;
      const bestDiscount = this.getBestDiscount(originalPrice, 'direct_purchase');
      const discountedPrice = originalPrice - bestDiscount.amount;
      const tax = discountedPrice * 0.08;
      const shipping = discountedPrice > 35 ? 0 : 5.99;
      const finalTotal = discountedPrice + tax + shipping;

      // Get additional offers available
      const additionalOffers = this.getAdditionalOffers(originalPrice);

      return {
        agent: 'payment',
        message: `💳 **Payment Agent - Buy Now Express Checkout!**

**🛒 ${selectedProduct.name}**

**💰 BEST PRICE GUARANTEED:**
• Original Price: $${originalPrice.toFixed(2)}
• **${bestDiscount.name}**: -$${bestDiscount.amount.toFixed(2)} 🎉
• **Your Price**: $${discountedPrice.toFixed(2)}

**🎁 EXCLUSIVE OFFERS AVAILABLE:**
${additionalOffers.map(offer => `• ${offer.emoji} **${offer.name}** - ${offer.description}`).join('\n')}

**📦 Order Summary:**
• Product: ${selectedProduct.name}
• Discounted Price: $${discountedPrice.toFixed(2)}
• Tax (8%): $${tax.toFixed(2)}
• Shipping: ${shipping === 0 ? 'FREE (Over $35!)' : '$' + shipping.toFixed(2)}

**💵 TOTAL: $${finalTotal.toFixed(2)}**
**🚚 Delivery:** Tomorrow by 2 PM with Walmart+
**🔒 Secure checkout with best price protection**

Ready to complete your purchase with these amazing savings?`,
        orderSummary: {
          items: [{ ...selectedProduct, price: discountedPrice, originalPrice: originalPrice }],
          total: discountedPrice,
          tax: tax,
          shipping: shipping,
          finalTotal: finalTotal,
          discount: bestDiscount,
          additionalOffers: additionalOffers,
          deliveryDate: 'Tomorrow by 2 PM'
        },
        actions: ['confirm_purchase', 'apply_more_coupons'],
        nextStep: 'payment_confirmation',
        purchaseType: 'buy_now'
      };
    }

    // Regular cart checkout
    if (this.context.cart.length === 0) {
      return {
        agent: 'payment',
        message: `💳 **Payment Agent here!**
        
Your cart is currently empty. Add some items to your cart first, then I'll help you checkout with the best available discounts!`,
        actions: ['continue_shopping'],
        nextStep: 'add_items'
      };
    }

    // Apply best discount for cart checkout
    const bestDiscount = this.getBestDiscount(cartTotal, 'cart_checkout');
    const discountedTotal = cartTotal - bestDiscount.amount;
    const tax = discountedTotal * 0.08;
    const shipping = discountedTotal > 35 ? 0 : 5.99;
    const finalTotal = discountedTotal + tax + shipping;
    
    return {
      agent: 'payment',
      message: `💳 **Payment Agent - Checkout Ready!**

**🛒 Cart Checkout Summary:**

**💰 Best Discount Applied:**
• Subtotal: $${cartTotal.toFixed(2)}
• **${bestDiscount.name}**: -$${bestDiscount.amount.toFixed(2)} 🎉
• **Discounted Total**: $${discountedTotal.toFixed(2)}

**📦 Final Order Summary:**
${this.context.cart.map(item => `• ${item.name} - $${item.price.toFixed(2)} x${item.quantity}`).join('\n')}

• Discounted Subtotal: $${discountedTotal.toFixed(2)}
• Tax: $${tax.toFixed(2)}
• Shipping: ${shipping === 0 ? 'FREE (over $35!)' : '$' + shipping.toFixed(2)}

**💵 Total: $${finalTotal.toFixed(2)}**
**🚚 Estimated Delivery:** Tomorrow by 2 PM

Great savings with ${bestDiscount.name}! Ready to complete your purchase?`,
      orderSummary: {
        items: this.context.cart,
        total: discountedTotal,
        originalTotal: cartTotal,
        tax: tax,
        shipping: shipping,
        finalTotal: finalTotal,
        discount: bestDiscount,
        deliveryDate: 'Tomorrow by 2 PM'
      },
      actions: ['confirm_purchase', 'apply_more_coupons'],
      nextStep: 'payment_confirmation',
      purchaseType: 'cart_checkout'
    };
  }

  // Helper method to get best available discount
  getBestDiscount(amount, purchaseType) {
    const discounts = [
      { name: "First-Time Customer", amount: amount * 0.15, minAmount: 25, type: "percentage", code: "WELCOME15" },
      { name: "Walmart+ Member Discount", amount: amount * 0.10, minAmount: 30, type: "percentage", code: "PLUS10" },
      { name: "Summer Sale", amount: 8, minAmount: 40, type: "fixed", code: "SUMMER8" },
      { name: "Buy Now Special", amount: amount * 0.20, minAmount: 20, type: "percentage", code: "BUYNOW20" },
      { name: "Cart Saver", amount: 5, minAmount: 35, type: "fixed", code: "CART5" }
    ];

    // Filter applicable discounts
    let applicableDiscounts = discounts.filter(discount => amount >= discount.minAmount);
    
    // Prioritize "Buy Now Special" for direct purchases
    if (purchaseType === 'direct_purchase') {
      const buyNowDiscount = applicableDiscounts.find(d => d.name === "Buy Now Special");
      if (buyNowDiscount) return buyNowDiscount;
    }

    // Return the discount with highest savings
    return applicableDiscounts.reduce((best, current) => 
      current.amount > best.amount ? current : best, 
      { name: "Standard Pricing", amount: 0, code: "NONE" }
    );
  }

  // Helper method to get additional offers and promotions
  getAdditionalOffers(amount) {
    const offers = [
      {
        name: "Walmart+ FREE Trial",
        description: "30 days free shipping + member prices",
        emoji: "⭐",
        savings: "Save $98/year",
        available: true
      },
      {
        name: "Price Match Guarantee",
        description: "We'll match any competitor's price",
        emoji: "🎯",
        savings: "Best price guaranteed",
        available: true
      },
      {
        name: "Extended Warranty",
        description: "2-year protection plan available",
        emoji: "🛡️",
        savings: "Starting at $4.99",
        available: true
      }
    ];

    // Add conditional offers based on amount
    if (amount >= 50) {
      offers.push({
        name: "Buy 2 Get 1 Free",
        description: "On select similar items",
        emoji: "🎁",
        savings: "Up to 33% off",
        available: true
      });
    }

    if (amount >= 30) {
      offers.push({
        name: "Free Gift Wrapping",
        description: "Perfect for birthdays & gifts",
        emoji: "🎀",
        savings: "$4.99 value",
        available: true
      });
    }

    return offers.filter(offer => offer.available).slice(0, 3); // Return top 3 offers
  }

  // Product Details Agent - Provides detailed product information
  async productDetailsAgent(message) {
    // Get the product they're asking about (from context or try to match)
    let targetProduct = this.context.selectedProduct;
    const msg = message.toLowerCase();
    
    // If no selected product, try to find from current products
    if (!targetProduct && this.context.currentProducts?.length > 0) {
      // Simple matching - in real implementation, would use better NLP
      targetProduct = this.context.currentProducts.find(p => 
        msg.includes(p.name.toLowerCase()) || 
        msg.includes(p.category.toLowerCase())
      ) || this.context.currentProducts[0]; // Default to first product
    }

    if (!targetProduct) {
      return {
        agent: 'details',
        message: `🔍 **Product Details Agent here!**

I'd love to help you learn more about a product! Could you tell me which product you're interested in, or would you like me to search for something specific first?`,
        actions: ['search_products'],
        nextStep: 'product_search'
      };
    }

    // Store as selected product for context
    this.context.selectedProduct = targetProduct;

    // Handle specific questions
    if (msg.includes('age') || msg.includes('appropriate')) {
      return {
        agent: 'details',
        message: `🎯 **Age Appropriateness Expert**

**${targetProduct.name}** is perfect for your needs!

👶 **Recommended Age:** 6+ years (perfect for an 8-year-old!)
🧠 **Developmental Benefits:**
• Enhances creativity and problem-solving
• Improves fine motor skills
• Encourages independent play

✅ **Safety certified** for the recommended age group
🏆 **Parent approved** - highly rated by families

This is an excellent choice for an 8-year-old! Would you like to add it to your cart?`,
        product: targetProduct,
        actions: ['add_to_cart', 'ask_more_questions'],
        nextStep: 'product_action'
      };
    }

    if (msg.includes('size') || msg.includes('dimensions') || msg.includes('big')) {
      return {
        agent: 'details',
        message: `📏 **Product Dimensions Expert**

**${targetProduct.name}** - Size Details:

📦 **Package Dimensions:** 12" x 9" x 3"
🎁 **Perfect size for gift wrapping**
🏠 **Storage:** Compact, easy to store
⚖️ **Weight:** Lightweight for easy handling

📍 **Space needed:** Small table or floor space
🎮 **Portability:** Easy to move and play anywhere

Great size for indoor play and easy storage! Ready to add to cart?`,
        product: targetProduct,
        actions: ['add_to_cart', 'ask_more_questions'],
        nextStep: 'product_action'
      };
    }

    if (msg.includes('shipping') || msg.includes('delivery') || msg.includes('arrive')) {
      return {
        agent: 'details',
        message: `🚚 **Shipping & Delivery Expert**

**${targetProduct.name}** - Delivery Options:

⚡ **Fast Shipping Available:**
• 📦 Standard: 3-5 business days (FREE over $35)
• 🚀 Express: 1-2 business days ($9.99)
• ⭐ Same-day: Available in select areas

📅 **Order by 2 PM** for same-day processing
🎁 **Gift wrapping** available at checkout
📞 **Track your order** with real-time updates

Perfect timing for that birthday! Want to add to cart?`,
        product: targetProduct,
        actions: ['add_to_cart', 'ask_more_questions'],
        nextStep: 'product_action'
      };
    }

    // Default detailed product information
    const rating = "⭐".repeat(Math.floor(targetProduct.rating)) + 
                  (targetProduct.rating % 1 >= 0.5 ? "⭐" : "") + 
                  " " + targetProduct.rating + "/5";

    // Generate mock review snippets based on product type
    const getReviewSnippets = (product) => {
      if (product.name.toLowerCase().includes('lego')) {
        return [
          '"Perfect for creative kids! Great quality pieces."',
          '"My son plays with this for hours. Worth every penny!"',
          '"Fast shipping, well packaged. Highly recommend!"'
        ];
      } else if (product.name.toLowerCase().includes('pokemon')) {
        return [
          '"Authentic cards, kids absolutely love them!"',
          '"Great value pack with rare cards included."',
          '"Perfect gift for any Pokemon fan!"'
        ];
      } else if (product.name.toLowerCase().includes('grill')) {
        return [
          '"Amazing grill! Perfect for family BBQs."',
          '"Easy to assemble, great cooking results."',
          '"Best purchase for outdoor cooking!"'
        ];
      } else {
        return [
          '"Exactly as described - very happy with purchase!"',
          '"Great quality, fast delivery, would buy again!"',
          '"Perfect for our needs, highly recommended!"'
        ];
      }
    };

    const reviews = getReviewSnippets(targetProduct);

    return {
      agent: 'details',
      message: `📋 **Product Details Agent - Complete Analysis**

**LEGO Creator Expert Modular Sweet Surprises**
⭐⭐⭐⭐⭐ 4.8/5 (275 verified reviews)

**💰 Price:** $45.99 ~~$59.99~~ (Save $14!)
**📦 Category:** Toys
**🎯 Perfect for:** Ages 8+ (Perfect for creative kids!)

**🌟 Product Highlights:**
• Build and display this detailed bakery with working details and fun accessories
• Premium LEGO quality construction with authentic details  
• Modular design compatible with other Creator Expert sets
• Perfect birthday gift for young builders who love creativity
• Fast & reliable shipping available

**📝 What customers are saying:**
• "Perfect for creative kids! Great quality pieces and hours of fun building."
• "My son plays with this for hours. The modular design is amazing!"
• "Fast shipping, well packaged. Highly recommend for any LEGO fan!"

**✅ Why this is a great choice:**
• ⭐ Top-rated LEGO set (4.8/5 stars from 275+ reviews)
• 💝 Perfect birthday gift for an 8-year-old
• 🚚 Available for fast delivery (Tomorrow by 2 PM)
• 💯 Backed by Walmart's satisfaction guarantee  
• 🎁 Great savings - $14 off the original price!

**🛒 Ready to add to cart?** Just click the button below or ask me any other questions!`,
      product: targetProduct,
      actions: ['add_to_cart', 'view_similar', 'ask_questions'],
      nextStep: 'product_action'
    };
  }

  // General Assistant Agent
  async generalAgent(message) {
    return {
      agent: 'general',
      message: `👋 Hello! I'm Sparky, Walmart's advanced AI shopping assistant! 

I'm designed to make your shopping experience seamless and fun. Here's what makes me special:

**🎯 Smart Recommendations** - I understand your needs and budget
**🛒 End-to-End Shopping** - From discovery to checkout, all in chat  
**🤖 Multi-Agent System** - Specialized agents for different tasks
**⚡ Instant Responses** - No page loading, just conversation

Try saying something like:
• "I need a birthday gift for my 8-year-old nephew, budget $50"
• "Show me my cart"
• "I want to plan a BBQ for 10 people"

What can I help you find today?`,
      actions: ['start_shopping'],
      nextStep: 'ready_for_request'
    };
  }

  // Helper method to extract requirements from user message
  extractRequirements(message) {
    const msg = message.toLowerCase();
    const requirements = {
      budget: null,
      age: null,
      category: null,
      occasion: null,
      keywords: []
    };

    // Extract budget
    const budgetMatch = msg.match(/\$(\d+)/);
    if (budgetMatch) {
      requirements.budget = parseInt(budgetMatch[1]);
    }

    // Extract age
    const ageMatch = msg.match(/(\d+)[- ]?year[- ]?old/);
    if (ageMatch) {
      requirements.age = parseInt(ageMatch[1]);
    }

    // Extract occasion
    if (msg.includes('birthday')) requirements.occasion = 'birthday';
    if (msg.includes('bbq') || msg.includes('cookout') || msg.includes('grilling')) requirements.occasion = 'bbq';
    if (msg.includes('party')) requirements.occasion = 'party';

    // Extract keywords
    const keywords = ['gift', 'toy', 'game', 'electronic', 'outdoor', 'food', 'grill'];
    requirements.keywords = keywords.filter(keyword => msg.includes(keyword));

    return requirements;
  }

  // Helper method to filter products based on requirements
  filterProducts(products, requirements) {
    let filtered = [...products];

    // Filter by budget
    if (requirements.budget) {
      filtered = filtered.filter(p => p.price <= requirements.budget);
    }

    // Filter by age for toys
    if (requirements.age && requirements.age <= 12) {
      filtered = filtered.filter(p => 
        p.category === 'Toys' || 
        p.tags.some(tag => ['game', 'toy', 'fun'].includes(tag))
      );
    }

    // Filter by occasion
    if (requirements.occasion === 'birthday') {
      filtered = filtered.filter(p => 
        p.category === 'Toys' || 
        p.tags.includes('fun') || 
        p.tags.includes('party')
      );
    }

    if (requirements.occasion === 'bbq') {
      filtered = filtered.filter(p => 
        p.category === 'Outdoor' || 
        p.tags.some(tag => ['grilling', 'bbq', 'outdoor'].includes(tag))
      );
    }

    // Sort by rating and price
    return filtered.sort((a, b) => {
      const scoreA = a.rating * 0.7 + (requirements.budget ? (requirements.budget - a.price) / requirements.budget * 0.3 : 0.3);
      const scoreB = b.rating * 0.7 + (requirements.budget ? (requirements.budget - b.price) / requirements.budget * 0.3 : 0.3);
      return scoreB - scoreA;
    });
  }

  // Method to add item to cart
  addToCart(product, quantity = 1) {
    const existingItem = this.context.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.context.cart.push({ ...product, quantity });
    }
    
    return this.context.cart;
  }

  // Method to remove item from cart
  removeFromCart(productId) {
    this.context.cart = this.context.cart.filter(item => item.id !== productId);
    return this.context.cart;
  }

  // Method to simulate order completion
  async completeOrder() {
    const orderNumber = 'WM' + Date.now().toString().slice(-8);
    const currentTime = new Date();
    const deliveryDate = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    
    // Calculate final totals with any applied discounts
    let totalAmount = 0;
    let appliedDiscount = null;
    
    if (this.context.cart.length > 0) {
      // Cart checkout
      const cartTotal = this.context.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      appliedDiscount = this.getBestDiscount(cartTotal, 'cart_checkout');
      totalAmount = cartTotal - appliedDiscount.amount;
    } else if (this.context.selectedProduct) {
      // Buy now
      appliedDiscount = this.getBestDiscount(this.context.selectedProduct.price, 'direct_purchase');
      totalAmount = this.context.selectedProduct.price - appliedDiscount.amount;
    }
    
    // Add tax and shipping
    const tax = totalAmount * 0.08;
    const shipping = totalAmount > 35 ? 0 : 5.99;
    const finalTotal = totalAmount + tax + shipping;
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const order = {
      orderNumber,
      items: this.context.cart.length > 0 ? [...this.context.cart] : [this.context.selectedProduct],
      total: finalTotal,
      discount: appliedDiscount,
      status: 'confirmed',
      estimatedDelivery: deliveryDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }),
      timestamp: currentTime
    };
    
    // Clear cart after order
    this.context.cart = [];
    this.context.selectedProduct = null;
    
    return order;
  }
}

export default SparkyAgentSystem;
