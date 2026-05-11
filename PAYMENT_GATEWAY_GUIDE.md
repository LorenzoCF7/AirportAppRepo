# 💳 Pasarela de Pago Stripe - Guía de Implementación

## 🎯 Resumen de la Implementación

Se ha integrado exitosamente **Stripe** como pasarela de pago para las compras de billetes en la aplicación AirportApp. El sistema permite a los usuarios pagar de forma segura con tarjetas de crédito/débito y otros métodos de pago soportados por Stripe.

---

## 📋 Características Implementadas

### ✅ Backend (Spring Boot)

1. **Entidad Payment** (`Payment.java`)
   - Almacena información de pagos en la base de datos
   - Campos: stripePaymentIntentId, userId, amount, currency, status, cardBrand, cardLastFour

2. **PaymentService** (`PaymentService.java`)
   - Gestiona toda la lógica de pagos con Stripe
   - Métodos principales:
     - `createPaymentIntent()` - Crea una intención de pago
     - `confirmPayment()` - Confirma un pago completado
     - `getPaymentStatus()` - Obtiene el estado de un pago
     - `cancelPayment()` - Cancela un pago

3. **PaymentController** (`PaymentController.java`)
   - Expone endpoints REST para gestionar pagos
   - Rutas:
     - `POST /api/payments/create-payment-intent` - Crear intención de pago
     - `POST /api/payments/confirm-payment` - Confirmar pago
     - `GET /api/payments/status/{paymentIntentId}` - Obtener estado
     - `GET /api/payments/user/{userId}` - Listar pagos de usuario
     - `POST /api/payments/cancel/{paymentIntentId}` - Cancelar pago

### ✅ Frontend (React)

1. **Servicio de Pagos** (`src/services/paymentService.js`)
   - Comunica con la API de Stripe y el backend
   - Métodos disponibles:
     - `initializeStripe()` - Inicializa Stripe
     - `createPaymentIntent()` - Crea intención de pago
     - `processPayment()` - Procesa pago con Stripe Elements
     - `confirmPayment()` - Confirma pago en backend

2. **Componente Stripe Payment Form** (`StripePaymentForm.jsx`)
   - Interfaz de formulario de tarjeta seguro
   - Elemento de tarjeta embebido de Stripe
   - Validación en tiempo real
   - Manejo de errores

3. **Integración en Confirmación** (`ConfirmationStep.jsx`)
   - Reemplazó el formulario de pago simulado
   - Flujo completo: crear intención → procesar pago → confirmar → crear billete

---

## 🔧 Configuración

### Backend

**Archivo**: `AirportApp/src/main/resources/application.properties`


### Frontend

**Archivo**: `AirportFront/.env.local`

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_51TVyPUI5ct1R0v7Wou4vBNhyF1Uqtvwbar3e4C5MIbfDdj9e4ozbJ8hPrHpPnzrMllU5sM9GfPqnWqtaagxJMjm500M5mpfDAO
VITE_API_URL=http://localhost:8080/api
```

---

## 🧪 Tarjetas de Prueba

Usa estas tarjetas para probar :

| Tarjeta | Mes/Año | CVC |
|---------|-----------|---------|-----|
| `4242 4242 4242 4242` | Cualquier futuro | Cualquier 3 dígitos |


---

## 📱 Flujo de Compra

```
1. Usuario selecciona un vuelo → "Comprar Billete"
   ↓
2. Ingresa datos del pasajero (nombre, documento, email, etc.)
   ↓
3. Selecciona asiento
   ↓
4. Confirma y revisa datos
   ↓
5. ✨ NUEVO: Ingresa datos de tarjeta de manera segura con Stripe
   ↓
6. Hace click en "Pagar X€"
   ↓
7. Stripe procesa el pago
   ↓
8. Backend confirma el pago y crea el billete
   ↓
9. ✅ Billete creado exitosamente
```

---

## 🔐 Seguridad

- ✅ Todos los datos de tarjeta son procesados por Stripe (PCI-DSS compliant)
- ✅ Backend nunca recibe datos de tarjeta directos
- ✅ CORS configurado para localhost
- ✅ Cifrado SSL/TLS en todas las comunicaciones
- ✅ Stripe Elements valida datos en tiempo real

---

## 🚀 Cómo Ejecutar

### Arrancar Backend

```bash
cd AirportApp
mvn spring-boot:run
```

El servidor estará disponible en: `http://localhost:8080`

### Arrancar Frontend

```bash
cd AirportFront
npm install  # Si no se ha ejecutado
npm run dev
```

El frontend estará disponible en: `http://localhost:5174`

---

## 📊 API Endpoints Disponibles

### Crear Intención de Pago

```http
POST http://localhost:8080/api/payments/create-payment-intent
Content-Type: application/json

{
  "userId": 1,
  "ticketId": "ticket-123456",
  "amount": 125.50,
  "currency": "EUR"
}
```

**Respuesta:**
```json
{
  "success": true,
  "clientSecret": "pi_test_..._secret_...",
  "paymentIntentId": "pi_test_..."
}
```

### Confirmar Pago

```http
POST http://localhost:8080/api/payments/confirm-payment
Content-Type: application/json

{
  "paymentIntentId": "pi_test_..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "paymentStatus": "SUCCEEDED",
  "amount": 125.50,
  "ticketId": "ticket-123456"
}
```

### Obtener Estado de Pago

```http
GET http://localhost:8080/api/payments/status/pi_test_...
```

**Respuesta:**
```json
{
  "success": true,
  "paymentStatus": "SUCCEEDED",
  "amount": 125.50,
  "ticketId": "ticket-123456",
  "cardBrand": "visa",
  "cardLastFour": "4242"
}
```

---

## 🐛 Troubleshooting

### "Error inicializando Stripe"
- Verifica que Stripe.js se cargue correctamente en `index.html`
- Comprueba que `VITE_STRIPE_PUBLIC_KEY` está configurada en `.env.local`

### "PaymentIntent failed"
- Verifica que `stripe.api-key` está configurada correctamente
- Comprueba la consola del backend para más detalles

### "El elemento de tarjeta no se monta"
- Asegúrate de que el div con `id="stripe-card-element"` existe
- Verifica que Stripe se inicializó correctamente

---

## 📝 Próximas Mejoras (Opcionales)

- [ ] Webhook de Stripe para confirmar pagos asincronamente
- [ ] Guardar tarjetas para futuros pagos
- [ ] Soporte de más métodos de pago (Apple Pay, Google Pay)
- [ ] Emails de confirmación de pago
- [ ] Dashboard de transacciones
- [ ] Reembolsos

---

## 📚 Referencias

- [Documentación de Stripe](https://stripe.com/docs)
- [Stripe Elements React](https://stripe.com/docs/stripe-js/elements-group)
- [Testing Stripe](https://stripe.com/docs/testing)

---

**¡La pasarela de pago está lista para usar! 🎉**

Para cualquier pregunta o problema, revisa los logs en:
- **Backend**: Terminal Maven
- **Frontend**: Consola del navegador (F12)
