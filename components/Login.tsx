import React, { useState } from 'react';
import { COLORS } from '../constants';
import { api } from '../services/apiClient';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
// @ts-ignore
import recurso6 from '../pages/Recurso-6.png';

interface Props {
  onLogin: (email: string, area: string) => void;
}

const areas = [
  { value: 'TI', label: 'TI' },
  { value: 'Contabilidad', label: 'Contabilidad' },
  { value: 'Facturación', label: 'Facturación' },
  { value: 'Operaciones', label: 'Operaciones' },
];

const Login: React.FC<Props> = ({ onLogin }) => {
  const [isChangingMode, setIsChangingMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados Formulario Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [area, setArea] = useState('TI');
  const [showPass, setShowPass] = useState(false);

  // Estados Formulario Cambio de Clave
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para los 3 ojitos del cambio
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cleanCorreo = email.trim().toLowerCase();
      await api.login(cleanCorreo, password, area);
      onLogin(cleanCorreo, area);
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas para esta área.');
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIÓN: CAMBIO DE CONTRASEÑA SEGURO ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const cleanCorreo = email.trim().toLowerCase();
      await api.changePassword(cleanCorreo, oldPassword, newPassword);

      alert("¡Contraseña actualizada con éxito!");
      setIsChangingMode(false);
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
        
        {error && (
          <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-2 italic">
            <span>⚠️ {error}</span>
          </div>
        )}

        {!isChangingMode ? (
          /* VISTA LOGIN */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-8">
              <img src={recurso6} alt="GLE" className="mx-auto h-12 w-auto opacity-90" />
              <p className="text-gray-500 text-sm mt-2">Ingresa tus credenciales de acceso</p>
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="email" placeholder="Correo corporativo" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type={showPass ? "text" : "password"} placeholder="Contraseña" required
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400 hover:text-red-600">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 py-2">
              {areas.map(a => (
                <button 
                  key={a.value} type="button"
                  onClick={() => setArea(a.value)}
                  className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${area === a.value ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95"
              style={{ backgroundColor: COLORS.primary, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'CARGANDO...' : 'INICIAR SESIÓN'}
            </button>

            <button type="button" onClick={() => { setIsChangingMode(true); setError(null); }} className="w-full text-xs text-gray-400 hover:text-red-600 hover:underline mt-4">
              Configuración de seguridad / Cambiar clave
            </button>
          </form>
        ) : (
          /* VISTA CAMBIO DE CLAVE */
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <button type="button" onClick={() => setIsChangingMode(false)} className="flex items-center gap-1 text-gray-400 hover:text-black text-sm mb-6 transition-colors">
              <ArrowLeft size={16} /> Volver al login
            </button>

            <h2 className="text-2xl font-bold text-gray-800">Nueva Contraseña</h2>
            <p className="text-xs text-gray-500 mb-6 font-medium">Confirma tu correo y contraseña actual para proceder.</p>

            <input 
              type="email" placeholder="E-mail vinculado" required
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-800 outline-none"
            />

            {/* ANTIGUA */}
            <div className="relative">
              <input 
                type={showOld ? "text" : "password"} placeholder="Contraseña Actual" required
                value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                className="w-full pr-12 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-400 outline-none"
              />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-3 text-gray-400">
                {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="h-px bg-gray-100 my-4" />

            {/* NUEVA */}
            <div className="relative">
              <input 
                type={showNew ? "text" : "password"} placeholder="Nueva Contraseña" required
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full pr-12 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3 text-gray-400">
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* VERIFICACIÓN */}
            <div className="relative">
              <input 
                type={showConfirm ? "text" : "password"} placeholder="Confirmar Nueva Contraseña" required
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pr-12 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-gray-400">
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-white bg-black hover:bg-gray-800 shadow-xl transition-all active:scale-95">
              {loading ? 'PROCESANDO...' : 'GUARDAR CAMBIOS'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
