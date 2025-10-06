import { useState } from "react";
import { Link } from "react-router-dom";

export default function Quote() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdQuoteId, setCreatedQuoteId] = useState(null);
  const [showCustomizeSnacks, setShowCustomizeSnacks] = useState(false);
  const [formData, setFormData] = useState({
    eventDate: '',
    eventLocation: '',
    guestCount: '',
    services: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    eventType: '',
    specialRequests: '',
    // Nueva estructura de servicios
    individualBars: {
      barraSnacks: false,
      barraNachos: false,
      barraSopas: false,
      barraGranizadas: false,
      maquinaPoporopos: false,
      menusHotDogs: false,
      barraPalicrepas: false,
      barraQuetzaltecas: false,
      barraBebidas: false,
      barraMiches: false,
    },
    snacksCustomization: {
      fruits: [],
      chips: [],
      toppings: []
    },
    bebidasVariant: '', // con | sin
    comboSelected: '' // combo1 | combo2
  });
  const [validationError, setValidationError] = useState('');
  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const barsSelected = Object.values(formData.individualBars).some(Boolean);

  function toggleBar(barKey) {
    setFormData(prev => {
      const newBars = { ...prev.individualBars, [barKey]: !prev.individualBars[barKey] };
      const anyBar = Object.values(newBars).some(Boolean);
      const clearingSnacks = (barKey === 'barraSnacks' && prev.individualBars.barraSnacks);
      return {
        ...prev,
        individualBars: newBars,
        comboSelected: anyBar ? '' : prev.comboSelected,
        bebidasVariant: barKey === 'barraBebidas' && prev.individualBars.barraBebidas ? '' : prev.bebidasVariant,
        snacksCustomization: clearingSnacks ? { fruits: [], chips: [], toppings: [] } : prev.snacksCustomization,
      };
    });
  }

  const toggleCustom = (category, option) => {
    setFormData(prev => {
      const current = prev.snacksCustomization?.[category] || [];
      const set = new Set(current);
      if (set.has(option)) set.delete(option); else set.add(option);
      return {
        ...prev,
        snacksCustomization: {
          ...prev.snacksCustomization,
          [category]: Array.from(set)
        }
      };
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError('');
    setServerError('');

    // Validaciones de subopciones
        if (formData.individualBars.barraBebidas && !formData.bebidasVariant) {
      setValidationError('Selecciona si la Barra de Bebidas es con alcohol o sin alcohol.');
      return;
    }

    const raw = localStorage.getItem('token');
    const token = raw ? raw.replace(/^"|"$/g, '').trim() : '';
    if (!token) {
      setServerError('Debes iniciar sesión para enviar una cotización.');
      return;
    }

    setSubmitting(true);
    try {
      // Obtener catálogo para mapear selecciones a id_item
      const resCatalog = await fetch(`${API}/api/catalogo`);
      const dataCatalog = await resCatalog.json();
      if (!resCatalog.ok) {
        throw new Error(dataCatalog?.error || 'No se pudo cargar el catálogo');
      }
      const itemsCat = Array.isArray(dataCatalog?.items) ? dataCatalog.items : [];

      // Mapear claves de UI a nombres de items del catálogo
      const keyToName = {
        barraSnacks: 'Barra de Snacks (Menú 1/2/3)',
        barraNachos: 'Barra de Nachos con Queso',
        barraSopas: 'Barra de Sopas Preparadas',
        barraGranizadas: 'Barra de Granizadas',
        maquinaPoporopos: 'Máquina de Poporopos',
        menusHotDogs: 'Menús de Hot Dogs',
        barraPalicrepas: 'Barra de Palicrepas',
        barraQuetzaltecas: 'Barra de Quetzaltecas',
        barraBebidas: 'Barra de Bebidas (Con/Sin Alcohol)',
        barraMiches: 'Barra de Miches',
      };
      const comboToName = {
        combo1: 'Combo #1',
        combo2: 'Combo #2',
      };

      // Construir lista de items seleccionados
      const selectedBars = Object.entries(formData.individualBars)
        .filter(([, checked]) => !!checked)
        .map(([key]) => keyToName[key])
        .filter(Boolean);
      const selectedCombos = formData.comboSelected ? [comboToName[formData.comboSelected]].filter(Boolean) : [];
      const selectedNames = [...selectedBars, ...selectedCombos];

      // Resolver id_item por nombre
      const nameToId = new Map(itemsCat.map(it => [it.nombre, it.id_item]));
      const missing = selectedNames.filter(n => !nameToId.has(n));
      if (missing.length > 0) {
        throw new Error(`Los siguientes ítems no se encontraron en el catálogo: ${missing.join(', ')}`);
      }

      const itemsPayload = selectedNames.map(n => ({ id_item: nameToId.get(n), cantidad: 1 }));

      const fruitsSel = formData.snacksCustomization?.fruits || [];
      const chipsSel = formData.snacksCustomization?.chips || [];
      const toppingsSel = formData.snacksCustomization?.toppings || [];
      const personalizacion = (formData.individualBars.barraSnacks || formData.comboSelected)
        ? {
            frutas_seleccionadas: fruitsSel.length ? fruitsSel.join(',') : null,
            chips_seleccionados: chipsSel.length ? chipsSel.join(',') : null,
            toppings_seleccionados: toppingsSel.length ? toppingsSel.join(',') : null,
          }
        : undefined;

      const payload = {
        direccion_evento: formData.eventLocation,
        fecha_evento: formData.eventDate,
        hora_evento: null,
        tipo_evento: formData.eventType,
        num_invitados: parseInt(formData.guestCount, 10),
        solicitudes_especiales: formData.specialRequests || null,
        items: itemsPayload,
        personalizacion_snacks: personalizacion,
      };

      const res = await fetch(`${API}/api/cotizaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('isAdmin');
        } catch (_) {}
        const msg = data?.error === 'Token expirado' ? 'Tu sesión expiró. Inicia sesión nuevamente.' : 'Token inválido. Por favor inicia sesión otra vez.';
        throw new Error(msg);
      }
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo crear la cotización');
      }

      const quoteId = data?.cotizacion?.id_cotizacion;
      if (quoteId) {
        setCreatedQuoteId(quoteId);
        try { localStorage.setItem('lastQuoteId', String(quoteId)); } catch (_) {}
      }
      const hasSnacks = !!formData.individualBars.barraSnacks || !!formData.comboSelected;
      setShowCustomizeSnacks(hasSnacks);

      setSent(true);
    } catch (err) {
      setServerError(err?.message || 'Error al enviar la cotización');
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'comboSelected') {
      setFormData(prev => ({
        ...prev,
        comboSelected: value,
        individualBars: Object.fromEntries(Object.keys(prev.individualBars).map(k => [k, false])),
        bebidasVariant: '',
        snacksCustomization: value ? prev.snacksCustomization : { fruits: [], chips: [], toppings: [] }
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  }

  // fin helpers

  return (
    <div className="page-container">
      <section className="max-w-4xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="text-center mb-12 bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
          Solicitar Cotización
        </h2>
        <p className="text-gray-700 text-lg font-medium">Completa el formulario y te enviaremos una cotización personalizada</p>
      </div>

      {sent ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Cotización Enviada!</h3>
          {createdQuoteId && (
            <p className="text-gray-800 text-lg font-semibold mb-2">Tu número de cotización es #{createdQuoteId}</p>
          )}
          <p className="text-gray-600 text-lg mb-6">Gracias por tu solicitud. Nos pondremos en contacto contigo en las próximas 24 horas.</p>
          <div className="flex items-center justify-center gap-3">
            <button 
              onClick={() => setSent(false)}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Nueva Cotización
            </button>
            {showCustomizeSnacks && createdQuoteId && (
              <Link
                to={`/snack-bar-customization?cot=${createdQuoteId}`}
                className="bg-white text-yellow-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg border border-yellow-400"
              >
                Personalizar Barra de Snacks
              </Link>
            )}
          </div>
        </div>
      ) : (
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha del Evento *</label>
                  <input 
                    type="date" 
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Evento *</label>
                  <select 
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors"
                  >
                    <option value="">Selecciona el tipo</option>
                    <option value="cumpleanos">Cumpleaños</option>
                    <option value="boda">Boda</option>
                    <option value="corporativo">Evento Corporativo</option>
                    <option value="graduacion">Graduación</option>
                    <option value="baby-shower">Baby Shower</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lugar del Evento *</label>
                  <input 
                    type="text" 
                    name="eventLocation"
                    value={formData.eventLocation}
                    onChange={handleChange}
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                    placeholder="Dirección completa del evento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Invitados *</label>
                  <input 
                    type="number" 
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleChange}
                    required 
                    min={1}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                    placeholder="Cantidad aproximada"
                  />
                </div>
              </div>
            </div>

            {/* Servicios */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</span>
                Servicios Requeridos
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Solicitudes Especiales</label>
                  <textarea 
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors resize-none" 
                    placeholder="Alergias, preferencias alimentarias, etc."
                    rows={3}
                  />
                </div>
              </div>

              {/* A) Barras individuales */}
              <div className="mt-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">A) Barras individuales</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Barra de Snacks */}
                  <div className="border-2 border-gray-200 rounded-2xl p-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={formData.individualBars.barraSnacks} onChange={() => toggleBar('barraSnacks')} disabled={!!formData.comboSelected} className="w-5 h-5 text-yellow-500 rounded" />
                      <span className="font-semibold text-gray-800">Barra de Snacks</span>
                    </label>
                                      </div>

                  {/* Barra de Nachos con Queso */}
                  <div className="border-2 border-gray-200 rounded-2xl p-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={formData.individualBars.barraNachos} onChange={() => toggleBar('barraNachos')} disabled={!!formData.comboSelected} className="w-5 h-5 text-yellow-500 rounded" />
                      <span className="font-semibold text-gray-800">Barra de Nachos con Queso</span>
                    </label>
                  </div>

                  {/* Barra de Sopas Preparadas */}
                  <div className="border-2 border-gray-200 rounded-2xl p-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={formData.individualBars.barraSopas} onChange={() => toggleBar('barraSopas')} disabled={!!formData.comboSelected} className="w-5 h-5 text-yellow-500 rounded" />
                      <span className="font-semibold text-gray-800">Barra de Sopas Preparadas</span>
                    </label>
                  </div>

                  {/* Barra de Granizadas */}
                  <div className="border-2 border-gray-200 rounded-2xl p-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={formData.individualBars.barraGranizadas} onChange={() => toggleBar('barraGranizadas')} disabled={!!formData.comboSelected} className="w-5 h-5 text-yellow-500 rounded" />
                      <span className="font-semibold text-gray-800">Barra de Granizadas</span>
                    </label>
                  </div>

                  {/* Máquina de Poporopos */}
                  <div className="border-2 border-gray-200 rounded-2xl p-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={formData.individualBars.maquinaPoporopos} onChange={() => toggleBar('maquinaPoporopos')} disabled={!!formData.comboSelected} className="w-5 h-5 text-yellow-500 rounded" />
                      <span className="font-semibold text-gray-800">Máquina de Poporopos</span>
                    </label>
                  </div>

                  {/* Menús de Hot Dogs */}
                  <div className="border-2 border-gray-200 rounded-2xl p-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={formData.individualBars.menusHotDogs} onChange={() => toggleBar('menusHotDogs')} disabled={!!formData.comboSelected} className="w-5 h-5 text-yellow-500 rounded" />
                      <span className="font-semibold text-gray-800">Menús de Hot Dogs</span>
                    </label>
                  </div>

                  {/* Barra de Palicrepas */}
                  <div className="border-2 border-gray-200 rounded-2xl p-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={formData.individualBars.barraPalicrepas} onChange={() => toggleBar('barraPalicrepas')} disabled={!!formData.comboSelected} className="w-5 h-5 text-yellow-500 rounded" />
                      <span className="font-semibold text-gray-800">Barra de Palicrepas</span>
                    </label>
                  </div>

                  {/* Barra de Quetzaltecas */}
                  <div className="border-2 border-gray-200 rounded-2xl p-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={formData.individualBars.barraQuetzaltecas} onChange={() => toggleBar('barraQuetzaltecas')} disabled={!!formData.comboSelected} className="w-5 h-5 text-yellow-500 rounded" />
                      <span className="font-semibold text-gray-800">Barra de Quetzaltecas</span>
                    </label>
                  </div>

                  {/* Barra de Bebidas (con/sin) */}
                  <div className="border-2 border-gray-200 rounded-2xl p-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={formData.individualBars.barraBebidas} onChange={() => toggleBar('barraBebidas')} disabled={!!formData.comboSelected} className="w-5 h-5 text-yellow-500 rounded" />
                      <span className="font-semibold text-gray-800">Barra de Bebidas</span>
                    </label>
                    {formData.individualBars.barraBebidas && (
                      <div className="mt-3 pl-8 flex gap-6">
                        {[
                          { v:'con', label:'Con alcohol' },
                          { v:'sin', label:'Sin alcohol' }
                        ].map(opt => (
                          <label key={opt.v} className="flex items-center gap-2">
                            <input type="radio" name="bebidasVariant" value={opt.v} checked={formData.bebidasVariant===opt.v} onChange={handleChange} />
                            <span className="text-sm">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Barra de Miches */}
                  <div className="border-2 border-gray-200 rounded-2xl p-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={formData.individualBars.barraMiches} onChange={() => toggleBar('barraMiches')} disabled={!!formData.comboSelected} className="w-5 h-5 text-yellow-500 rounded" />
                      <span className="font-semibold text-gray-800">Barra de Miches</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* B) Combos especiales */}
              <div className="mt-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4">B) Combos especiales</h4>
                <div className="space-y-4">
                  <label className="block border-2 border-gray-200 rounded-2xl p-4 hover:border-yellow-300 smooth-transition">
                    <div className="flex items-start gap-3">
                      <input type="radio" name="comboSelected" value="combo1" checked={formData.comboSelected==='combo1'} onChange={handleChange} disabled={barsSelected} className="mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800">Combo #1</p>
                        <p className="text-sm text-gray-600">Incluye: Hot dogs tipo americano, nachos con queso, barra de snacks con 1 refil por 2 horas, poporopos ilimitados, gaseosas en lata, frioso.</p>
                      </div>
                    </div>
                  </label>
                  <label className="block border-2 border-gray-200 rounded-2xl p-4 hover:border-yellow-300 smooth-transition">
                    <div className="flex items-start gap-3">
                      <input type="radio" name="comboSelected" value="combo2" checked={formData.comboSelected==='combo2'} onChange={handleChange} disabled={barsSelected} className="mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800">Combo #2</p>
                        <p className="text-sm text-gray-600">Incluye: Hot dog tipo americano, papalinas, barra de snack con refil por 2 horas, crepas de palito dulces y gaseosas de lata.</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</span>
                Información de Contacto
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo *</label>
                  <input 
                    type="text" 
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico *</label>
                  <input 
                    type="email" 
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono *</label>
                  <input 
                    type="tel" 
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    required 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                    placeholder="+502 0000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Botón de Envío */}
            <div className="text-center pt-6">
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando...' : 'Enviar Solicitud de Cotización'}
              </button>
              <p className="text-gray-500 text-sm mt-4">* Campos obligatorios</p>
            </div>
          </form>
        </div>
      )}
      </section>
    </div>
  );
}