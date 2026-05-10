import { useState, useCallback } from 'react';
import { X } from 'lucide-react';

import { ticketService } from '../../services/ticketService';
import { useScrollLock } from '../../hooks';
import { useAuth } from '../../context/AuthContext';

import StepIndicator    from './StepIndicator';
import FlightSummary    from './FlightSummary';
import PassengerInfoStep from './PassengerInfoStep';
import SeatSelectionStep from './SeatSelectionStep';
import ConfirmationStep  from './ConfirmationStep';

import styles from './PurchaseTicketForm.module.css';

const BAGGAGE_PRICES = { none: 0, hold23: 35, hold23x2: 65, hold32: 55 };
const ADDON_PRICES   = { priorityBoarding: 12, insurance: 28, loungeAccess: 45 };

const generateRandomSeat = () => {
  const rows  = ['1','2','3','4','5','6','7','8','9','10','11','12','15','18','20','24','28','32'];
  const seats = ['A','B','C','D','E','F'];
  return `${rows[Math.floor(Math.random() * rows.length)]}${seats[Math.floor(Math.random() * seats.length)]}`;
};

const PurchaseTicketForm = ({ flight, onClose, onSuccess, roundTripStep }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Pasajero
    firstName:      '',
    lastName:       '',
    documentType:   'DNI',
    documentNumber: '',
    birthDate:      '',
    nationality:    'Española',
    email:          '',
    phone:          '',
    // Vuelo
    seatNumber:  '',
    ticketClass: flight?._commercialOffer?.selectedClass || 'economy',
    price:       flight?._commercialOffer?.price || '',
    // Extras
    baggage: 'none',
    meal:    'none',
    extras: {
      priorityBoarding: false,
      insurance:        false,
      loungeAccess:     false,
    },
    // Compatibilidad con backend
    passengerName:     '',
    passengerDocument: '',
  });

  useScrollLock(true);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleExtrasChange = useCallback((extraName) => {
    setFormData(prev => ({
      ...prev,
      extras: { ...prev.extras, [extraName]: !prev.extras[extraName] }
    }));
  }, []);

  const handleBaggageChange = useCallback((baggageId) => {
    setFormData(prev => ({ ...prev, baggage: baggageId }));
  }, []);

  const handleSeatSelect = useCallback((seat) => {
    setFormData(prev => ({ ...prev, seatNumber: seat }));
  }, []);

  const getExtrasCost = useCallback(() => {
    let cost = BAGGAGE_PRICES[formData.baggage] || 0;
    Object.entries(formData.extras).forEach(([key, active]) => {
      if (active) cost += ADDON_PRICES[key] || 0;
    });
    return cost;
  }, [formData.baggage, formData.extras]);

  const getBasePrice = useCallback(() => {
    return parseFloat(formData.price || flight?._commercialOffer?.price || 150);
  }, [formData.price, flight]);

  const getFinalPrice = useCallback(() => {
    return (getBasePrice() + getExtrasCost()).toFixed(2);
  }, [getBasePrice, getExtrasCost]);

  const handleContinueToSeatSelection = useCallback((e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('Por favor, ingresa el nombre y apellidos del pasajero');
      return;
    }
    if (!formData.documentNumber.trim()) {
      alert('Por favor, ingresa el número de documento');
      return;
    }
    if (!formData.email.trim()) {
      alert('Por favor, ingresa un email de contacto');
      return;
    }
    setStep(2);
  }, [formData.firstName, formData.lastName, formData.documentNumber, formData.email]);

  const handleContinueToConfirmation = useCallback(() => {
    if (!formData.seatNumber) {
      alert('Por favor, selecciona un asiento');
      return;
    }
    setStep(3);
  }, [formData.seatNumber]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const passengerName     = `${formData.firstName} ${formData.lastName}`.trim();
      const passengerDocument = `${formData.documentType}: ${formData.documentNumber}`.trim();
      const seatNumber        = formData.seatNumber.trim() || generateRandomSeat();
      const price             = getFinalPrice();

      const ticketData = {
        ownerUserId:      user?.id != null ? String(user.id) : undefined,
        flightNumber:     flight.flight?.number || flight.flightNumber || flight.flight?.iata || 'UNKNOWN',
        flightIATA:       flight.flight?.iata   || flight.flightNumber || 'UNKNOWN',
        airlineName:      flight.airline?.name  || 'Aerolínea',
        airlineIATA:      flight.airline?.iata  || 'XX',
        departureAirport: flight.departure?.airport || 'Aeropuerto Origen',
        departureIATA:    flight.departure?.iata    || 'XXX',
        departureCity:    flight.departure?.city    || 'Ciudad',
        departureDate:    flight.departure?.scheduled?.split('T')[0] || flight.departure?.date || new Date().toISOString().split('T')[0],
        departureTime:    flight.departure?.scheduled?.split('T')[1]?.substring(0, 5) || flight.departure?.time || '12:00',
        arrivalAirport:   flight.arrival?.airport  || 'Aeropuerto Destino',
        arrivalIATA:      flight.arrival?.iata      || 'YYY',
        arrivalCity:      flight.arrival?.city      || 'Ciudad',
        arrivalDate:      flight.arrival?.estimated?.split('T')[0] || flight.arrival?.scheduled?.split('T')[0] || flight.arrival?.date || new Date().toISOString().split('T')[0],
        arrivalTime:      flight.arrival?.estimated?.split('T')[1]?.substring(0, 5) || flight.arrival?.scheduled?.split('T')[1]?.substring(0, 5) || flight.arrival?.time || '14:00',
        passengerName,
        passengerDocument,
        seatNumber,
        ticketClass:        formData.ticketClass,
        price:              parseFloat(price),
        currency:           'EUR',
        baggage:            formData.baggage,
        meal:               formData.meal,
        priorityBoarding:   formData.extras.priorityBoarding,
        insurance:          formData.extras.insurance,
        loungeAccess:       formData.extras.loungeAccess,
      };

      await ticketService.initialize();
      const newTicket = await ticketService.createTicket(ticketData);

      window.dispatchEvent(new CustomEvent('flight-notification', {
        detail: {
          title:   '✅ Compra Exitosa',
          message: `Billete para el vuelo ${flight.flight?.iata || flight.flightNumber} comprado correctamente`,
          type:    'success'
        }
      }));

      if (onSuccess) onSuccess(newTicket);
      else onClose();
    } catch (error) {
      console.error('❌ Error comprando billete:', error);
      alert('Error al comprar el billete. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [formData, flight, getFinalPrice, onClose, onSuccess]);

  if (!flight) return null;

  const isClassLocked = !!flight._commercialOffer?.selectedClass;

  return (
    <div className={styles.purchaseModalOverlay} onClick={onClose}>
      <div className={styles.purchaseModal} onClick={e => e.stopPropagation()}>

        <button className={styles.closeModal} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.modalHeader}>
          <h2>
            {roundTripStep === 'outbound' ? 'Vuelo de ida · 1 de 2'
              : roundTripStep === 'return' ? 'Vuelo de vuelta · 2 de 2'
              : 'Comprar Billete'}
          </h2>
          <StepIndicator currentStep={step} />
        </div>

        <div className={styles.modalContent}>
          <FlightSummary flight={flight} />

          {step === 1 && (
            <PassengerInfoStep
              formData={formData}
              onChange={handleChange}
              onExtrasChange={handleExtrasChange}
              onBaggageChange={handleBaggageChange}
              onSubmit={handleContinueToSeatSelection}
              onCancel={onClose}
              isClassLocked={isClassLocked}
              basePrice={getBasePrice()}
              extrasCost={getExtrasCost()}
            />
          )}

          {step === 2 && (
            <SeatSelectionStep
              selectedSeat={formData.seatNumber}
              onSeatSelect={handleSeatSelect}
              onBack={() => setStep(1)}
              onContinue={handleContinueToConfirmation}
            />
          )}

          {step === 3 && (
            <ConfirmationStep
              formData={formData}
              flight={flight}
              loading={loading}
              price={getFinalPrice()}
              basePrice={getBasePrice()}
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
