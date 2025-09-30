import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Mapear categoría del backend (ENUM) a etiquetas del frontend
const toUiCategory = (cat) => {
  const v = String(cat || '').toLowerCase();
  if (v === 'snack') return 'Snack';
  if (v === 'bebida') return 'Bebida';
  if (v === 'ingrediente') return 'Ingrediente';
  if (v === 'toppings') return 'Toppings';
  if (v === 'chips') return 'Chips';
  if (v === 'fruta/vegetales') return 'Fruta/Vegetales';
  if (v === 'esencias') return 'Esencias';
  if (v === 'suplementos') return 'Suplementos';
  if (v === 'alimentos') return 'Alimentos';
  if (v === 'bebidas') return 'Bebidas';
  if (v === 'postres') return 'Postres';
  return 'Otro';
};

export default function Inventory({ isAdmin }) {
  const [inventory, setInventory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [showLowStock, setShowLowStock] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Alimentos",
    stock: 0,
    minStock: 1,
    unit: "unidades",
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar inventario desde el backend
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/api/inventario`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || 'No se pudo obtener el inventario');
        }
        const productos = Array.isArray(data?.productos) ? data.productos : [];
        const mapped = productos.map((p) => ({
          id: p.id_producto,
          name: p.nombre,
          category: toUiCategory(p.categoria),
          stock: Number(p.stock_actual ?? 0),
          minStock: Number(p.stock_minimo ?? 0),
          unit: p.unidad_medida || 'unidades',
          lastUpdated: p.ultima_actualizacion || new Date().toISOString().split('T')[0],
        }));
        setInventory(mapped);
      } catch (e) {
        setError(e?.message || 'Error cargando inventario');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Acceso Restringido</h2>
          <p className="text-red-500">Solo administradores pueden acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  async function updateStock(id, value) {
    const prev = inventory.find((i) => i.id === id)?.stock;
    setInventory((inv) =>
      inv.map((item) =>
        item.id === id ? { ...item, stock: value, lastUpdated: new Date().toISOString().split('T')[0] } : item
      )
    );

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/inventario/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ stock: Number(value) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo actualizar el stock');
      }
    } catch (e) {
      // revertir
      setInventory((inv) => inv.map((it) => (it.id === id ? { ...it, stock: prev } : it)));
      setError(e?.message || 'Error actualizando stock');
    }
  }

  async function deleteItem(id) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/inventario/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo eliminar el producto');
      }
      setInventory((inv) => inv.filter((item) => item.id !== id));
    } catch (e) {
      setError(e?.message || 'Error eliminando producto');
    }
  }

  async function addNewItem() {
    setFormError("");
    setError("");
    if (!newItem.name.trim()) {
      setFormError("El nombre es obligatorio");
      return;
    }
    if (!newItem.category || newItem.category === "Todos") {
      setFormError("Selecciona una categoría válida");
      return;
    }
    if (Number.isNaN(Number(newItem.stock)) || Number(newItem.stock) < 0) {
      setFormError("El stock debe ser un número mayor o igual a 0");
      return;
    }
    if (Number.isNaN(Number(newItem.minStock)) || Number(newItem.minStock) < 0) {
      setFormError("El stock mínimo debe ser un número mayor o igual a 0");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/inventario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newItem.name.trim(),
          category: newItem.category, // el backend normaliza
          stock: Number(newItem.stock),
          minStock: Number(newItem.minStock),
          unit: newItem.unit || 'unidades',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo crear el producto');
      }

      // Agregar localmente con el id devuelto
      const itemToAdd = {
        id: data?.id || Math.max(0, ...inventory.map((i) => i.id)) + 1,
        name: newItem.name.trim(),
        category: newItem.category,
        stock: Number(newItem.stock),
        minStock: Number(newItem.minStock),
        unit: newItem.unit || 'unidades',
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      setInventory((inv) => [...inv, itemToAdd]);
      setNewItem({ name: "", category: "Alimentos", stock: 0, minStock: 1, unit: "unidades" });
    } catch (e) {
      setError(e?.message || 'Error creando producto');
    }
  }

  const categories = ["Todos", "Snack", "Bebida", "Ingrediente", "Toppings", "Chips", "Fruta/Vegetales", "Esencias", "Suplementos", "Alimentos", "Bebidas", "Postres", "Otro"];
  const selectableCategories = categories.filter((c) => c !== "Todos");
  const unitOptions = ["unidades", "paquetes", "servicios", "litros", "kg", "botellas", "otros"];

  function getStatus(item) {
    if (item.stock <= item.minStock) return "Bajo";
    if (item.stock <= item.minStock * 2) return "Medio";
    return "Bueno";
  }

  const filteredInventory = inventory.filter((item) => {
    const categoryMatch = selectedCategory === "Todos" || item.category === selectedCategory;
    const lowStockMatch = !showLowStock || item.stock <= item.minStock;
    const nameMatch = !searchText || item.name.toLowerCase().includes(searchText.toLowerCase());
    const statusMatch = statusFilter === "Todos" || getStatus(item) === statusFilter;
    return categoryMatch && lowStockMatch && nameMatch && statusMatch;
  });

  const lowStockItems = inventory.filter((item) => item.stock <= item.minStock);
  const totalItems = inventory.length;

  return (
    <div className="page-container">
      <section className="max-w-7xl mx-auto py-10 px-6">
        {/* Header */}
        <div className="text-center mb-12 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
            Control de Inventario
          </h2>
          <p className="text-gray-700 text-lg font-medium">Gestiona el stock de productos y servicios</p>
        </div>

        {loading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm">
            Cargando inventario...
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{totalItems}</h3>
            <p className="text-gray-600">Productos Totales</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-red-500">{lowStockItems.length}</h3>
            <p className="text-gray-600">Stock Bajo</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-500">{inventory.reduce((sum, item) => sum + item.stock, 0)}</h3>
            <p className="text-gray-600">Unidades Totales</p>
          </div>

        </div>

        {/* Filtros y controles */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-yellow-400 focus:outline-none"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-yellow-400 focus:outline-none"
                >
                  {['Todos','Bajo','Medio','Bueno'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-64">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar por nombre</label>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Ej. Snacks, Bebidas..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showLowStock}
                    onChange={(e) => setShowLowStock(e.target.checked)}
                    className="w-4 h-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                  />
                  <span className="text-sm font-semibold text-gray-700">Solo stock bajo</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario: Agregar nuevo producto */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Agregar nuevo producto</h3>
          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {formError}
            </div>
          )}
          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-yellow-400 focus:outline-none"
                placeholder="Ej. Snack Mix Fiesta"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-yellow-400 focus:outline-none"
              >
                {selectableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
              <input
                type="number"
                min={0}
                value={newItem.stock}
                onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock mínimo</label>
              <input
                type="number"
                min={0}
                value={newItem.minStock}
                onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unidad</label>
              <select
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-yellow-400 focus:outline-none"
              >
                {unitOptions.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={addNewItem}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-2 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Agregar producto
            </button>
          </div>
        </div>

        {/* Tabla de inventario */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Producto</th>
                  <th className="px-6 py-4 text-left font-semibold">Categoría</th>
                  <th className="px-6 py-4 text-center font-semibold">Stock Actual</th>
                  <th className="px-6 py-4 text-center font-semibold">Stock Mínimo</th>
                  <th className="px-6 py-4 text-center font-semibold">Estado</th>
                  <th className="px-6 py-4 text-center font-semibold">Actualizar</th>
                  <th className="px-6 py-4 text-left font-semibold">Última Actualización</th>
                  <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, index) => (
                  <tr key={item.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-yellow-50 transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.unit}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xl font-bold text-gray-800">{item.stock}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-600">{item.minStock}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.stock <= item.minStock 
                          ? 'bg-red-100 text-red-600' 
                          : item.stock <= item.minStock * 2
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {item.stock <= item.minStock ? 'Bajo' : item.stock <= item.minStock * 2 ? 'Medio' : 'Bueno'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="number"
                        min={0}
                        value={item.stock}
                        onChange={(e) => updateStock(item.id, Number(e.target.value))}
                        className="w-20 border-2 border-gray-200 rounded-lg px-3 py-1 text-center focus:border-yellow-400 focus:outline-none"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="px-3 py-1 rounded-lg font-semibold text-red-600 hover:text-white border border-red-200 hover:bg-red-600 smooth-transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertas de stock bajo */}
        {lowStockItems.length > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-bold text-red-600">Alertas de Stock Bajo</h3>
            </div>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                  <span className="font-semibold text-gray-800">{item.name}</span>
                  <span className="text-red-600 font-bold">{item.stock} {item.unit} (mínimo: {item.minStock})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
