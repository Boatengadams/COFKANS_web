import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Phone, Mail, MapPin, Clock, Sparkles, ShoppingBag, Lightbulb, Info, Eye } from 'lucide-react';
import { useHover } from '../contexts/HoverContext';

export function LiveChatConcierge() {
  const { hoveredProduct, lastViewedProducts } = useHover();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      text: '👋 Welcome to Cofkans Electricals! I\'m Kofi, your intelligent shopping assistant. I\'m here to help you navigate our premium electrical and lighting catalog.\n\nI can assist with:\n✨ Product recommendations based on what you\'re viewing\n🛍️ Smart shopping guidance & order assistance\n💡 Technical specifications & comparisons\n📍 Showroom locations & availability\n💰 Real-time pricing & special offers\n\nI\'m always aware of where you are in our store. How may I assist you today?',
      time: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track current section for context awareness
  useEffect(() => {
    const detectSection = () => {
      const sections = ['collections', 'products', 'smart-living', 'projects'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + element.offsetHeight;

          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setCurrentSection(sectionId);
            return;
          }
        }
      }
      setCurrentSection('home');
    };

    window.addEventListener('scroll', detectSection);
    detectSection(); // Initial check

    return () => window.removeEventListener('scroll', detectSection);
  }, []);

  const quickReplies = hoveredProduct ? [
    { text: 'Tell me about this one', icon: Eye },
    { text: 'Compare with similar products', icon: Sparkles },
    { text: 'Is this good for my use case?', icon: Lightbulb },
    { text: 'What are the specs?', icon: Info },
  ] : [
    { text: 'Show me products in this section', icon: Sparkles },
    { text: 'Get pricing quote', icon: ShoppingBag },
    { text: 'Technical specifications', icon: Lightbulb },
    { text: 'Nearest Cofkans showroom', icon: MapPin },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    // Context-aware prefix based on current section
    const contextPrefix = currentSection === 'products' ? '📦 I see you\'re browsing our product catalog! ' :
                         currentSection === 'smart-living' ? '🏠 You\'re in our Smart Home section! ' :
                         currentSection === 'projects' ? '🎨 Viewing our project gallery! ' :
                         currentSection === 'collections' ? '✨ You\'re exploring our premium collections! ' :
                         '🏪 Welcome to Cofkans! ';

    // Smart product-specific responses when user asks about "this one" or hovering
    if (msg.includes('this one') || msg.includes('this product') || msg.includes('what about this') || msg.includes('tell me about this')) {
      if (hoveredProduct) {
        return `👁️ You're looking at the **${hoveredProduct.name}**!\n\n${hoveredProduct.description || 'Premium quality product from Cofkans Electricals.'}\n\n💰 Price: ${hoveredProduct.price}\n📦 Category: ${hoveredProduct.category.charAt(0).toUpperCase() + hoveredProduct.category.slice(1)}\n\n${hoveredProduct.specs && hoveredProduct.specs.length > 0 ? `✨ Key Features:\n${hoveredProduct.specs.slice(0, 4).map(spec => `• ${spec}`).join('\n')}\n\n` : ''}Perfect for ${hoveredProduct.category === 'luxury' ? 'high-end installations and luxury spaces' : hoveredProduct.category === 'wiring' ? 'professional electrical installations' : hoveredProduct.category === 'solar' ? 'sustainable energy solutions' : hoveredProduct.category === 'industrial' ? 'commercial and industrial projects' : 'your electrical needs'}!\n\nWould you like to know more, or shall I help you compare it with similar products?`;
      } else if (lastViewedProducts.length > 0) {
        const lastProduct = lastViewedProducts[0];
        return `I see you just looked at the **${lastProduct.name}**!\n\n${lastProduct.description || 'Great choice from our catalog.'}\n\n💰 ${lastProduct.price}\n\nWould you like detailed specs, or shall I suggest similar products?`;
      } else {
        return `${contextPrefix}I'd love to help! Just hover your mouse over any product you're interested in, and I'll instantly tell you all about it! 👁️\n\nI can see exactly what you're pointing at and provide instant details, comparisons, and recommendations.`;
      }
    }

    // Comparison questions
    if ((msg.includes('compare') || msg.includes('which') || msg.includes('better') || msg.includes('difference')) &&
        (msg.includes('this') || msg.includes('these') || msg.includes('one'))) {
      if (lastViewedProducts.length >= 2) {
        const prod1 = lastViewedProducts[0];
        const prod2 = lastViewedProducts[1];
        return `🔍 **Comparing your last two viewed products:**\n\n**${prod1.name}**\n💰 ${prod1.price}\n📦 ${prod1.category}\n\nvs\n\n**${prod2.name}**\n💰 ${prod2.price}\n📦 ${prod2.category}\n\n**My Recommendation:**\n${prod1.category === prod2.category ? `Both are excellent ${prod1.category} products. The ${prod1.name} offers ${prod1.description?.substring(0, 50) || 'premium features'}, while the ${prod2.name} provides ${prod2.description?.substring(0, 50) || 'great value'}.` : `These are different categories - ${prod1.name} is for ${prod1.category} while ${prod2.name} is for ${prod2.category}.`}\n\nWhat's your specific use case? That'll help me recommend the perfect fit!`;
      } else if (hoveredProduct) {
        return `${contextPrefix}You're looking at the **${hoveredProduct.name}**. To compare products, hover over multiple items and I'll track them for you!\n\nI'll remember the last 5 products you've viewed and can compare them instantly. Try looking at a few more products!`;
      } else {
        return `${contextPrefix}I can compare products for you! Just browse through our catalog and hover over the products you're interested in. I'll remember them and provide instant comparisons when you ask! 👁️📊`;
      }
    }

    // Use case / "I'm using it for" questions
    if (msg.includes('using') || msg.includes('use') || msg.includes('need') || msg.includes('looking for')) {
      const useCase = msg.includes('home') || msg.includes('house') || msg.includes('residential') ? 'residential' :
                      msg.includes('office') || msg.includes('commercial') || msg.includes('business') ? 'commercial' :
                      msg.includes('hotel') || msg.includes('restaurant') ? 'hospitality' :
                      msg.includes('outdoor') || msg.includes('garden') ? 'outdoor' :
                      msg.includes('bedroom') || msg.includes('kitchen') || msg.includes('bathroom') ? 'specific room' : 'general';

      if (hoveredProduct) {
        if (useCase === 'residential') {
          return `Perfect timing! The **${hoveredProduct.name}** is ${hoveredProduct.category === 'luxury' || hoveredProduct.category === 'wiring' ? 'ideal for residential installations' : hoveredProduct.category === 'solar' ? 'great for home energy efficiency' : 'suitable for home use'}!\n\n${hoveredProduct.description}\n\n💰 ${hoveredProduct.price}\n\n✨ For your home, this product offers excellent quality and reliability. ${hoveredProduct.category === 'luxury' ? 'It will add elegance to your space!' : 'It meets all safety standards!'}\n\nShall I suggest complementary products for your project?`;
        } else if (useCase === 'commercial') {
          return `Excellent choice! The **${hoveredProduct.name}** is ${hoveredProduct.category === 'industrial' || hoveredProduct.category === 'solar' ? 'designed specifically for commercial applications' : 'also perfect for commercial spaces'}!\n\n${hoveredProduct.description}\n\n💰 ${hoveredProduct.price}\n${hoveredProduct.category === 'industrial' ? '🏢 Industrial-grade quality\n' : ''}${hoveredProduct.category === 'wiring' ? '⚡ Professional installation ready\n' : ''}\n\n💼 We offer bulk pricing for commercial projects! Would you like a quote?`;
        }
      }

      return `${contextPrefix}I can help you find the perfect product for your ${useCase} needs!\n\nCould you tell me more about:\n• Where will it be installed?\n• Any specific features you need?\n• Your budget range?\n\nOr hover over products you like, and I'll tell you if they're perfect for your use case!`;
    }

    // Product recommendations (context-aware)
    if (msg.includes('recommend') || msg.includes('suggestion') || msg.includes('best') || msg.includes('show')) {
      if (currentSection === 'smart-living') {
        return `${contextPrefix}Perfect timing! Here are our best Smart Home products:\n\n⚡ Smart Lighting Control Systems - Voice & app-enabled\n🏠 Automated Home Integration Kits - Complete packages\n💡 Smart LED Bulbs & Strips - Color-changing, dimmable\n📱 WiFi-Enabled Switches - Control from anywhere\n🔌 Smart Power Outlets - Monitor energy usage\n\nInterested in a complete smart home setup or individual components?`;
      } else if (currentSection === 'collections') {
        return `${contextPrefix}Excellent! You're viewing our curated collections. Top picks:\n\n💎 Luxury Lighting Collection - Crystal chandeliers & designer fixtures\n☀️ Solar & Infrastructure - Sustainable energy solutions  \n🏗️ Industrial Control Systems - Professional-grade components\n✨ Premium Electrical Fittings - Gold-plated switches & sockets\n\nWhich collection catches your eye?`;
      } else if (currentSection === 'products') {
        return `${contextPrefix}Great! Here's what's popular in our catalog right now:\n\n🌟 Elite Elegance Series - Flagship switches with gold finishes\n💎 VIP Gold Collection - Premium chandeliers  \n⚡ Smart Automation - Voice-controlled lighting\n🏢 Commercial Solutions - Bulk electrical supplies\n🔧 Installation Accessories - Professional tools & components\n\nLooking for residential or commercial products?`;
      }
      return `${contextPrefix}✨ Top Cofkans recommendations:\n\n🌟 Elite Elegance Series - Premium switches & sockets\n💎 Luxury Lighting - Designer chandeliers & fixtures\n⚡ Smart Home Systems - Automation & control\n🏗️ Industrial Solutions - Professional components\n\nWhat type of space are you working on?`;
    }

    // Pricing/Quote
    if (msg.includes('price') || msg.includes('cost') || msg.includes('quote') || msg.includes('much')) {
      if (hoveredProduct) {
        return `💰 **Pricing for ${hoveredProduct.name}:**\n\n${hoveredProduct.price}\n\n${hoveredProduct.category === 'wiring' || hoveredProduct.category === 'industrial' ? '💼 **Trade Price Available!** Sign in for wholesale pricing.\n' : ''}${hoveredProduct.category === 'luxury' ? '✨ Premium quality with competitive pricing.\n' : ''}${hoveredProduct.category === 'solar' ? '☀️ Long-term savings on energy costs!\n' : ''}\n📦 **Stock:** Available at Cofkans showrooms\n🚚 **Delivery:** Fast nationwide shipping\n💳 **Payment:** Multiple options including installments\n\n💼 Need bulk pricing or a project quote? I can connect you with our sales team!\n\nWant to add this to your cart?`;
      }
      return `${contextPrefix}💰 I can help you with Cofkans pricing!\n\nOur Cofkans Electricals products range:\n• Standard switches & sockets: GH₵ 10-50\n• Premium electrical fittings: GH₵ 40-150\n• Designer chandeliers & fixtures: GH₵ 500-5000+\n• Smart automation systems: Custom quotes\n• Solar & infrastructure: Custom enterprise pricing\n\n💼 Bulk/wholesale orders get exclusive trade discounts!\n\n👁️ **Tip:** Hover over any product to see its exact price and specs instantly!\n\nWould you like a personalized quote for your project?`;
    }

    // Technical help
    if (msg.includes('technical') || msg.includes('spec') || msg.includes('install') || msg.includes('how') || msg.includes('feature')) {
      if (hoveredProduct) {
        return `🔧 **Technical Specs for ${hoveredProduct.name}:**\n\n${hoveredProduct.description || 'Premium quality product from Cofkans.'}\n\n💰 Price: ${hoveredProduct.price}\n\n${hoveredProduct.specs && hoveredProduct.specs.length > 0 ? `📋 **Specifications:**\n${hoveredProduct.specs.map(spec => `✓ ${spec}`).join('\n')}\n\n` : ''}${hoveredProduct.category === 'wiring' ? '🔌 **Installation:** Professional installation recommended. Compatible with standard UK electrical systems.\n' : ''}${hoveredProduct.category === 'solar' ? '☀️ **Energy:** Solar-powered with high-efficiency panels. Eco-friendly solution.\n' : ''}${hoveredProduct.category === 'luxury' ? '✨ **Quality:** Premium build with luxury finishes. Designer-grade materials.\n' : ''}\n📞 Need detailed installation guide? Our engineers can help!\n\nAny other questions about this product?`;
      }
      return `${contextPrefix}🔧 Kofi here with technical support for Cofkans products!\n\nI can provide:\n• Detailed product specifications & datasheets\n• Installation guidelines & wiring diagrams\n• Compatibility checks for your existing setup\n• Safety certifications (ISO, GSA approved)\n• Smart home integration guides\n• Energy efficiency ratings\n\n👁️ **Pro tip:** Hover over any product and ask me about its specs - I'll give you instant detailed information!\n\nWhat technical details do you need?`;
    }

    // Location
    if (msg.includes('location') || msg.includes('showroom') || msg.includes('visit') || msg.includes('where')) {
      return `${contextPrefix}📍 Visit our Cofkans Electricals luxury showrooms:\n\n🏢 Cofkans Main Showroom - Accra\nRing Road Central, Accra\nMon-Sat: 8:00 AM - 6:00 PM\nSun: 10:00 AM - 4:00 PM\n\n🏢 Cofkans Branch - Kumasi\nAsafo Market Area\nMon-Sat: 8:00 AM - 5:00 PM\n\n🏢 Cofkans Takoradi\nTakoradi Market Circle\nMon-Sat: 8:00 AM - 5:30 PM\n\n📞 Book a private consultation: +233 30 277 5555`;
    }

    // Contact/Book consultation
    if (msg.includes('book') || msg.includes('appointment') || msg.includes('consult') || msg.includes('call')) {
      return '📅 Book a Luxury Consultation!\n\n🌟 We offer:\n• Free design consultations\n• On-site assessments\n• Custom lighting plans\n• Installation quotes\n\n📞 Call: +233 30 277 5555\n📧 Email: info@cofkans.com\n\nOr share your contact details and our team will reach out within 2 hours!';
    }

    // Catalog/Products
    if (msg.includes('catalog') || msg.includes('product') || msg.includes('browse')) {
      return `${contextPrefix}📚 Explore the Cofkans Electricals premium catalog!\n\nOur extensive range includes:\n🔌 1000+ electrical products & accessories\n💡 Designer chandeliers & luxury lighting fixtures\n⚡ Smart home automation systems\n🏗️ Industrial & commercial solutions\n☀️ Solar panels & renewable energy products\n🏠 Residential electrical fittings\n\nYou can browse our complete catalog here on this website or visit any Cofkans showroom for hands-on experience. What category interests you?`;
    }

    // Delivery/Shipping
    if (msg.includes('deliver') || msg.includes('ship') || msg.includes('receive')) {
      return '🚚 Fast & Reliable Delivery!\n\n📦 Delivery Options:\n• Accra: 1-2 business days\n• Nationwide: 2-5 business days\n• Express delivery available\n• Free delivery on orders over GH₵ 500\n\n📍 International shipping available for bulk orders. Need delivery urgently?';
    }

    // Payment
    if (msg.includes('payment') || msg.includes('pay') || msg.includes('method')) {
      return '💳 Flexible Payment Options:\n\n✅ Mobile Money (MTN, Vodafone, AirtelTigo)\n✅ Bank Transfer\n✅ Credit/Debit Cards\n✅ Cash on Delivery\n💼 Corporate invoicing available\n\nWe also offer installment plans for large orders!';
    }

    // Warranty/Return
    if (msg.includes('warranty') || msg.includes('return') || msg.includes('guarantee')) {
      return '🛡️ Quality Guaranteed!\n\n✅ 2-year warranty on all products\n✅ 30-day return policy\n✅ Free replacements for defects\n✅ Certified by Ghana Standards Authority\n\nYour satisfaction is our priority. Any issues? We\'ve got you covered!';
    }

    // Default response
    return `${contextPrefix}Thank you for reaching out! 😊\n\nI\'m Kofi, your intelligent Cofkans assistant. I\'m context-aware and know exactly where you are in our store!\n\nI can help you with:\n• Product recommendations based on what you\'re viewing\n• Detailed pricing & instant quotes\n• Technical specifications & installation guides\n• Cofkans showroom locations & hours\n• Order status & delivery tracking\n• Smart comparisons between products\n\nWhat would you like to know about Cofkans Electricals? Feel free to ask anything!`;
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: userMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // AI-powered response with realistic typing delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'agent',
          text: getAIResponse(userMessage),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200 + Math.random() * 800); // Random delay between 1.2-2 seconds for realism
  };

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full shadow-2xl flex items-center justify-center group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-7 h-7 text-white" strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse Effect */}
        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-28 right-8 z-50 w-[400px] h-[600px] bg-card rounded-3xl shadow-2xl border-2 border-border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold">K</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Kofi - Smart Assistant</h3>
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <div className={`w-2 h-2 rounded-full ${hoveredProduct ? 'bg-blue-400' : 'bg-green-400'} animate-pulse`} />
                    <span>{hoveredProduct ? `Viewing: ${hoveredProduct.name.substring(0, 25)}...` : `Browsing: ${currentSection === 'home' ? 'Home' : currentSection.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Hover Indicator */}
            {hoveredProduct && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-blue-50 dark:bg-blue-900/30 border-b-2 border-blue-200 dark:border-blue-700 p-4"
              >
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                      You're looking at:
                    </p>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100 truncate">
                      {hoveredProduct.name}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {hoveredProduct.price} • {hoveredProduct.category}
                    </p>
                  </div>
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-br-none shadow-lg'
                        : 'bg-card border-2 border-border rounded-bl-none shadow-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-card border-2 border-border rounded-bl-none shadow-md">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-2 h-2 bg-primary rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-primary rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-primary rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-6 py-3 border-t border-border bg-background">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply) => (
                    <motion.button
                      key={reply.text}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickReply(reply.text)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-primary/20 rounded-xl text-xs font-medium transition-all shadow-sm cursor-pointer"
                    >
                      <reply.icon className="w-3 h-3" strokeWidth={2.5} />
                      {reply.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-muted rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg"
                >
                  <Send className="w-5 h-5 text-white" strokeWidth={2} />
                </motion.button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="px-6 py-4 bg-muted/30 border-t border-border">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <a href="tel:+233302775555" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="w-3 h-3" strokeWidth={2} />
                  <span>Call Us</span>
                </a>
                <a href="mailto:info@cofkans.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-3 h-3" strokeWidth={2} />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
