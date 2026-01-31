import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

import { ticketService } from '../../services/ticketService';
import { useScrollLock } from '../../hooks';

// Sub-componentes extraídos
import StepIndicator from './StepIndicator';
import FlightSummary from './FlightSummary';
import PassengerInfoStep from './PassengerInfoStep';
import SeatSelectionStep from './SeatSelectionStep';
import ConfirmationStep from './ConfirmationStep';

import styles from './PurchaseTicketForm.module.css';

// Genera un asiento aleatorio
const generateRandomSeat = () => {
  const rows = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '15', '18', '20', '24', '28', '32'];
  const seats = ['A', 'B', 'C', 'D', 'E', 'F'];
  const row = rows[Math.floor(Math.random() * rows.length)];
  const seat = seats[Math.floor(Math.random() * seats.length)];
  return `${row}${seat}`;
};

// Calcula precio basado en clase
const calculatePrice = (ticketClass) => {
  const basePrice = 150 + Math.random() * 250;
  const multipliers = { economy: 1, business: 2.5, first: 4 };
  return (basePrice * multipliers[ticketClass]).toFixed(2);
};

// Formulario de compra de billetes multi-paso
const PurchaseTicketForm = ({ flight, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    passengerName: '',
    passengerDocument: '',
    seatNumber: '',
    ticketClass: flight?._commercialOffer?.selectedClass || 'economy',
    price: flight?._commercialOffer?.price || '',
  });

  // Hook para bloquear scroll del body
  useScrollLock(true);

  // Por ahora no hay autenticación - el usuario ingresa su nombre manualmente
  // TODO: Cuando se implemente autenticación, cargar info del usuario aquí

  // Handler genérico para cambios de input
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handler para selección de asiento
  const handleSeatSelect = useCallback((seat) => {
    setFormData(prev => ({ ...prev, seatNumber: seat }));
  }, []);

  // Validación y avance a paso 2
  const handleContinueToSeatSelection = useCallback((e) => {
    e.preventDefault();
    if (!formData.passengerName.trim()) {
      alert('Por favor, ingresa el nombre del pasajero');
      return;
    }
    if (!formData.passengerDocument.trim()) {
      alert('Por favor, ingresa el documento del pasajero');
      return;
    }
    setStep(2);
  }, [formData.passengerName, formData.passengerDocument]);

  // Validación y avance a paso 3
  const handleContinueToConfirmation = useCallback(() => {
    if (!formData.seatNumber) {
      alert('Por favor, selecciona un asiento');
      return;
    }
    setStep(3);
  }, [formData.seatNumber]);

  // Obtener precio final
  const getFinalPrice = useCallback(() => {
    return formData.price || flight?._commercialOffer?.price || calculatePrice(formData.ticketClass);
  }, [formData.price, formData.ticketClass, flight]);

  // Submit final
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const seatNumber = formData.seatNumber.trim() || generateRandomSeat();
      const price = getFinalPrice();

      const ticketData = {
        flightNumber: flight.flight?.number || flight.flightNumber || flight.flight?.iata || 'UNKNOWN',
        flightIATA: flight.flight?.iata || flight.flightNumber || 'UNKNOWN',
        airlineName: flight.airline?.name || 'Aerolínea',
        airlineIATA: flight.airline?.iata || 'XX',
        departureAirport: flight.departure?.airport || 'Aeropuerto Origen',
        departureIATA: flight.departure?.iata || 'XXX',
        departureCity: flight.departure?.city || 'Ciudad',
        departureDate: flight.departure?.scheduled?.split('T')[0] || flight.departure?.date || new Date().toISOString().split('T')[0],
        departureTime: flight.departure?.scheduled?.split('T')[1]?.substring(0, 5) || flight.departure?.time || '12:00',
        arrivalAirport: flight.arrival?.airport || 'Aeropuerto Destino',
        arrivalIATA: flight.arrival?.iata || 'YYY',
        arrivalCity: flight.arrival?.city || 'Ciudad',
        arrivalDate: flight.arrival?.estimated?.split('T')[0] || flight.arrival?.scheduled?.split('T')[0] || flight.arrival?.date || new Date().toISOString().split('T')[0],
        arrivalTime: flight.arrival?.estimated?.split('T')[1]?.substring(0, 5) || flight.arrival?.scheduled?.split('T')[1]?.substring(0, 5) || flight.arrival?.time || '14:00',
        passengerName: formData.passengerName,
        passengerDocument: formData.passengerDocument,
        seatNumber,
        ticketClass: formData.ticketClass,
        price: parseFloat(price),
        currency: 'EUR',
        ticketStatus: 'confirmed'
      };

      await ticketService.initialize();
      const newTicket = await ticketService.createTicket(ticketData);
      
      window.dispatchEvent(new CustomEvent('flight-notification', {
        detail: {
          title: '✅ Compra Exitosa',
          message: `Billete para el vuelo ${flight.flight?.iata || flight.flightNumber} comprado correctamente`,
          type: 'success'
        }
      }));
      
      if (onSuccess) onSuccess(newTicket);
      onClose();
    } catch (error) {
      console.error('❌ Error comprando billete:', error);
      alert('Error al comprar el billete. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [formData, flight, getFinalPrice, onClose, onSuccess]);

  if (!flight) return null;

  // Props derivadas
  const isClassLocked = !!flight._commercialOffer?.selectedClass;
  const isPriceLocked = !!flight._commercialOffer?.price;
  const pricePlaceholder = flight._commercialOffer?.price 
    ? `${flight._commercialOffer.price}` 
    : 'Se calculará automáticamente';

  return (
    <div className={styles.purchaseModalOverlay} onClick={onClose}>
      <div className={styles.purchaseModal} onClick={(e) => e.stopPropagation()}>
        {/* Botón cerrar */}
        <button className={styles.closeModal} onClick={onClose}>
          <X size={24} />
        </button>

        {/* Header con título e indicador de pasos */}
        <div className={styles.modalHeader}>
          <h2>Comprar Billete</h2>
          <StepIndicator currentStep={step} />
        </div>

        {/* Contenido del modal */}
        <div className={styles.modalContent}>
          {/* Resumen del vuelo (siempre visible) */}
          <FlightSummary flight={flight} />

          {/* Paso 1: Datos del pasajero */}
          {step === 1 && (
            <PassengerInfoStep
              formData={formData}
              onChange={handleChange}
              onSubmit={handleContinueToSeatSelection}
              onCancel={onClose}
              isClassLocked={isClassLocked}
              isPriceLocked={isPriceLocked}
              pricePlaceholder={pricePlaceholder}
            />
          )}

          {/* Paso 2: Selección de asiento */}
          {step === 2 && (
            <SeatSelectionStep
              selectedSeat={formData.seatNumber}
              onSeatSelect={handleSeatSelect}
              onBack={() => setStep(1)}
              onContinue={handleContinueToConfirmation}
            />
          )}

          {/* Paso 3: Confirmación */}
          {step === 3 && (
            <ConfirmationStep
              formData={formData}
              flight={flight}
              loading={loading}
              price={getFinalPrice()}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseTicketForm;
