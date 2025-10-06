import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/logo.jpg";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const LOGO_URL = (import.meta.env.VITE_LOGO_URL || "").trim();
  const LOGO_SRCSET = (import.meta.env.VITE_LOGO_SRCSET || "").trim();

  useEffect(() => {
    fetchLatestEvents();
  }, []);

  const fetchLatestEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/api/galeria?limit=3`);
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.eventos || []);
      } else {
        // Fallback a datos estáticos si hay error
        setEvents([
          { 
            id: 1, 
            imagen_url: "/img/evento1.jpg", 
            titulo_evento: "Cumpleaños Infantil",
            descripcion: "¡Excelente servicio y calidad! Los niños quedaron encantados con los snacks.",
            nombre_cliente: "María González",
            fecha_evento: "2024-03-15",
            tipo_evento: "Cumpleaños"
          },
          { 
            id: 2, 
            imagen_url: "/img/evento2.jpg", 
            titulo_evento: "Boda Elegante",
            descripcion: "Los snacks fueron un éxito en mi fiesta. La presentación fue impecable.",
            nombre_cliente: "Carlos y Ana",
            fecha_evento: "2024-02-22",
            tipo_evento: "Boda"
          },
          { 
            id: 3, 
            imagen_url: "/img/evento3.jpg", 
            titulo_evento: "Evento Corporativo",
            descripcion: "Servicio profesional y puntual. Nuestros clientes quedaron muy satisfechos.",
            nombre_cliente: "Empresa TechCorp",
            fecha_evento: "2024-01-10",
            tipo_evento: "Corporativo"
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      // Fallback a datos estáticos
      setEvents([
        { 
          id: 1, 
          imagen_url: "/img/evento1.jpg", 
          titulo_evento: "Cumpleaños Infantil",
          descripcion: "¡Excelente servicio y calidad! Los niños quedaron encantados con los snacks.",
          nombre_cliente: "María González",
          fecha_evento: "2024-03-15",
          tipo_evento: "Cumpleaños"
        },
        { 
          id: 2, 
          imagen_url: "/img/evento2.jpg", 
          titulo_evento: "Boda Elegante",
          descripcion: "Los snacks fueron un éxito en mi fiesta. La presentación fue impecable.",
          nombre_cliente: "Carlos y Ana",
          fecha_evento: "2024-02-22",
          tipo_evento: "Boda"
        },
        { 
          id: 3, 
          imagen_url: "/img/evento3.jpg", 
          titulo_evento: "Evento Corporativo",
          descripcion: "Servicio profesional y puntual. Nuestros clientes quedaron muy satisfechos.",
          nombre_cliente: "Empresa TechCorp",
          fecha_evento: "2024-01-10",
          tipo_evento: "Corporativo"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen page-container">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="mb-8">
            {/* Logo */}
            <div className="mb-6">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden shadow-2xl border-4 border-yellow-400/30 mx-auto bg-white/5">
                <img
                  src={LOGO_URL || logo}
                  srcSet={LOGO_SRCSET || undefined}
                  alt="Snack Party Logo"
                  loading="eager"
                  decoding="sync"
                  className="w-full h-full object-contain"
                  style={{ imageRendering: "-webkit-optimize-contrast" }}
                />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Snack Party
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-white mb-4">
              ¡Hacemos tus eventos inolvidables!
            </p>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Servicios premium de snacks, desayunos y bebidas para cumpleaños, bodas, eventos corporativos y más. 
              Calidad excepcional que tus invitados recordarán.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link 
              to="/catalog" 
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-10 py-4 rounded-2xl font-bold text-xl hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              Ver Catálogo
            </Link>
            <Link 
              to="/quote" 
              className="bg-white text-gray-800 px-10 py-4 rounded-2xl font-bold text-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              Solicitar Cotización
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">200+</div>
              <div className="text-gray-300">Eventos Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">98%</div>
              <div className="text-gray-300">Clientes Satisfechos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">2+</div>
              <div className="text-gray-300">Años de Experiencia</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text-yellow mb-6">Nuestra Misión</h2>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-3xl p-8 shadow-soft">
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                Brindamos experiencias únicas y deliciosas a través de servicios de catering personalizados, 
                especializados en barras de snacks premium y alimentos para todo tipo de eventos, con un enfoque 
                en la calidad, creatividad y satisfacción del cliente.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <div className="text-2xl font-bold text-yellow-600">
                  ¡La mejor barra de snacks de toda Guate!
                </div>
                <div className="hidden md:block w-1 h-8 bg-yellow-400 rounded"></div>
                <div className="text-xl font-semibold text-gray-700">
                  ¡Un universo de sabores para tus fiestas!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Nuestros Servicios</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ofrecemos una amplia gama de servicios para hacer que tu evento sea perfecto
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Barras de Snacks Personalizadas</h3>
              <p className="text-gray-600 mb-6">
                Personaliza tu barra de snacks con frutas, chips y toppings de tu elección. ¡Crea la experiencia perfecta para tu evento!
              </p>
              <Link to="/snack-bar-customization" className="text-yellow-500 font-semibold hover:text-yellow-600 transition-colors">
                Personalizar →
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Refacciones</h3>
              <p className="text-gray-600 mb-6">
                Deliciosas opciones de refacciones para cualquier momento del día. Ingredientes frescos y preparaciones caseras.
              </p>
              <Link to="/catalog" className="text-yellow-500 font-semibold hover:text-yellow-600 transition-colors">
                Ver opciones →
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Combos</h3>
              <p className="text-gray-600 mb-6">
                Paquetes completos diseñados para diferentes tipos de eventos. La solución perfecta con todo incluido.
              </p>
              <Link to="/catalog" className="text-yellow-500 font-semibold hover:text-yellow-600 transition-colors">
                Ver combos →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Events */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Últimos Eventos</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Los eventos más recientes que hemos realizado y las experiencias de nuestros clientes
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              <p className="text-gray-600 mt-4">Cargando eventos...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {events.map(event => (
                <div key={event.id_evento || event.id} className="bg-gray-50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="relative">
                    <img 
                      src={event.imagen_url || "/img/evento1.jpg"} 
                      alt={event.titulo_evento || event.title} 
                      className="w-full h-48 object-cover" 
                      onError={(e) => {
                        e.target.src = "/img/evento1.jpg";
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                      {formatDate(event.fecha_evento || event.date)}
                    </div>
                    <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {event.tipo_evento || "Evento"}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{event.titulo_evento || event.title}</h3>
                    <p className="text-gray-600 italic mb-4">"{event.descripcion || event.testimonial}"</p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Cliente:</p>
                        <p className="font-semibold text-gray-700">{event.nombre_cliente || event.client}</p>
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              to="/gallery" 
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-3 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Ver Más Eventos
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-yellow-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para hacer tu evento inolvidable?
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Contáctanos hoy mismo y recibe una cotización personalizada para tu evento
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/quote" 
              className="bg-white text-yellow-600 px-10 py-4 rounded-2xl font-bold text-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              Solicitar Cotización
            </Link>
            <Link 
              to="/contact" 
              className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-2xl font-bold text-xl hover:bg-white hover:text-yellow-600 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              Contactar Ahora
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}