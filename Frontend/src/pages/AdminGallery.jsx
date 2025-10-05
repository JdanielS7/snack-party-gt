import { useEffect, useState } from "react";

export default function AdminGallery() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({
    titulo_evento: "",
    tipo_evento: "",
    fecha_evento: "",
    descripcion: "",
    nombre_cliente: "",
    imagen_url: ""
  });
  const [form, setForm] = useState({
    titulo_evento: "",
    tipo_evento: "",
    fecha_evento: "",
    descripcion: "",
    nombre_cliente: "",
    imagen_url: ""
  });

  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/galeria?limit=100`);
      const data = await res.json();
      setEvents(data.eventos || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

      // Requerimos imagen por archivo o por URL
      if (!selectedFile && !form.imagen_url.trim()) {
        alert("Debes seleccionar un archivo de imagen o proporcionar una URL de imagen");
        return;
      }

      let imageUrl = form.imagen_url.trim();
      if (selectedFile) {
        // Subir primero al backend (que sube a Cloudinary)
        imageUrl = await uploadImageToBackend(selectedFile);
      }

      const payload = {
        ...form,
        imagen_url: imageUrl,
      };

      const res = await fetch(`${API}/api/galeria`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || "Error creando evento");
      }

      // Reset form y recargar
      setForm({
        titulo_evento: "",
        tipo_evento: "",
        fecha_evento: "",
        descripcion: "",
        nombre_cliente: "",
        imagen_url: "",
      });
      setSelectedFile(null);
      await fetchEvents();
    } catch (e) {
      console.error(e);
      alert(e.message || "No se pudo crear el evento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar evento?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/galeria/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error eliminando evento");
      await fetchEvents();
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (e) => {
    setEditingEvent(e);
    setEditForm({
      titulo_evento: e.titulo_evento || "",
      tipo_evento: e.tipo_evento || "",
      fecha_evento: e.fecha_evento ? new Date(e.fecha_evento).toISOString().slice(0,10) : "",
      descripcion: e.descripcion || "",
      nombre_cliente: e.nombre_cliente || "",
      imagen_url: e.imagen_url || "",
    });
    setSelectedFile(null);
    setEditOpen(true);
  };

  const handleEditChange = (ev) => {
    const { name, value } = ev.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFileChange = (ev) => {
    const file = ev.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setEditForm((prev) => ({ ...prev, imagen_url: "" }));
    }
  };

  const handleUpdate = async (ev) => {
    ev.preventDefault();
    try {
      setLoading(true);
      let imageUrl = editForm.imagen_url?.trim() || "";
      if (selectedFile) {
        imageUrl = await uploadImageToBackend(selectedFile);
      }

      const payload = { ...editForm, imagen_url: imageUrl || null };

      const res = await fetch(`${API}/api/galeria/${editingEvent.id_evento}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Error actualizando evento");

      setEditOpen(false);
      setEditingEvent(null);
      setSelectedFile(null);
      await fetchEvents();
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
            Administrar Galería
          </h2>
          <p className="text-gray-700 text-lg font-medium">Agrega o elimina eventos de la galería</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Agregar nuevo evento</h3>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <input 
                  name="titulo_evento" 
                  value={form.titulo_evento} 
                  onChange={handleChange} 
                  placeholder="Título del evento" 
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <input 
                  name="tipo_evento" 
                  value={form.tipo_evento} 
                  onChange={handleChange} 
                  placeholder="Tipo de evento" 
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <input 
                  type="date" 
                  name="fecha_evento" 
                  value={form.fecha_evento} 
                  onChange={handleChange} 
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <input 
                  name="nombre_cliente" 
                  value={form.nombre_cliente} 
                  onChange={handleChange} 
                  placeholder="Nombre del cliente" 
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                />
              </div>
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
                placeholder="Descripción del evento" 
                rows={4}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors resize-none" 
              />
            </div>
            <div className="flex gap-4 justify-end">
              <button 
                type="reset" 
                onClick={() => { setForm({ titulo_evento: "", tipo_evento: "", fecha_evento: "", descripcion: "", nombre_cliente: "", imagen_url: "" }); setSelectedFile(null); }} 
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                Limpiar
              </button>
              <button 
                disabled={loading || uploading} 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading || uploading ? "Guardando..." : "Agregar Evento"}
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

        {/* Lista de eventos */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Eventos de la galería</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e) => (
              <div key={e.id_evento} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <img 
                  src={e.imagen_url} 
                  alt={e.titulo_evento} 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{e.titulo_evento}</h4>
                  <p className="text-gray-600 mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mr-2">
                      {e.tipo_evento}
                    </span>
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Cliente:</strong> {e.nombre_cliente}
                  </p>
                  <p className="text-gray-700 text-sm mb-3">
                    <strong>Fecha:</strong> {new Date(e.fecha_evento).toLocaleDateString('es-ES')}
                  </p>
                  {e.descripcion && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{e.descripcion}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => openEdit(e)} 
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(e.id_evento)} 
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {events.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay eventos en la galería</p>
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
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Editar evento</h3>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <input name="titulo_evento" value={editForm.titulo_evento} onChange={handleEditChange} placeholder="Título del evento" required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" />
                  <input name="tipo_evento" value={editForm.tipo_evento} onChange={handleEditChange} placeholder="Tipo de evento" required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <input type="date" name="fecha_evento" value={editForm.fecha_evento} onChange={handleEditChange} required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" />
                  <input name="nombre_cliente" value={editForm.nombre_cliente} onChange={handleEditChange} placeholder="Nombre del cliente" required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" />
                </div>
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
