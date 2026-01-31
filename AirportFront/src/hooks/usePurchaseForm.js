import { useState, useCallback, useMemo } from 'react';

// Configuración de precios por clase
const CLASS_MULTIPLIERS = {
  economy: 1,
  business: 2.5,
  first: 4
};

const SEAT_ROWS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '15', '18', '20', '24', '28', '32'];
const SEAT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Genera un número de asiento aleatorio
const generateRandomSeat = () => {
  const row = SEAT_ROWS[Math.floor(Math.random() * SEAT_ROWS.length)];
  const seat = SEAT_LETTERS[Math.floor(Math.random() * SEAT_LETTERS.length)];
  return `${row}${seat}`;
};

// Calcula el precio base según la clase
const calculateBasePrice = (ticketClass) => {
  const basePrice = 150 + Math.random() * 250; // 150-400 EUR base
  const multiplier = CLASS_MULTIPLIERS[ticketClass] || 1;
  return (basePrice * multiplier).toFixed(2);
};

// Hook para gestionar el formulario de compra de billetes multi-paso
export const usePurchaseForm = ({
  flight,
  initialPassengerName = '',
  onSubmit
}) => {
  // Estado del paso actual (1: Datos, 2: Asiento, 3: Confirmación)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    passengerName: initialPassengerName,
    passengerDocument: '',
    seatNumber: '',
    ticketClass: flight?._commercialOffer?.selectedClass || 'economy',
    price: flight?._commercialOffer?.price || '',
  });

  // Actualiza el nombre del pasajero
  const setPassengerName = useCallback((name) => {
    setFormData(prev => ({
      ...prev,
      passengerName: name
    }));
  }, []);

  // Handler para cambios de input
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Handler para selección de asiento
  const handleSeatSelect = useCallback((seat) => {
    setFormData(prev => ({
      ...prev,
      seatNumber: seat
    }));
    
    if (errors.seatNumber) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.seatNumber;
        return newErrors;
      });
    }
  }, [errors]);

  // Validaciones por paso
  const validateStep = useCallback((currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.passengerName.trim()) {
        newErrors.passengerName = 'Por favor, ingresa el nombre del pasajero';
      }
      if (!formData.passengerDocument.trim()) {
        newErrors.passengerDocument = 'Por favor, ingresa el documento del pasajero';
      }
    }

    if (currentStep === 2) {
      if (!formData.seatNumber) {
        newErrors.seatNumber = 'Por favor, selecciona un asiento';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Avanza al siguiente paso con validación
  const nextStep = useCallback(() => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
      return true;
    }
    return false;
  }, [step, validateStep]);

  // Retrocede al paso anterior
  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Ir a un paso específico
  const goToStep = useCallback((targetStep) => {
    // Solo permitir ir hacia atrás libremente
    if (targetStep < step) {
      setStep(targetStep);
      return true;
    }
    
    // Para avanzar, validar pasos intermedios
    if (targetStep > step) {
      for (let i = step; i < targetStep; i++) {
        if (!validateStep(i)) {
          return false;
        }
      }
      setStep(targetStep);
      return true;
    }
    
    return true;
  }, [step, validateStep]);

  // Calcula el precio final
  const calculatePrice = useCallback(() => {
    if (formData.price) {
      return parseFloat(formData.price).toFixed(2);
    }
    if (flight?._commercialOffer?.price) {
      return parseFloat(flight._commercialOffer.price).toFixed(2);
    }
    return calculateBasePrice(formData.ticketClass);
  }, [formData.price, formData.ticketClass, flight]);

  // Prepara los datos del ticket para envío
  const prepareTicketData = useCallback(() => {
    const seatNumber = formData.seatNumber.trim() || generateRandomSeat();
    const price = calculatePrice();

    return {
      flightNumber: flight?.flight?.number || flight?.flightNumber,
      flightIATA: flight?.flight?.iata || flight?.flightNumber,
      airlineName: flight?.airline?.name || 'Aerolínea',
      airlineIATA: flight?.airline?.iata || 'XX',
      departureAirport: flight?.departure?.airport || 'Aeropuerto Origen',
      departureIATA: flight?.departure?.iata || 'XXX',
      departureCity: flight?.departure?.city || 'Ciudad',
      departureDate: flight?.departure?.scheduled?.split('T')[0] || new Date().toISOString().split('T')[0],
      departureTime: flight?.departure?.scheduled?.split('T')[1]?.substring(0, 5) || '12:00',
      arrivalAirport: flight?.arrival?.airport || 'Aeropuerto Destino',
      arrivalIATA: flight?.arrival?.iata || 'YYY',
      arrivalCity: flight?.arrival?.city || 'Ciudad',
      arrivalDate: flight?.arrival?.estimated?.split('T')[0] || flight?.arrival?.scheduled?.split('T')[0] || new Date().toISOString().split('T')[0],
      arrivalTime: flight?.arrival?.estimated?.split('T')[1]?.substring(0, 5) || flight?.arrival?.scheduled?.split('T')[1]?.substring(0, 5) || '14:00',
      passengerName: formData.passengerName,
      passengerDocument: formData.passengerDocument,
      seatNumber,
      ticketClass: formData.ticketClass,
      price: parseFloat(price),
      currency: 'EUR',
      ticketStatus: 'confirmed'
    };
  }, [formData, flight, calculatePrice]);

  // Handler de submit del formulario
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();

    // Validar todos los pasos
    if (!validateStep(1) || !validateStep(2)) {
      return { success: false, error: 'Datos incompletos' };
    }

    try {
      setLoading(true);
      const ticketData = prepareTicketData();
      
      if (onSubmit) {
        const result = await onSubmit(ticketData);
        return { success: true, data: result };
      }
      
      return { success: true, data: ticketData };
    } catch (error) {
      console.error('❌ Error en formulario de compra:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [validateStep, prepareTicketData, onSubmit]);

  // Reset del formulario
  const resetForm = useCallback(() => {
    setStep(1);
    setErrors({});
    setFormData({
      passengerName: initialPassengerName,
      passengerDocument: '',
      seatNumber: '',
      ticketClass: flight?._commercialOffer?.selectedClass || 'economy',
      price: flight?._commercialOffer?.price || '',
    });
  }, [initialPassengerName, flight]);

  // Estado computado: ¿se puede continuar?
  const canContinue = useMemo(() => {
    switch (step) {
      case 1:
        return formData.passengerName.trim() && formData.passengerDocument.trim();
      case 2:
        return !!formData.seatNumber;
      case 3:
        return true;
      default:
        return false;
    }
  }, [step, formData]);

  // Etiqueta de clase legible
  const ticketClassLabel = useMemo(() => {
    const labels = {
      economy: 'Turista',
      business: 'Business',
      first: 'Primera Clase'
    };
    return labels[formData.ticketClass] || 'Turista';
  }, [formData.ticketClass]);

  const isPriceLocked = useMemo(() => !!flight?._commercialOffer?.price, [flight]);
  const isClassLocked = useMemo(() => !!flight?._commercialOffer?.selectedClass, [flight]);

  return {
    // Estado del formulario
    formData,
    step,
    loading,
    errors,
    
    // Computed states
    canContinue,
    ticketClassLabel,
    isPriceLocked,
    isClassLocked,
    
    // Handlers
    handleChange,
    handleSeatSelect,
    setPassengerName,
    
    // Navegación
    nextStep,
    prevStep,
    goToStep,
    
    // Submit
    handleSubmit,
    calculatePrice,
    prepareTicketData,
    resetForm,
    
    // Utilidades exportadas
    generateRandomSeat
  };
};

export default usePurchaseForm;
