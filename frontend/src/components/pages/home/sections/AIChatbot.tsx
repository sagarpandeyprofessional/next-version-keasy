// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

import { FiUser, Send, Sparkles, X } from '../icons';

const companyInfo = `
Introduction:
Hey there! I'm your friendly Keasy chatbot — your digital companion for navigating life in South Korea 🇰🇷. Whether you're an 
international student, expat, or newcomer, I'm here to guide you through your new life, help you find communities, and make your experience smoother, easier, and more connected.

Details:
Keasy is a modern community platform designed to support international people living in South Korea. We bring together everything you need to 
live, connect, and thrive abroad — all in one place. From local guides and events to a marketplace for buying and selling goods, Keasy makes settling in feel like home.

Our platform offers:
- AI-powered assistance for real-time guidance and translation.
- Marketplace to buy and sell new or used items safely.
- Events & Activities listings to help you explore your city.
- Community groups and chats where you can connect with others.
- Blog and resources for legal advice, cultural tips, and local insights.

Keasy's goal is simple: make life easier for foreigners in South Korea through community, technology, and meaningful support.

Based in Daejeon, South Korea, Keasy was founded by a group of international students who experienced the challenges of living abroad firsthand — and decided to build a solution.

Stay connected with us:
- Website: https://www.koreaeasy.org
- Instagram: https://www.instagram.com/keasy_community

For partnerships, inquiries, or feedback, reach out to us at keasy.contact@gmail.com

At Keasy, we believe in more than just technology — we believe in community. Together, we make Korea feel like home 💙
`;

const ChatbotIcon = () => (
  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white ring-1 ring-[color:var(--kai-border)] shadow-[0_6px_16px_rgba(0,0,0,0.08)] flex items-center justify-center">
    <Sparkles className="w-5 h-5 text-[color:var(--kai-accent)]" />
  </div>
);

const ChatMessage = ({ chat }) => {
  const renderFormattedText = (text) => {
    // Split text into lines
    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
      // Skip empty lines but preserve spacing
      if (line.trim() === '') {
        return <br key={lineIndex} />;
      }

      // Handle bullet points (•, -, *, numbered lists)
      const bulletMatch = line.match(/^(\s*)([-•*]|\d+\.)\s+(.+)$/);
      if (bulletMatch) {
        const [, indent, bullet, content] = bulletMatch;
        return (
          <div key={lineIndex} className="flex gap-2 my-1" style={{ marginLeft: `${indent.length * 8}px` }}>
            <span className="flex-shrink-0 font-medium">{bullet}</span>
            <span>{formatInlineText(content)}</span>
          </div>
        );
      }

      // Handle headers (lines that end with :)
      if (line.match(/^[^:]+:$/)) {
        return (
          <div key={lineIndex} className="font-semibold mt-2 mb-1">
            {formatInlineText(line)}
          </div>
        );
      }

      // Regular paragraph
      return (
        <div key={lineIndex} className="my-1">
          {formatInlineText(line)}
        </div>
      );
    });
  };

  // Format inline text (bold, italic, links, inline code only)
  const formatInlineText = (text) => {
    // Split by inline code, bold, italic, and URLs (NO multiline code blocks here)
    const parts = text.split(/(`[^`\n]+`|\*\*\*[^*\n]+\*\*\*|\*\*[^*\n]+\*\*|\*[^*\n]+\*|https?:\/\/[^\s]+)/g);

    return parts.map((part, index) => {
      if (!part) return null;

      // Inline code (`code`) - single line only
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={index} className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Bold + Italic (***text***)
      if (part.startsWith('***') && part.endsWith('***') && part.length > 6) {
        return (
          <strong key={index} className="font-bold italic">
            {part.slice(3, -3)}
          </strong>
        );
      }

      // Bold (**text**)
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={index} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic (*text*)
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={index} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }

      // URLs
      if (part.match(/^https?:\/\/[^\s]+$/)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {part}
          </a>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  if (chat.hideInChat) return null;

  const isUser = chat.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isUser && <ChatbotIcon />}

      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-[color:var(--kai-accent)] text-white rounded-br-sm'
            : 'bg-[color:var(--kai-surface)] text-[color:var(--kai-ink)] rounded-bl-sm border border-[color:var(--kai-border)]'
        }`}
      >
        <div className="text-sm leading-relaxed">{chat.role === 'model' ? renderFormattedText(chat.text) : chat.text}</div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm bg-[color:var(--kai-accent)]">
          <FiUser />
        </div>
      )}
    </motion.div>
  );
};

const ChatForm = ({ onSubmit, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const userMessage = message.trim();
    if (!userMessage || isLoading) return;

    onSubmit(userMessage);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex gap-2 items-center w-full rounded-full bg-[color:var(--kai-surface-strong)] ring-1 ring-[color:var(--kai-border)] shadow-[0_6px_16px_rgba(0,0,0,0.06)] px-2 py-1">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask about life in Korea..."
        className="flex-1 px-3 py-2 bg-transparent border-none rounded-full outline-none text-[color:var(--kai-ink)] placeholder-[color:var(--kai-muted)] text-sm md:text-sm"
        disabled={isLoading}
      />
      <button
        onClick={handleSubmit}
        disabled={!message.trim() || isLoading}
        className="flex-shrink-0 w-10 h-10 rounded-full text-white flex items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-50 bg-[color:var(--kai-accent)] hover:bg-[#0a7df0] shadow-[0_6px_16px_rgba(0,113,227,0.35)]"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};

export const AIChatbot = ({ currentUserId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: 'model',
      text: companyInfo,
    },
  ]);
  const chatBodyRef = useRef();
  const router = useRouter();

  // Generate AI response using DeepSeek API
  const generateBotResponse = async (history) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

      if (!apiKey) {
        throw new Error('DeepSeek API key is missing');
      }

      // Format history for DeepSeek (OpenAI-compatible) Chat API
      const formattedHistory = history.map(({ role, text, hideInChat }) => ({
        role: role === 'user' ? 'user' : hideInChat ? 'system' : 'assistant',
        content: text,
      }));

      const response = await fetch(
        'https://api.deepseek.com/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: formattedHistory,
            temperature: 0.7,
            top_p: 0.95,
            max_tokens: 1024,
            stream: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const botResponse =
        data.choices?.[0]?.message?.content ||
        "I apologize, but I couldn't generate a response. Please try again.";

      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== 'Thinking...'),
        { role: 'model', text: botResponse },
      ]);
    } catch (error) {
      console.error('Error generating bot response:', error);
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== 'Thinking...'),
        {
          role: 'model',
          text: "I apologize, but I'm having trouble responding right now. Please check your internet connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (userMessage) => {
    const newMessage = { role: 'user', text: userMessage };
    setChatHistory((prev) => [...prev, newMessage]);

    setIsLoading(true);
    setTimeout(() => {
      setChatHistory((prev) => [...prev, { role: 'model', text: 'Thinking...' }]);

      generateBotResponse([
        ...chatHistory,
        newMessage,
        { role: 'user', text: `Using the details provided above if needed, please address this query: ${userMessage}` },
      ]);
    }, 600);
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatHistory]);

  const handlePopUp = () => {
    if (currentUserId) {
      if (isOpen == true) {
        setIsOpen(false);
        setChatHistory([]);
      } else setIsOpen(true);
    } else {
      alert('Please sign in to use the AI Chatbot.');
      router.push('/signin');
    }
  };

  return (
    <div className="keasy-ai-theme">
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={handlePopUp}
        className="fixed bottom-20 lg:bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-full bg-white/90 text-[color:var(--kai-ink)] ring-1 ring-[color:var(--kai-border)] shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur-md transition-all duration-300"
        aria-label="Open keasy AI"
      >
        <Sparkles className="w-5 h-5 text-[color:var(--kai-accent)]" />
        <span className="hidden sm:inline font-medium tracking-tight">keasy AI</span>
      </motion.button>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Chat Container */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 0.98,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              transition={{
                type: 'spring',
                damping: 24,
                stiffness: 280,
              }}
              className="fixed z-50 overflow-hidden rounded-[28px] ring-1 ring-[color:var(--kai-border)] shadow-[0_30px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl bg-white/80
                md:bottom-24 md:right-6 md:w-[400px] md:h-[600px]
                inset-4 md:inset-auto"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,245,247,0.96) 100%)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at 20% 0%, rgba(0,113,227,0.12), transparent 45%)',
                }}
              />

              {/* Header */}
              <div className="relative z-10 bg-white/85 backdrop-blur border-b border-[color:var(--kai-border)] p-4 flex items-center justify-between">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-[color:var(--kai-accent)]" />
                <div className="flex items-center gap-3">
                  <ChatbotIcon />
                  <div>
                    <h3 className="kai-title text-lg text-[color:var(--kai-ink)]">keasy AI</h3>
                    <p className="text-xs text-[color:var(--kai-muted)]">Local guidance, real-time help</p>
                  </div>
                </div>
                <button
                  onClick={handlePopUp}
                  className="p-2 rounded-full transition-colors text-[color:var(--kai-ink)] hover:bg-[color:var(--kai-accent-soft)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Body */}
              <div
                ref={chatBodyRef}
                className="relative z-10 flex-1 overflow-y-auto p-4"
                style={{ height: 'calc(100% - 134px)' }}
              >
                {/* Welcome Message */}
                <div className="flex gap-3 mb-4">
                  <ChatbotIcon />
                  <div className="max-w-[82%] bg-[color:var(--kai-surface)] text-[color:var(--kai-ink)] rounded-2xl rounded-bl-sm px-4 py-3 border border-[color:var(--kai-border)] shadow-sm">
                    <p className="text-sm leading-relaxed">
                      Hey there 👋<br />
                      How can I help you today?
                    </p>
                  </div>
                </div>

                {/* Chat History */}
                {chatHistory.map((chat, index) => (
                  <ChatMessage key={index} chat={chat} />
                ))}
              </div>

              {/* Chat Footer */}
              <div className="relative z-10 py-3 pt-1 px-3 bg-white/85 backdrop-blur border-t border-[color:var(--kai-border)]">
                <ChatForm onSubmit={handleSendMessage} isLoading={isLoading} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
