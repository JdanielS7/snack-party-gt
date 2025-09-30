import { useState } from "react";

export default function SnackBarCustomization() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    eventAddress: '',
    eventDate: '',
    eventTime: '',
    celebrantName: '',
    // Selecciones
    fruits: [],
    chips: [],
    toppings: []
  });
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const fruitsOptions = [
    'Piña', 'Zanahoria', 'Sandía', 'Pepino', 'Mango verde'
  ];

  const chipsOptions = [
    'Ranchitas', 'Jalapeños', 'Nachos', 'Takis Fuego', 'Takis Original',
    'Takis Blue Heat', 'Takis Xplosion', 'Takis Huakamole', 'Tortrix Limón',
    'Tortrix Barbacoa', 'Tortrix Picantes', 'Yuquitas', 'Taqueritos', 'Palitos',
    'Elotitos', 'Cheetos', 'Chobix', 'Pretzel', 'Tocinitos', 'Quesifritos',
    'Quesifritos picantes'
  ];

  const toppingsOptions = [
    'Maní enchilado', 'Maní salado', 'Palitos de tamarindo', 'Paleta de cervecitas',
    'Gomitas enchiladas', 'Gomitas de oso', 'Gomitas de tiburón', 'Gomitas de corazón',
    'Gomitas de tambor', 'Gomitas de aro azucarado', 'Gomitas de platanito',
    'Gomitas de besito', 'Gomitas de fresa', 'Gomitas de tira de colores',
    'Gomitas de tubo de fresa', 'Gomitas de diente'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectionChange = (category, item, checked) => {
    setFormData(prev => {
      const currentSelection = prev[category] || [];
      let newSelection;
      
      if (checked) {
        newSelection = [...currentSelection, item];
      } else {
        newSelection = currentSelection.filter(selected => selected !== item);
      }
      
      return {
        ...prev,
        [category]: newSelection
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setServerError('');

    // Validaciones
    if (formData.fruits.length === 0) {
      setValidationError('Debes seleccionar al menos una fruta/verdura.');
      return;
    }
    if (formData.fruits.length > 3) {
      setValidationError('Máximo 3 frutas/verduras permitidas.');
      return;
    }
    if (formData.chips.length === 0) {
      setValidationError('Debes seleccionar al menos un tipo de chips.');
      return;
    }
    if (formData.chips.length > 9) {
      setValidationError('Máximo 9 tipos de chips permitidos.');
      return;
    }
    if (formData.toppings.length > 6) {
      setValidationError('Máximo 6 toppings permitidos.');
      return;
    }

    // Requiere una cotización existente: id en querystring ?cot=ID o en localStorage
    const params = new URLSearchParams(window.location.search);
    const cotId = params.get('cot') || localStorage.getItem('lastQuoteId');
    if (!cotId) {
      setServerError('No se encontró la cotización a personalizar. Abre esta página desde el flujo de cotización o indica ?cot=ID en la URL.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setServerError('Debes iniciar sesión para enviar la personalización.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/cotizaciones/${cotId}/personalizacion`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          frutas_seleccionadas: formData.fruits.join(','),
          chips_seleccionados: formData.chips.join(','),
          toppings_seleccionados: formData.toppings.join(','),
          // Datos adicionales para el email
          email: formData.email,
          nombre: formData.name,
          telefono: formData.phone,
          direccion_evento: formData.eventAddress,
          fecha_evento: formData.eventDate,
          hora_evento: formData.eventTime,
          nombre_festejados: formData.celebrantName
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo guardar la personalización');
      }
      setSubmitted(true);
    } catch (err) {
      setServerError(err?.message || 'Error al guardar la personalización');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-container">
        <section className="max-w-4xl mx-auto py-10 px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Personalización Enviada!</h2>
            <p className="text-gray-600 text-lg mb-6">
              Gracias {formData.name}. Tu personalización de la barra de snacks ha sido enviada correctamente.
            </p>
            <p className="text-gray-500 mb-6">
              Te contactaremos pronto para confirmar los detalles de tu evento.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Nueva Personalización
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-container">
      <section className="max-w-4xl mx-auto py-10 px-6">
        {/* Header */}
        <div className="text-center mb-12 bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
            Personalización de Barra de Snacks
          </h1>
          <p className="text-gray-700 text-lg font-medium">
            Personaliza tu barra de snacks seleccionando tus ingredientes favoritos
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {validationError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                {validationError}
              </div>
            )}
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                {serverError}
              </div>
            )}

            {/* Información del Evento */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</span>
                Información del Evento
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Solicitante *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Teléfono *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                    placeholder="+502 0000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección del Evento *</label>
                  <input 
                    type="text" 
                    name="eventAddress"
                    value={formData.eventAddress}
                    onChange={handleInputChange}
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                    placeholder="Dirección completa del evento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha del Evento *</label>
                  <input 
                    type="date" 
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hora del Evento *</label>
                  <input 
                    type="time" 
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de los Festejados *</label>
                  <input 
                    type="text" 
                    name="celebrantName"
                    value={formData.celebrantName}
                    onChange={handleInputChange}
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                    placeholder="Nombre de la persona o personas que celebran"
                  />
                </div>
              </div>
            </div>

            {/* A) Selección de Frutas/Verduras */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">A</span>
                Selección de Frutas/Verduras (Máximo 3)
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {fruitsOptions.map((fruit, index) => (
                  <label key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-yellow-400 transition-all duration-300">
                    <input
                      type="checkbox"
                      checked={formData.fruits.includes(fruit)}
                      onChange={(e) => handleSelectionChange('fruits', fruit, e.target.checked)}
                      disabled={!formData.fruits.includes(fruit) && formData.fruits.length >= 3}
                      className="form-checkbox h-5 w-5 text-yellow-500 rounded focus:ring-yellow-400 disabled:opacity-50"
                    />
                    <span className="text-lg font-semibold text-gray-800">{fruit}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Seleccionados: {formData.fruits.length}/3
              </p>
            </div>

            {/* B) Selección de Chips */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">B</span>
                Selección de Chips (Máximo 9)
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {chipsOptions.map((chip, index) => (
                  <label key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-yellow-400 transition-all duration-300">
                    <input
                      type="checkbox"
                      checked={formData.chips.includes(chip)}
                      onChange={(e) => handleSelectionChange('chips', chip, e.target.checked)}
                      disabled={!formData.chips.includes(chip) && formData.chips.length >= 9}
                      className="form-checkbox h-5 w-5 text-yellow-500 rounded focus:ring-yellow-400 disabled:opacity-50"
                    />
                    <span className="text-sm font-semibold text-gray-800">{chip}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Seleccionados: {formData.chips.length}/9
              </p>
            </div>

            {/* C) Selección de Toppings */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">C</span>
                Selección de Toppings (Máximo 6)
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {toppingsOptions.map((topping, index) => (
                  <label key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-yellow-400 transition-all duration-300">
                    <input
                      type="checkbox"
                      checked={formData.toppings.includes(topping)}
                      onChange={(e) => handleSelectionChange('toppings', topping, e.target.checked)}
                      disabled={!formData.toppings.includes(topping) && formData.toppings.length >= 6}
                      className="form-checkbox h-5 w-5 text-yellow-500 rounded focus:ring-yellow-400 disabled:opacity-50"
                    />
                    <span className="text-sm font-semibold text-gray-800">{topping}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Seleccionados: {formData.toppings.length}/6
              </p>
            </div>

            {/* Botón de Envío */}
            <div className="text-center pt-6">
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando...' : 'Enviar Personalización'}
              </button>
              <p className="text-gray-500 text-sm mt-4">* Campos obligatorios</p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
