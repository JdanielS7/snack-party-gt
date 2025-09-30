import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Error al enviar mensaje');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err?.message || 'Error al enviar mensaje');
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
            <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Mensaje Enviado!</h2>
            <p className="text-gray-600 text-lg mb-6">
              Gracias {formData.name}. Tu mensaje ha sido enviado correctamente.
            </p>
            <p className="text-gray-500 mb-6">
              Te contactaremos pronto para responder a tu consulta.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Enviar Otro Mensaje
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-container">
      <section className="max-w-4xl mx-auto py-10 px-6">
      <div className="text-center mb-12 bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
          Contacto
        </h2>
        <p className="text-gray-700 text-lg font-medium">¡Contáctanos y síguenos en nuestras redes sociales!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Formulario de contacto */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Envíanos un mensaje</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                {error}
              </div>
            )}
            <div>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                placeholder="Nombre completo" 
              />
            </div>
            <div>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors" 
                placeholder="Correo electrónico" 
              />
            </div>
            <div>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                required 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-yellow-400 focus:outline-none transition-colors resize-none" 
                placeholder="Tu mensaje..." 
                rows={5}
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        </div>

        {/* Redes sociales */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Contactanos en redes sociales</h3>
          <div className="space-y-6">
            {/* WhatsApp */}
            <a 
              href="https://api.whatsapp.com/send?phone=%2B50254186668&context=Aff3_eK9A4N6HBwlh6dGZNCWwovn6ETbvIOq1AOnYHsTh9_Yjm9wSIlF3evGUcGXC_k64Mmtcwuqv680ywplWscdn5rV1M0r9MjhQLlS8YCGjH1eZoRoRT28ZzQegC9jG1oh6u9jiszTSJCmjbzUtFfqEQ&source=FB_Page&app=facebook&entry_point=page_cta&fbclid=IwY2xjawMscq5leHRuA2FlbQIxMABicmlkETFYZDkzMjgwN0RBd1hheVVqAR7O0Fk_EksaQv-hB-TRB31aC1f-PjmE958xa_Vtor6nZph89nUt8m05feUZlQ_aem_aL_qHJgK8goEeGXiUNzzCw" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center space-x-4 p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">WhatsApp</p>
                <p className="text-green-100">+502 5418-6668</p>
              </div>
            </a>

            {/* Facebook */}
            <a 
              href="https://www.facebook.com/profile.php?id=100092453506012" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center space-x-4 p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">Facebook</p>
                <p className="text-blue-100">@SnackPartyGT</p>
              </div>
            </a>

            {/* Instagram */}
            <a 
              href="https://www.instagram.com/snack.partygt/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281H7.721c-.49 0-.89.4-.89.89v7.83c0 .49.4.89.89.89h8.558c.49 0 .89-.4.89-.89v-7.83c0-.49-.4-.89-.89-.89zM8.449 9.281c-.49 0-.89.4-.89.89s.4.89.89.89.89-.4.89-.89-.4-.89-.89-.89zm7.83 6.447H8.449v-4.447h7.83v4.447z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">Instagram</p>
                <p className="text-pink-100">@snack.partygt</p>
              </div>
            </a>
          </div>
        </div>
      </div>
      </section>
    </div>
  );
}