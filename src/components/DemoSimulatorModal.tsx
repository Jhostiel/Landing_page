import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, User, Sparkles, Calendar, CheckCircle2, RotateCcw } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface DemoSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

export const DemoSimulatorModal: React.FC<DemoSimulatorModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: '👋 ¡Hola! Bienvenido a Infinity Impact Agency. Soy el Agente de IA para WhatsApp. ¿En qué podemos impulsar tu negocio hoy?',
      time: '12:00'
    },
    {
      id: 'bot-options',
      sender: 'bot',
      text: 'Selecciona una opción o escríbeme directamente:\n1️⃣ Agendar una llamada estratégica\n2️⃣ Conocer precios y paquetes\n3️⃣ Ver casos de éxito de mi sector',
      time: '12:00'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = '';
      const lower = text.toLowerCase();

      if (lower.includes('agenda') || lower.includes('1') || lower.includes('llamada')) {
        botResponse = '¡Excelente! Podemos coordinar una sesión estratégica de 45 min gratuita por Google Meet. ¿Te parece bien hoy a las 15:00 o prefieres ver la disponibilidad de la semana?';
      } else if (lower.includes('precio') || lower.includes('paquete') || lower.includes('2') || lower.includes('costo')) {
        botResponse = 'Nuestros planes van desde Infinity Start ($397 pago único) hasta Infinity Growth ($1,497 inicial + $297/mes) con IA 24/7 y generación automatizada de prospectos.';
      } else if (lower.includes('caso') || lower.includes('3') || lower.includes('clinica') || lower.includes('odontolog')) {
        botResponse = '¡Por ejemplo, DentalCare aumentó un +320% sus pacientes agendados y redujo ausentismos al 3% gracias a nuestros agentes que confirman citas por WhatsApp!';
      } else {
        botResponse = `Comprendo perfectamente lo que necesitas sobre "${text}". Nuestros agentes de IA se conectan a tu base de datos y responden en < 3 segundos con el tono exacto de tu marca. ¿Te gustaría ver cómo se integraría en tu negocio?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        sender: 'bot',
        text: '👋 ¡Hola! Bienvenido a Infinity Impact Agency. Soy el Agente de IA para WhatsApp. ¿En qué podemos impulsar tu negocio hoy?',
        time: '12:00'
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="relative w-full max-w-md bg-[#0b0e14] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[580px] touch-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chat header WhatsApp style */}
        <div className="bg-[#121b22] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bot size={22} />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#121b22] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white leading-tight">Agente IA Infinity</h4>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-medium">Verificado</span>
              </div>
              <p className="text-[11px] text-emerald-400/90 font-medium">En línea 24/7 • Respuestas instantáneas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              title="Reiniciar chat"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw size={15} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-sm"
            >
              ✕
            </motion.button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#080d14] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="text-center my-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-800">
              Simulación interactiva de WhatsApp Business IA
            </span>
          </div>

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-[#1f2937] text-slate-100 rounded-bl-none border border-slate-700/60'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 bg-[#1f2937] px-3 py-2 rounded-2xl rounded-bl-none w-fit border border-slate-700/60">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Quick action chips */}
        <div className="px-3 py-2 bg-[#0d131d] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => handleSend('¿Cómo funciona el agente para agendar citas?')}
            className="whitespace-nowrap px-2.5 py-1 bg-slate-800/70 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700/50 transition-colors cursor-pointer"
          >
            📅 Agendamiento
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => handleSend('¿Cuánto cuesta implementar Infinity Growth?')}
            className="whitespace-nowrap px-2.5 py-1 bg-slate-800/70 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700/50 transition-colors cursor-pointer"
          >
            💰 Precios
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              onClose();
              onOpenBooking();
            }}
            className="whitespace-nowrap px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-full border border-emerald-500/30 transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            <Calendar size={11} /> Agendar llamada real
          </motion.button>
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-[#121b22] border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Escribe un mensaje de prueba..."
            className="flex-1 bg-[#1e293b] border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!inputVal.trim()}
            className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold rounded-xl transition-all cursor-pointer"
          >
            <Send size={15} />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
