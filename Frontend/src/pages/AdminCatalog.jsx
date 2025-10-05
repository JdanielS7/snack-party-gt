import { useEffect, useState } from "react";

export default function AdminCatalog() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    descripcion: "",
    tipo: "Barra",
    es_popular: false,
    detalles: "",
    estado: "Activo",
    imagen_url: ""
  });
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    tipo: "Barra",
    es_popular: false,
    detalles: "",
    imagen_url: ""
  });

  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/catalogo`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      // si se selecciona archivo, limpiamos imagen_url manual para evitar confusión
      setForm((prev) => ({ ...prev, imagen_url: "" }));
    }
  };

  const uploadImageToBackend = async (file) => {
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`${API}/api/upload/imagen`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Fallo al subir la imagen");
      }
      if (!data.url) {
        throw new Error("El servidor no devolvió la URL de la imagen");
      }
      return data.url;
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      setUploadError(err.message || "Error subiendo la imagen");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      let imageUrl = form.imagen_url.trim();
      if (selectedFile) {
        // Subir primero al backend (que sube a Cloudinary)
        imageUrl = await uploadImageToBackend(selectedFile);
      }

      const payload = {
        ...form,
        imagen_url: imageUrl || null,
        productos: []
      };

      const res = await fetch(`${API}/api/catalogo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || "Error creando item");
      }

      // Reset form
      setForm({ nombre: "", descripcion: "", tipo: "Barra", es_popular: false, detalles: "", imagen_url: "" });
      setSelectedFile(null);
      setUploadError("");
      await fetchItems();
    } catch (e) {
      console.error(e);
      alert(e.message || "No se pudo crear el item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar item?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/catalogo/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error eliminando item");
      await fetchItems();
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (it) => {
    setEditingItem(it);
    setEditForm({
      nombre: it.nombre || "",
      descripcion: it.descripcion || "",
      tipo: it.tipo || "Barra",
      es_popular: it.es_popular === true || it.es_popular === 1,
      detalles: it.detalles || "",
      estado: it.estado || "Activo",
      imagen_url: it.imagen_url || "",
    });
    setSelectedFile(null);
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setEditForm((prev) => ({ ...prev, imagen_url: "" }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let imageUrl = editForm.imagen_url?.trim() || "";
      if (selectedFile) {
        imageUrl = await uploadImageToBackend(selectedFile);
      }

      const payload = { ...editForm, imagen_url: imageUrl || null };

      const res = await fetch(`${API}/api/catalogo/${editingItem.id_item}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Error actualizando item");

      setEditOpen(false);
      setEditingItem(null);
      setSelectedFile(null);
      await fetchItems();
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <section className="max-w-6xl mx-auto py-10 px-6">
        {/* Header */}
        <div className="text-center mb-12 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
            Administrar Catálogo
          </h2>
          <p className="text-gray-700 text-lg font-medium">Crea o elimina barras y combos del catálogo</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Agregar nuevo item</h3>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <input 
                  name="nombre" 
                  value={form.nombre} 
                  onChange={handleChange} 
                  placeholder="Nombre del item" 
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <select 
                  name="tipo" 
                  value={form.tipo} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors"
                >
                  <option value="Barra">Barra</option>
                  <option value="Combo">Combo</option>
                </select>
              </div>
            </div>
            <div>
              <input 
                name="detalles" 
                value={form.detalles} 
                onChange={handleChange} 
                placeholder="Detalles del item (ej: 40 personas, incluye bebidas, etc.)" 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
              />
            </div>

            {/* Imagen: archivo o URL */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen (archivo)</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-yellow-400 focus:outline-none transition-colors bg-white" 
                />
                <p className="text-xs text-gray-500 mt-2">La imagen se subirá de forma segura a través del servidor. Peso máximo: 5MB.</p>
                {uploadError && (
                  <p className="text-sm text-red-600 mt-2">{uploadError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">O URL de imagen</label>
                <input 
                  name="imagen_url" 
                  value={form.imagen_url} 
                  onChange={handleChange} 
                  placeholder="https://... (opcional si subes archivo)" 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                />
              </div>
            </div>

            <div>
              <textarea 
                name="descripcion" 
                value={form.descripcion} 
                onChange={handleChange} 
                placeholder="Descripción detallada" 
                rows={4}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors resize-none" 
              />
            </div>
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                name="es_popular" 
                checked={form.es_popular} 
                onChange={handleChange}
                className="w-5 h-5 text-yellow-400 border-2 border-gray-300 rounded focus:ring-yellow-400 focus:ring-2"
              />
              <label className="text-gray-700 font-medium">Marcar como popular</label>
            </div>
            <div className="flex gap-4 justify-end">
              <button 
                type="reset" 
                onClick={() => { 
                  setForm({ nombre: "", descripcion: "", tipo: "Barra", es_popular: false, detalles: "", imagen_url: "" }); 
                  setSelectedFile(null); 
                  setUploadError("");
                }} 
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                Limpiar
              </button>
              <button 
                disabled={loading || uploading} 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading || uploading ? "Guardando..." : "Agregar Item"}
              </button>
            </div>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">Cargando...</p>
          </div>
        )}

        {/* Lista de items */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Items del catálogo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => (
              <div key={it.id_item} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                {it.imagen_url ? (
                  <img 
                    src={it.imagen_url} 
                    alt={it.nombre} 
                    className="w-full h-48 object-cover" 
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{it.nombre}</h4>
                  <p className="text-gray-600 mb-2">
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold mr-2">
                      {it.tipo}
                    </span>
                    {(it.es_popular === true || it.es_popular === 1) && (
                      <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Popular
                      </span>
                    )}
                  </p>
                  {it.detalles && (
                    <p className="text-gray-700 text-sm mb-3">{it.detalles}</p>
                  )}
                  {it.descripcion && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{it.descripcion}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => openEdit(it)} 
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(it.id_item)} 
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {items.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay items en el catálogo</p>
            </div>
          )}
        </div>

        {editOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditOpen(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
              <button
                aria-label="Cerrar"
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setEditOpen(false)}
              >
                ✕
              </button>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Editar item</h3>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <input name="nombre" value={editForm.nombre} onChange={handleEditChange} placeholder="Nombre" required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" />
                  <select name="tipo" value={editForm.tipo} onChange={handleEditChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors">
                    <option value="Barra">Barra</option>
                    <option value="Combo">Combo</option>
                  </select>
                </div>
                <input name="detalles" value={editForm.detalles} onChange={handleEditChange} placeholder="Detalles" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" />
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen (archivo)</label>
                    <input type="file" accept="image/*" onChange={handleEditFileChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-yellow-400 focus:outline-none transition-colors bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">O URL de imagen</label>
                    <input name="imagen_url" value={editForm.imagen_url} onChange={handleEditChange} placeholder="https://..." className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" />
                  </div>
                </div>
                <textarea name="descripcion" value={editForm.descripcion} onChange={handleEditChange} placeholder="Descripción" rows={4} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors resize-none" />
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" name="es_popular" checked={editForm.es_popular} onChange={handleEditChange} className="w-5 h-5 text-yellow-400 border-2 border-gray-300 rounded focus:ring-yellow-400 focus:ring-2" />
                    <label className="text-gray-700 font-medium">Popular</label>
                  </div>
                  <div className="md:col-span-2">
                    <select name="estado" value={editForm.estado} onChange={handleEditChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors">
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 justify-end">
                  <button type="button" onClick={() => setEditOpen(false)} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">Cancelar</button>
                  <button disabled={loading || uploading} className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50">Guardar cambios</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}



