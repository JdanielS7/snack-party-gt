import { useState, useEffect } from "react";

export default function Gallery() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("Todos");

  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/api/galeria?limit=20`);
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.eventos || []);
      } else {
        throw new Error(data.error || 'Error al cargar eventos');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
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

  const filteredEvents = selectedFilter === "Todos" 
    ? events 
    : events.filter(event => event.tipo_evento === selectedFilter);

  const uniqueTypes = ["Todos", ...new Set(events.map(event => event.tipo_evento))];
  return (
    <div className="page-container">
      <section className="max-w-7xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="text-center mb-12 bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
          Galería de Eventos
        </h2>
        <p className="text-gray-700 text-lg font-medium">Descubre algunos de nuestros eventos más destacados y las experiencias de nuestros clientes</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {uniqueTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedFilter(type)}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${
              selectedFilter === type
                ? 'bg-yellow-400 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="text-gray-600 mt-4">Cargando eventos...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12 bg-red-50 rounded-xl">
          <p className="text-red-600 mb-4">Error al cargar eventos: {error}</p>
          <button 
            onClick={fetchEvents}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Grid de eventos */}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map(event => (
            <div key={event.id_evento || event.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="relative">
                <img 
                  src={event.imagen_url || "/img/evento1.jpg"} 
                  alt={event.titulo_evento || event.title} 
                  className="w-full h-64 object-cover" 
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

      {/* Empty State */}
      {!loading && !error && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay eventos disponibles en esta categoría</p>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center mt-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">¿Quieres ser parte de nuestra galería?</h3>
        <p className="text-lg mb-6">Contrata nuestros servicios y crea recuerdos inolvidables</p>
        <button className="bg-white text-yellow-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg">
          Solicitar Cotización
        </button>
      </div>
      </section>
    </div>
  );
}