import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Send, Minimize2, Bot, Sparkles, Loader2, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { config } from "@/config/technology-config";
import { toast } from "sonner";

interface Message {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  source?: "faq" | "gemini" | "fallback";
  faqId?: number;
}

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      if (!conversationId) {
        startConversation();
      }
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const quickQuestions = [
    "¿Cómo me inscribo?",
    "¿Precios?",
    "¿Certificación?",
    "¿Modalidad?"
  ];

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.developerWeb.chatbot.conversation.start}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });

      const result = await response.json();
      const conversationData = result.data || result;

      if (result.success && conversationData.conversation_id) {
        setConversationId(conversationData.conversation_id);
        setMessages([{
          id: 1,
          type: "bot",
          content: conversationData.welcome_message || "¡Hola! Soy el asistente virtual de INCADEV. ¿En qué puedo ayudarte?",
          timestamp: new Date()
        }]);
      } else {
        console.error("No conversation_id received:", result);
        toast.error("No se pudo conectar");
        setMessages([{
          id: 1,
          type: "bot",
          content: "No pude conectarme. Cierra y vuelve a abrir el chat.",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Error de conexión");
      setMessages([{
        id: 1,
        type: "bot",
        content: "Error de conexión. Cierra y vuelve a abrir el chat.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId || isTyping) return;

    const userMessage = message.trim();
    const newUserMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.developerWeb.chatbot.conversation.message}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: userMessage
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        const botData = result.data;

        if (botData.response_delay) {
          await new Promise(resolve => setTimeout(resolve, Math.min(botData.response_delay, 1500)));
        }

        const botResponse: Message = {
          id: messages.length + 2,
          type: "bot",
          content: botData.response,
          timestamp: new Date(),
          source: botData.source,
          faqId: botData.faq_id
        };

        setMessages(prev => [...prev, botResponse]);
      } else {
        const fallbackResponse: Message = {
          id: messages.length + 2,
          type: "bot",
          content: result.data?.response || "Lo siento, no pude procesar tu mensaje.",
          timestamp: new Date(),
          source: "fallback"
        };
        setMessages(prev => [...prev, fallbackResponse]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorResponse: Message = {
        id: messages.length + 2,
        type: "bot",
        content: "Error al procesar tu mensaje. Intenta de nuevo.",
        timestamp: new Date(),
        source: "fallback"
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const endConversation = async (sendFeedback: boolean = false) => {
    if (!conversationId) return;

    try {
      const feedbackData = sendFeedback ? {
        rating: rating || undefined,
        comment: feedbackComment || undefined,
        resolved: true
      } : undefined;

      await fetch(`${config.apiUrl}${config.endpoints.developerWeb.chatbot.conversation.end}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          feedback: feedbackData
        })
      });

      if (sendFeedback) {
        toast.success("¡Gracias por tu feedback!");
      }
    } catch (error) {
      console.error("Error ending conversation:", error);
    } finally {
      setConversationId(null);
      setMessages([]);
      setShowFeedback(false);
      setRating(0);
      setFeedbackComment("");
    }
  };

  const handleClose = () => {
    if (messages.length > 1) {
      setShowFeedback(true);
    } else {
      setIsOpen(false);
      endConversation(false);
    }
  };

  const handleCloseWithoutFeedback = () => {
    setIsOpen(false);
    endConversation(false);
  };

  const handleSubmitFeedback = () => {
    setIsOpen(false);
    endConversation(true);
  };

  const handleQuickQuestion = async (question: string) => {
    if (!conversationId || isTyping) return;

    const userMessage = question.trim();
    const newUserMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.developerWeb.chatbot.conversation.message}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: userMessage
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        const botData = result.data;

        if (botData.response_delay) {
          await new Promise(resolve => setTimeout(resolve, Math.min(botData.response_delay, 1500)));
        }

        const botResponse: Message = {
          id: messages.length + 2,
          type: "bot",
          content: botData.response,
          timestamp: new Date(),
          source: botData.source,
          faqId: botData.faq_id
        };

        setMessages(prev => [...prev, botResponse]);
      } else {
        const fallbackResponse: Message = {
          id: messages.length + 2,
          type: "bot",
          content: result.data?.response || "Lo siento, no pude procesar tu mensaje.",
          timestamp: new Date(),
          source: "fallback"
        };
        setMessages(prev => [...prev, fallbackResponse]);
      }
    } catch (error) {
      console.error("Error sending quick question:", error);
      const errorResponse: Message = {
        id: messages.length + 2,
        type: "bot",
        content: "Error al procesar tu mensaje. Intenta de nuevo.",
        timestamp: new Date(),
        source: "fallback"
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-background border rounded-2xl shadow-2xl overflow-hidden flex flex-col
            bottom-20 right-3 left-3
            sm:bottom-24 sm:right-4 sm:left-auto sm:w-80 md:w-96
            h-[60vh] sm:h-[480px] md:h-[520px] max-h-[calc(100vh-7rem)]
            ${isAnimating ? 'animate-in slide-in-from-bottom-5 fade-in duration-300' : ''}`}
        >
          {/* Feedback Overlay */}
          {showFeedback && (
            <div className="absolute inset-0 bg-background/98 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4">
              <div className="text-center space-y-3 w-full max-w-xs">
                <h3 className="text-base font-semibold">¿Cómo fue tu experiencia?</h3>
                <p className="text-xs text-muted-foreground">Tu opinión nos ayuda a mejorar</p>

                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 p-0.5"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/50"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <Textarea
                  placeholder="Comentarios (opcional)"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="min-h-16 text-sm resize-none"
                />

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={handleCloseWithoutFeedback}
                  >
                    Omitir
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleSubmitFeedback}
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Header - Compacto */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">Asistente INCADEV</p>
                <div className="flex items-center gap-1 text-[10px] opacity-80">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                  <span>En línea</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-primary-foreground/20 text-primary-foreground"
                onClick={() => setIsOpen(false)}
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-primary-foreground/20 text-primary-foreground"
                onClick={handleClose}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/20">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.type === "bot" && (
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-1.5 mt-0.5 shrink-0">
                        <Bot className="h-3 w-3 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[85%] ${msg.type === "user" ? "" : "flex flex-col"}`}>
                      <div
                        className={`rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                          msg.type === "user"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-background border rounded-bl-sm shadow-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.type === "bot" && msg.source && msg.source !== "fallback" && (
                        <span className="text-[10px] text-muted-foreground mt-0.5 ml-1">
                          {msg.source === "faq" ? "📚 FAQ" : "✨ IA"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-1.5 shrink-0">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <div className="bg-background border rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Questions - Compacto */}
          {messages.length === 1 && !isTyping && conversationId && (
            <div className="px-3 py-2 border-t bg-background">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-medium text-muted-foreground">Preguntas rápidas</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-[11px] px-2 py-1 rounded-full border bg-muted/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-2 border-t bg-background">
            {!conversationId && !isLoading ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={startConversation}
              >
                <Loader2 className="h-3 w-3 mr-1.5" />
                Reintentar conexión
              </Button>
            ) : (
              <div className="flex gap-1.5 items-center">
                <Input
                  placeholder={isLoading ? "Conectando..." : "Escribe un mensaje..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isTyping) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isTyping || isLoading || !conversationId}
                  className="flex-1 h-9 text-sm border-muted-foreground/20"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={isTyping || isLoading || !message.trim() || !conversationId}
                  className="h-9 w-9 shrink-0"
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Footer minimalista */}
            <p className="text-[9px] text-muted-foreground/60 text-center mt-1.5">
              Powered by Gemini AI
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <Button
        size="icon"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
      </Button>

      {/* Notification dot */}
      {!isOpen && (
        <span className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 pointer-events-none">
          <span className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
        </span>
      )}
    </>
  );
}
