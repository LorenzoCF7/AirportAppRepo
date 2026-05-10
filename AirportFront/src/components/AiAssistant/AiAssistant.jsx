import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Plane, ChevronRight } from 'lucide-react';
import { aiService } from '../../services/aiService';
import styles from './AiAssistant.module.css';

const SUGGESTIONS = [
  'Recomiéndame un vuelo a París',
  'Vuelos baratos disponibles hoy',
  '¿Qué vuelos salen de Madrid?',
  'Quiero ir a algún sitio de playa',
];

const TypingIndicator = () => (
  <div className={styles.typingBubble}>
    <span className={styles.dot} />
    <span className={styles.dot} />
    <span className={styles.dot} />
  </div>
);

const RecommendationCard = ({ rec, onSearch }) => (
  <button className={styles.recCard} onClick={() => onSearch(rec)}>
    <div className={styles.recRoute}>
      <span className={styles.recIata}>{rec.origin}</span>
      <Plane size={12} className={styles.recPlane} />
      <span className={styles.recIata}>{rec.destination}</span>
    </div>
    <div className={styles.recCities}>
      {rec.originCity} → {rec.destinationCity}
    </div>
    {rec.reason && <p className={styles.recReason}>{rec.reason}</p>}
    <div className={styles.recAction}>
      Buscar vuelo <ChevronRight size={13} />
    </div>
  </button>
);

const AiAssistant = ({ onNavigateToShop, isOpen: externalOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = (val) => {
    setInternalOpen(val);
    onOpenChange?.(val);
  };
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '¡Hola! Soy AirBot ✈️ Tu asistente de viajes. Cuéntame qué tipo de vuelo buscas y te ayudaré a encontrar la mejor opción.',
      recs: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const data = await aiService.recommend(msg);
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: data.message, recs: data.recommendations || [] },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: 'Lo siento, no pude conectarme con el servidor. ¿Está el backend en marcha?', recs: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (rec) => {
    setOpen(false);
    onNavigateToShop?.({ origin: rec.origin, destination: rec.destination });
  };

  return (
    <>
      {/* ── Floating button ── */}
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Asistente IA"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
        {!open && <span className={styles.fabLabel}>AirBot</span>}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div className={styles.panel}>
          {/* Header */}
          <div className={styles.panelHeader}>
            <Sparkles size={18} className={styles.headerIcon} />
            <div>
              <p className={styles.headerTitle}>AirBot</p>
              <p className={styles.headerSub}>Asistente de vuelos con IA</p>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? styles.userRow : styles.botRow}>
                <div className={m.role === 'user' ? styles.userBubble : styles.botBubble}>
                  {m.text}
                </div>
                {m.recs && m.recs.length > 0 && (
                  <div className={styles.recList}>
                    {m.recs.map((r, j) => (
                      <RecommendationCard key={j} rec={r} onSearch={handleSearch} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className={styles.botRow}>
                <TypingIndicator />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips (only on first message) */}
          {messages.length === 1 && !loading && (
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className={styles.chip} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            className={styles.inputRow}
            onSubmit={e => { e.preventDefault(); send(); }}
          >
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={loading}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!input.trim() || loading}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiAssistant;
