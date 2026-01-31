package com.galacticos.AirportApp.dto.request;

import com.galacticos.AirportApp.entity.TicketClass;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTicketRequest {

    @NotBlank(message = "El ID del propietario es obligatorio")
    private String ownerUserId;

    @NotBlank(message = "El número de vuelo es obligatorio")
    private String flightNumber;

    @NotBlank(message = "El código IATA del vuelo es obligatorio")
    @Size(max = 10, message = "El código IATA del vuelo no puede exceder 10 caracteres")
    private String flightIATA;

    @NotBlank(message = "El nombre de la aerolínea es obligatorio")
    private String airlineName;

    @NotBlank(message = "El código IATA de la aerolínea es obligatorio")
    @Size(max = 5, message = "El código IATA de la aerolínea no puede exceder 5 caracteres")
    private String airlineIATA;

    @NotBlank(message = "El aeropuerto de salida es obligatorio")
    private String departureAirport;

    @NotBlank(message = "El código IATA de salida es obligatorio")
    @Size(max = 5, message = "El código IATA de salida no puede exceder 5 caracteres")
    private String departureIATA;

    @NotBlank(message = "La ciudad de salida es obligatoria")
    private String departureCity;

    @NotBlank(message = "La fecha de salida es obligatoria")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Formato de fecha inválido. Use YYYY-MM-DD")
    private String departureDate;

    @NotBlank(message = "La hora de salida es obligatoria")
    @Pattern(regexp = "\\d{2}:\\d{2}", message = "Formato de hora inválido. Use HH:MM")
    private String departureTime;

    @NotBlank(message = "El aeropuerto de llegada es obligatorio")
    private String arrivalAirport;

    @NotBlank(message = "El código IATA de llegada es obligatorio")
    @Size(max = 5, message = "El código IATA de llegada no puede exceder 5 caracteres")
    private String arrivalIATA;

    @NotBlank(message = "La ciudad de llegada es obligatoria")
    private String arrivalCity;

    @NotBlank(message = "La fecha de llegada es obligatoria")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Formato de fecha inválido. Use YYYY-MM-DD")
    private String arrivalDate;

    @NotBlank(message = "La hora de llegada es obligatoria")
    @Pattern(regexp = "\\d{2}:\\d{2}", message = "Formato de hora inválido. Use HH:MM")
    private String arrivalTime;

    @NotBlank(message = "El nombre del pasajero es obligatorio")
    private String passengerName;

    @NotBlank(message = "El documento del pasajero es obligatorio")
    private String passengerDocument;

    @NotBlank(message = "El número de asiento es obligatorio")
    @Size(max = 5, message = "El número de asiento no puede exceder 5 caracteres")
    private String seatNumber;

    @NotNull(message = "La clase del billete es obligatoria")
    private TicketClass ticketClass;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor que 0")
    private BigDecimal price;

    @Size(max = 3, message = "El código de moneda no puede exceder 3 caracteres")
    private String currency;
}
