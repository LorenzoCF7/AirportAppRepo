// Servicio de gestión de billetes (Backend API)

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class TicketService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/tickets`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Interceptor para manejar errores
    this.apiClient.interceptors.response.use(
      response => response,
      error => {
        console.error('❌ Error en API de tickets:', error.response?.data || error.message);
        throw error;
      }
    );
    
    // Por ahora usamos un userId fijo hasta implementar auth
    this.currentUserId = 'user-default';
  }

  // Obtiene el userId actual (temporal hasta implementar auth)
  getCurrentUserId() {
    return this.currentUserId;
  }

  // Inicializa el servicio (para compatibilidad con código existente)
  async initialize() {
    console.log('🎫 TicketService inicializado');
    return true;
  }

  // Obtiene billetes del usuario
  async getUserTickets() {
    const userId = this.getCurrentUserId();
    console.log('🎫 Obteniendo tickets del usuario:', userId);

    try {
      const response = await this.apiClient.get(`/user/${userId}`);
      
      if (response.data.success) {
        console.log(`✅ ${response.data.data.length} tickets obtenidos`);
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error obteniendo billetes:', error);
      throw error;
    }
  }

  // Obtiene billete por ID
  async getTicketById(ticketId) {
    try {
      const response = await this.apiClient.get(`/${ticketId}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('❌ Error obteniendo billete:', error);
      throw error;
    }
  }

  // Obtiene billete por referencia de reserva
  async getTicketByReference(bookingReference) {
    try {
      const response = await this.apiClient.get(`/reference/${bookingReference}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('❌ Error obteniendo billete por referencia:', error);
      throw error;
    }
  }

  // Crea un billete
  async createTicket(ticketData) {
    const userId = this.getCurrentUserId();
    console.log('🎫 Creando ticket para usuario:', userId);

    const ticket = {
      ownerUserId: userId,
      flightNumber: ticketData.flightNumber,
      flightIATA: ticketData.flightIATA,
      airlineName: ticketData.airlineName,
      airlineIATA: ticketData.airlineIATA,
      departureAirport: ticketData.departureAirport,
      departureIATA: ticketData.departureIATA,
      departureCity: ticketData.departureCity,
      departureDate: ticketData.departureDate,
      departureTime: ticketData.departureTime,
      arrivalAirport: ticketData.arrivalAirport,
      arrivalIATA: ticketData.arrivalIATA,
      arrivalCity: ticketData.arrivalCity,
      arrivalDate: ticketData.arrivalDate,
      arrivalTime: ticketData.arrivalTime,
      passengerName: ticketData.passengerName,
      passengerDocument: ticketData.passengerDocument,
      seatNumber: ticketData.seatNumber,
      ticketClass: (ticketData.ticketClass || 'economy').toUpperCase(),
      price: ticketData.price,
      currency: ticketData.currency || 'EUR'
    };

    try {
      const response = await this.apiClient.post('', ticket);
      
      if (response.data.success) {
        console.log('✅ Ticket creado:', response.data.data.bookingReference);
        return response.data.data;
      }
      
      throw new Error('Error creando ticket');
    } catch (error) {
      console.error('❌ Error creando billete:', error);
      throw error;
    }
  }

  // Actualiza un billete
  async updateTicket(ticketId, updates) {
    try {
      const response = await this.apiClient.patch(`/${ticketId}`, updates);
      
      if (response.data.success) {
        console.log('✅ Ticket actualizado:', ticketId);
        return response.data.data;
      }
      
      throw new Error('Error actualizando ticket');
    } catch (error) {
      console.error('❌ Error actualizando billete:', error);
      throw error;
    }
  }

  // Cancela un billete
  async cancelTicket(ticketId) {
    try {
      const response = await this.apiClient.patch(`/${ticketId}/cancel`);
      
      if (response.data.success) {
        console.log('✅ Ticket cancelado:', ticketId);
        return response.data.data;
      }
      
      throw new Error('Error cancelando ticket');
    } catch (error) {
      console.error('❌ Error cancelando billete:', error);
      throw error;
    }
  }

  // Elimina un billete
  async deleteTicket(ticketId) {
    try {
      const response = await this.apiClient.delete(`/${ticketId}`);
      
      if (response.data.success) {
        console.log('✅ Ticket eliminado:', ticketId);
        return { success: true };
      }
      
      throw new Error('Error eliminando ticket');
    } catch (error) {
      console.error('❌ Error eliminando billete:', error);
      throw error;
    }
  }

  // Busca billetes por vuelo
  async getTicketsByFlight(flightIATA) {
    const userId = this.getCurrentUserId();
    
    try {
      const response = await this.apiClient.get(`/user/${userId}/flight/${flightIATA}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('❌ Error buscando billetes por vuelo:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const ticketService = new TicketService();
