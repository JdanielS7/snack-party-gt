import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/api/catalogo`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data.items || []);
      } else {
        throw new Error(data.error || 'Error al cargar productos');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      // Fallback a datos estáticos si hay error
      setProducts([
        { id_item: 1, nombre: "Barra de Snacks (Menú 1/2/3)", tipo: "Barra", imagen_url: "/img/snack.jpg", descripcion: "Selecciona uno de los 3 menús disponibles.", detalles: "Incluye variedad de snacks, montaje y servicio, refil opcional", es_popular: true },
        { id_item: 2, nombre: "Barra de Nachos con Queso", tipo: "Barra", imagen_url: "/img/nachos.jpg", descripcion: "Nachos con queso caliente y toppings.", detalles: "Queso caliente, salsas y toppings, ideal para todos", es_popular: false },
        { id_item: 3, nombre: "Máquina de Poporopos", tipo: "Barra", imagen_url: "/img/popcorn.jpg", descripcion: "Poporopos recién hechos en máquina.", detalles: "Maíz fresco, mantequilla y sal, aroma irresistible", es_popular: true },
        { id_item: 4, nombre: "Combo #1", tipo: "Combo", imagen_url: "/img/combo1.jpg", descripcion: "Incluye: Hot dogs tipo americano, nachos con queso, barra de snacks con 1 refil por 2 horas, poporopos ilimitados, gaseosas en lata, frioso.", detalles: "Ideal para eventos medianos, todo en uno", es_popular: true },
        { id_item: 5, nombre: "Combo #2", tipo: "Combo", imagen_url: "/img/combo2.jpg", descripcion: "Incluye: Hot dog tipo americano, papalinas, barra de snack con refil por 2 horas, crepas de palito dulces y gaseosas de lata.", detalles: "Dulce y salado, gran relación valor", es_popular: false },
      ]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { label: "Todos", value: "Todos" },
    { label: "Barras", value: "Barra" },
    { label: "Combos", value: "Combo" },
  ];

  
  const filteredProducts = selectedCategory === "Todos" 
    ? products 
    : products.filter(product => (product.tipo || '').trim().toLowerCase() === selectedCategory.toLowerCase());

  const parseFeatures = (detalles) => {
    if (!detalles) return [];
    return detalles.split(',').map(feature => feature.trim());
  };

  return (
    <div className="page-container">
      <section className="max-w-7xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="text-center mb-12 bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
          Nuestro Catálogo
        </h2>
        <p className="text-gray-700 text-lg font-medium">Descubre nuestros productos y servicios para hacer tu evento inolvidable</p>
      </div>

      {/* Filtros de categoría */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {categories.map(cat => (
          <button
            key={cat.label}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${
              selectedCategory === cat.value
                ? 'bg-yellow-400 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="text-gray-600 mt-4">Cargando productos...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12 bg-red-50 rounded-xl">
          <p className="text-red-600 mb-4">Error al cargar productos: {error}</p>
          <button 
            onClick={fetchProducts}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Grid de productos */}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id_item || product.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative">
              {(product.es_popular === true || product.es_popular === 1) && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                  ¡Popular!
                </div>
              )}
              
              <div className="relative">
                <img 
                  src={product.imagen_url || "/img/snack.jpg"} 
                  alt={product.nombre || product.name} 
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.src = "/img/snack.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <Link 
                    to="/quote" 
                    className="opacity-0 hover:opacity-100 bg-yellow-400 text-black px-6 py-2 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    {product.tipo || product.category}
                  </span>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">{product.nombre || product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{product.descripcion || product.description}</p>
                
                <div className="space-y-2 mb-4">
                  {parseFeatures(product.detalles || product.features?.join(', ')).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-end">
                  <Link 
                    to="/quote" 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-2 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Cotizar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay productos disponibles en esta categoría</p>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center mt-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">¿No encuentras lo que buscas?</h3>
        <p className="text-lg mb-6">Creamos paquetes personalizados según tus necesidades</p>
        <Link 
          to="/quote"
          className="bg-white text-yellow-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg inline-block"
        >
          Solicitar Cotización Personalizada
        </Link>
      </div>
      </section>
    </div>
  );
}