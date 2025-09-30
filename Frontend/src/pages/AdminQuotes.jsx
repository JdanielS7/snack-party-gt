import { useEffect, useState } from "react";

export default function AdminQuotes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState(null);

  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API}/api/cotizaciones/admin/todas?page=${page}&limit=${limit}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || `Error ${res.status}`);
      }
      setData(json.cotizaciones || []);
      setTotal(json.pagination?.total || 0);
    } catch (err) {
      setError(err?.message || "Error al cargar cotizaciones");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const updateQuoteStatus = async (id, newStatus) => {
    try {
      setUpdating(id);
      const res = await fetch(`${API}/api/cotizaciones/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: newStatus })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Error al actualizar estado');
      }

      // Actualizar el estado local
      setData(prevData => 
        prevData.map(quote => 
          quote.id_cotizacion === id 
            ? { ...quote, estado: newStatus }
            : quote
        )
      );
    } catch (err) {
      setError(err?.message || 'Error al actualizar estado');
    } finally {
      setUpdating(null);
    }
  };

  const deleteQuote = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta cotización? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setUpdating(id);
      const res = await fetch(`${API}/api/cotizaciones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Error al eliminar cotización');
      }

      // Remover de la lista local
      setData(prevData => prevData.filter(quote => quote.id_cotizacion !== id));
      setTotal(prevTotal => prevTotal - 1);
    } catch (err) {
      setError(err?.message || 'Error al eliminar cotización');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="page-container">
      <section className="max-w-7xl mx-auto py-10 px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Bandeja de Cotizaciones
          </h1>
          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value, 10)); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {[10, 20, 50].map(n => (
                <option key={n} value={n}>{n} / página</option>
              ))}
            </select>
            <button
              onClick={fetchQuotes}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
            >
              Refrescar
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">Cargando...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="text-left px-4 py-3 font-semibold">#</th>
                  <th className="text-left px-4 py-3 font-semibold">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold">Evento</th>
                  <th className="text-left px-4 py-3 font-semibold">Invitados</th>
                  <th className="text-left px-4 py-3 font-semibold">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold">Items</th>
                  <th className="text-left px-4 py-3 font-semibold">Personalización Snacks</th>
                  <th className="text-left px-4 py-3 font-semibold">Creado</th>
                  <th className="text-center px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-gray-500">Sin registros</td>
                  </tr>
                )}
                {data.map((c) => (
                  <tr key={c.id_cotizacion} className="border-t">
                    <td className="px-4 py-3 align-top text-gray-800">{c.id_cotizacion}</td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      <div className="font-semibold">{c.nombre_completo || '-'}</div>
                      <div className="text-xs text-gray-500">{c.correo || ''}</div>
                      <div className="text-xs text-gray-500">{c.telefono || ''}</div>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      <div className="font-medium">{c.tipo_evento}</div>
                      <div className="text-xs text-gray-500">{c.fecha_evento}</div>
                      <div className="text-xs text-gray-500">{c.direccion_evento}</div>
                    </td>
                    <td className="px-4 py-3 align-top">{c.num_invitados}</td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        c.estado === 'Aceptada' 
                          ? 'bg-green-100 text-green-700' 
                          : c.estado === 'Rechazada'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <ul className="list-disc ml-5 space-y-1">
                        {(c.items || []).map((it, idx) => (
                          <li key={idx} className="text-gray-700">
                            <span className="font-medium">{it.nombre}</span>{" "}
                            <span className="text-xs text-gray-500">x{it.cantidad}</span>{" "}
                            <span className="text-xs text-gray-400">({it.tipo})</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {c.personalizacion_snacks ? (
                        <div className="text-xs text-gray-700 space-y-1">
                          {c.personalizacion_snacks.frutas_seleccionadas && (
                            <div><span className="font-semibold">Frutas:</span> {c.personalizacion_snacks.frutas_seleccionadas}</div>
                          )}
                          {c.personalizacion_snacks.chips_seleccionados && (
                            <div><span className="font-semibold">Chips:</span> {c.personalizacion_snacks.chips_seleccionados}</div>
                          )}
                          {c.personalizacion_snacks.toppings_seleccionados && (
                            <div><span className="font-semibold">Toppings:</span> {c.personalizacion_snacks.toppings_seleccionados}</div>
                          )}
                          {!c.personalizacion_snacks.frutas_seleccionadas && !c.personalizacion_snacks.chips_seleccionados && !c.personalizacion_snacks.toppings_seleccionados && (
                            <div className="text-gray-400">Sin datos</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Sin personalización</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-500">{c.fecha_creacion}</td>
                    <td className="px-4 py-3 align-top text-center">
                      <div className="flex flex-col gap-2">
                        {c.estado === 'Pendiente' && (
                          <>
                            <button
                              onClick={() => updateQuoteStatus(c.id_cotizacion, 'Aceptada')}
                              disabled={updating === c.id_cotizacion}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === c.id_cotizacion ? '...' : 'Aceptar'}
                            </button>
                            <button
                              onClick={() => updateQuoteStatus(c.id_cotizacion, 'Rechazada')}
                              disabled={updating === c.id_cotizacion}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === c.id_cotizacion ? '...' : 'Rechazar'}
                            </button>
                          </>
                        )}
                        {c.estado === 'Aceptada' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                            ✓ Aceptada
                          </span>
                        )}
                        {c.estado === 'Rechazada' && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                            ✗ Rechazada
                          </span>
                        )}
                        <button
                          onClick={() => deleteQuote(c.id_cotizacion)}
                          disabled={updating === c.id_cotizacion}
                          className="px-3 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                          {updating === c.id_cotizacion ? '...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Barras personalizadas */}
        {(!loading && !error) && (data.some(c => c.personalizacion_snacks && (c.personalizacion_snacks.frutas_seleccionadas || c.personalizacion_snacks.chips_seleccionados || c.personalizacion_snacks.toppings_seleccionados))) && (
          <div className="mt-10 bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Barras de Snacks personalizadas</h2>
            <div className="space-y-6">
              {data.filter(c => c.personalizacion_snacks && (c.personalizacion_snacks.frutas_seleccionadas || c.personalizacion_snacks.chips_seleccionados || c.personalizacion_snacks.toppings_seleccionados)).map(c => (
                <div key={c.id_cotizacion} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-wrap justify-between gap-2 mb-3">
                    <div className="text-gray-700">
                      <span className="font-semibold">Cotización:</span> #{c.id_cotizacion}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-semibold">Cliente:</span> {c.nombre_completo || '-'} <span className="text-xs text-gray-500">({c.correo || ''})</span>
                    </div>
                    <div className="text-gray-700">
                      <span className="font-semibold">Fecha:</span> {c.fecha_evento}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-2">Frutas/Verduras</div>
                      <div className="flex flex-wrap gap-2">
                        {(c.personalizacion_snacks.frutas_seleccionadas || '').split(',').filter(Boolean).map((x, i) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">{x.trim()}</span>
                        ))}
                        {!c.personalizacion_snacks.frutas_seleccionadas && <span className="text-xs text-gray-400">Sin selección</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-2">Chips</div>
                      <div className="flex flex-wrap gap-2">
                        {(c.personalizacion_snacks.chips_seleccionados || '').split(',').filter(Boolean).map((x, i) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">{x.trim()}</span>
                        ))}
                        {!c.personalizacion_snacks.chips_seleccionados && <span className="text-xs text-gray-400">Sin selección</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-2">Toppings</div>
                      <div className="flex flex-wrap gap-2">
                        {(c.personalizacion_snacks.toppings_seleccionados || '').split(',').filter(Boolean).map((x, i) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">{x.trim()}</span>
                        ))}
                        {!c.personalizacion_snacks.toppings_seleccionados && <span className="text-xs text-gray-400">Sin selección</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paginación */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
            >
              Anterior
            </button>
            <div className="text-gray-600 text-sm">Página {page} de {totalPages}</div>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
