import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import FileUpload from './components/FileUpload';
import StatsCards from './components/StatsCards';
import ResultsPreview from './components/ResultsPreview';
import { processExcelFile, exportToExcel } from './services/excelService';
import { NormalizedData } from './types';
import { COLORS } from './constants';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from './services/apiClient';
// @ts-ignore
import recurso6 from './pages/Recurso-6.png';
// @ts-ignore
import heroImage from './pages/Recurso 5.png';


const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOutSplash, setFadeOutSplash] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userArea, setUserArea] = useState<string>('');
  const [data, setData] = useState<NormalizedData[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [team, setTeam] = useState<Array<{id: string; correo: string; area: string}>>([]);
  const [formId, setFormId] = useState<string | null>(null);
  const [formCorreo, setFormCorreo] = useState('');
  const [formArea, setFormArea] = useState<'TI' | 'Contabilidad' | 'Facturación' | 'Operaciones'>('TI');
  const [formPassword, setFormPassword] = useState('');
  const isAdmin = userEmail?.toLowerCase() === 'admin@empresa.com';

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOutSplash(true), 2200);
    const t2 = setTimeout(() => { setShowSplash(false); setShowLogin(true); }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleLogin = (email: string, area: string) => {
    setUserEmail(email);
    setUserArea(area);
    setShowLogin(false);
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setData(null);
    setFileName(file.name);
    setProgress(0);

    try {
      // Small delay to allow UI to update to "processing" state
      setTimeout(async () => {
        try {
            const result = await processExcelFile(file, (cur, tot) => setProgress((cur / tot) * 100));
            setData(result);
        } catch (err: any) {
            setError(err.message || "Error al procesar el archivo.");
        } finally {
            setIsProcessing(false);
            setProgress(100);
        }
      }, 500);
    } catch (err) {
      setError("Error inesperado.");
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!data) return;
    const newName = fileName.replace('.xlsx', '_NomenclaturaGLE.xlsx');
    exportToExcel(data, newName);
  };

  const handleReset = () => {
    setData(null);
    setFileName("");
    setError(null);
  };

  const loadTeam = async () => {
    setTeamLoading(true);
    setTeamError(null);
    try {
      const rows = await api.listPerfiles();
      setTeam(rows);
    } catch (e) {
      setTeamError('No se pudo cargar el equipo.');
    } finally {
      setTeamLoading(false);
    }
  };

  const openTeam = async () => {
    setShowTeam(true);
    await loadTeam();
  };

  useEffect(() => {
    if (showTeam) loadTeam();
  }, [showTeam]);

  const resetForm = () => {
    setFormId(null);
    setFormCorreo('');
    setFormArea('TI');
    setFormPassword('');
    setTeamError(null);
  };

  const ADMIN_EMAIL = 'admin@empresa.com';
  const startEdit = (u: any) => {
    if (u.correo?.toLowerCase() === ADMIN_EMAIL) {
      setTeamError('No se puede editar al Administrador General.');
      return;
    }
    setFormId(u.id);
    setFormCorreo(u.correo || '');
    setFormArea(u.area);
    setFormPassword('');
  };

  const saveUser = async () => {
    setTeamError(null);
    if (!formCorreo || !formArea) { setTeamError('Completa correo y área.'); return; }
    try {
      if (formId == null) {
        if (!formPassword) { setTeamError('La contraseña es obligatoria.'); return; }
        await api.createPerfil(formCorreo.trim().toLowerCase(), formPassword, formArea);
      } else {
        const current = team.find(t => t.id === formId);
        if (current && current.correo?.toLowerCase() === ADMIN_EMAIL) {
          setTeamError('No se puede editar al Administrador General.');
          return;
        }
        const payload: { correo?: string; password?: string; area?: string } = {
          correo: formCorreo.trim().toLowerCase(),
          area: formArea,
        };
        if (formPassword) payload.password = formPassword;
        await api.updatePerfil(formId, payload);
      }
      await loadTeam();
      resetForm();
    } catch (e) {
      setTeamError('No se pudo guardar el usuario.');
    }
  };

  const removeUser = async (id: string, correo?: string) => {
    setTeamError(null);
    try {
      if (typeof window !== 'undefined') {
        const ok = window.confirm('¿Eliminar este usuario? Esta acción es irreversible.');
        if (!ok) return;
      }
      const targetCorreo = correo ?? team.find(t => t.id === id)?.correo;
      if (targetCorreo && targetCorreo.toLowerCase() === ADMIN_EMAIL) {
        setTeamError('No se puede eliminar al Administrador General.');
        return;
      }
      await api.deletePerfil(id);
      await loadTeam();
      if (formId === id) resetForm();
    } catch (e) {
      setTeamError('No se pudo eliminar el usuario.');
    }
  };

  const stats = useMemo(() => {
    if (!data) return { total: 0, changed: 0, percentage: 0 };
    const total = data.length;
    const changed = data.filter(d => d.isChanged).length;
    return {
        total,
        changed,
        percentage: total > 0 ? (changed / total) * 100 : 0
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      {showSplash && (
        <div className={`splash-container ${fadeOutSplash ? 'fade-out' : ''}`}>
          <div className="splash-content">
            <div className="logo-wrapper logo-pulse">
              <img src={recurso6} alt="Imagen GLE" className="splash-hero mx-auto" />
            </div>
            <div className="splash-subtitle">Grupo Logístico Especializado</div>
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        </div>
      )}
      {!showSplash && !showLogin && (
        <Header 
          showLogout 
          onLogout={() => { setShowLogin(true); setUserEmail(''); setUserArea(''); setData(null); setError(null); setFileName(''); }} 
          showChangePassword 
          onChangePassword={() => setShowChangePwd(true)}
          showManageTeam={isAdmin}
          onManageTeam={openTeam}
          isAdmin={isAdmin}
        />
      )}

      {showLogin && (
        <Login onLogin={handleLogin} />
      )}

      {!showSplash && !showLogin && (
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {showChangePwd && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-1" style={{ color: COLORS.primary }}>Cambiar Contraseña</h3>
              <p className="text-sm text-gray-600 mb-4">Actualiza tu contraseña de acceso.</p>
              {pwdError && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{pwdError}</div>}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
                  <div className="relative">
                    <input type={showOldPwd ? 'text' : 'password'} value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none pr-10" />
                    <button type="button" onClick={() => setShowOldPwd((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600">
                      {showOldPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                  <div className="relative">
                    <input type={showNewPwd ? 'text' : 'password'} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none pr-10" />
                    <button type="button" onClick={() => setShowNewPwd((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600">
                      {showNewPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                  <div className="relative">
                    <input type={showConfirmPwd ? 'text' : 'password'} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none pr-10" />
                    <button type="button" onClick={() => setShowConfirmPwd((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600">
                      {showConfirmPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-end gap-3">
                <button onClick={() => { setShowChangePwd(false); setOldPwd(''); setNewPwd(''); setConfirmPwd(''); setPwdError(null); }} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-50 text-gray-700 border border-gray-200">Cancelar</button>
                <button onClick={async () => {
                  setPwdError(null);
                  if (!oldPwd || !newPwd || !confirmPwd) { setPwdError('Completa todos los campos.'); return; }
                  if (newPwd !== confirmPwd) { setPwdError('Las contraseñas no coinciden.'); return; }
                  if (!userEmail) { setPwdError('Sesión inválida.'); return; }
                  setPwdSaving(true);
                  try {
                    await api.changePassword(userEmail, oldPwd, newPwd);
                    setShowChangePwd(false); setOldPwd(''); setNewPwd(''); setConfirmPwd('');
                  } catch (err: any) {
                    setPwdError(err.message || 'No se pudo actualizar la contraseña.');
                  } finally {
                    setPwdSaving(false);
                  }
                }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: COLORS.primary, opacity: pwdSaving ? 0.8 : 1 }} disabled={pwdSaving}>Guardar</button>
              </div>
            </div>
          </div>
        )}
        {showTeam && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: COLORS.primary }}>Equipo</h3>
                <button onClick={() => { setShowTeam(false); resetForm(); }} className="text-sm text-gray-600 hover:text-black">Cerrar</button>
              </div>
              {teamError && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{teamError}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600">{teamLoading ? 'Cargando...' : `Usuarios: ${team.length}`}</div>
                    <button onClick={loadTeam} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: COLORS.primary }}>Actualizar</button>
                  </div>
                  <div className="border rounded-lg divide-y max-h-80 overflow-auto">
                    {team.map(u => {
                      const isRowAdmin = u.correo?.toLowerCase() === ADMIN_EMAIL;
                      return (
                      <div key={u.id} className="p-3 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate" title={u.correo}>{u.correo}</div>
                          <div className="text-xs text-gray-600">{u.area}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => startEdit(u)} disabled={isRowAdmin} className={`px-2 py-1 rounded-md text-xs font-semibold border ${isRowAdmin ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>Editar</button>
                          <button onClick={() => removeUser(u.id, u.correo)} disabled={isRowAdmin} className={`px-2 py-1 rounded-md text-xs font-semibold border ${isRowAdmin ? 'bg-red-50/50 text-red-300 border-red-100 cursor-not-allowed' : 'bg-red-50 text-red-700 border-red-200'}`}>Eliminar</button>
                        </div>
                      </div>
                    )})}
                    {team.length === 0 && !teamLoading && (
                      <div className="p-4 text-sm text-gray-500">Sin usuarios registrados.</div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">{formId == null ? 'Crear usuario' : 'Editar usuario'}</div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Correo</label>
                      <input value={formCorreo} onChange={e => setFormCorreo(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Área</label>
                      <select value={formArea} onChange={e => setFormArea(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none">
                        <option value="TI">TI</option>
                        <option value="Contabilidad">Contabilidad</option>
                        <option value="Facturación">Facturación</option>
                        <option value="Operaciones">Operaciones</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">{formId == null ? 'Contraseña' : 'Nueva contraseña (opcional)'}</label>
                      <input type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button onClick={resetForm} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-50 text-gray-700 border border-gray-200">Limpiar</button>
                    <button onClick={saveUser} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: COLORS.primary }}>Guardar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Intro */}
        {!data && !isProcessing && (
            <div className="mb-10 animate-fade-in">
                <div 
                  className="relative overflow-hidden rounded-2xl border border-gray-200"
                  style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="absolute inset-0 bg-white/85"></div>
                  <div className="relative p-8 sm:p-12 flex flex-col md:flex-row md:items-center gap-8">
                    <div className="flex-1">
                      <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: COLORS.primary }}>
                        Estandarización de Direcciones
                      </h2>
                      <p className="text-gray-600 text-lg max-w-2xl">
                        Convierte direcciones informales al formato corporativo compatible con 
                        <span className="font-semibold" style={{ color: COLORS.primary }}> Google Maps</span>.
                      </p>
                      {userArea && (
                        <div className="mt-4 text-sm font-semibold text-gray-800">
                          Acceso validado · Área: {userArea} · {userEmail}
                        </div>
                      )}
                    </div>
                    <img src={recurso6} alt="Marca GLE" className="h-16 md:h-20 w-auto opacity-90" />
                  </div>
                </div>
            </div>
        )}

        {/* Upload Section - Hidden when data is present to enforce New Query flow */}
        {!data && (
            <div className="mb-8 animate-fade-in">
                <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} progress={progress} />
            </div>
        )}

        {/* Error Message */}
        {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                <div>
                    <h3 className="text-red-800 font-medium">Error al procesar el archivo</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                    <p className="text-red-600 text-xs mt-2">Asegúrate que el archivo Excel tenga una columna llamada "Dirección".</p>
                </div>
            </div>
        )}

        {/* Results Section */}
        {data && (
            <div className="animate-fade-in">
                <StatsCards stats={stats} />
                <ResultsPreview 
                  data={data} 
                  onDownload={handleDownload} 
                  onDownloadErrors={() => {
                    if (!data) return;
                    const newName = fileName.replace('.xlsx', '_Errores.xlsx');
                    // lazy import to avoid circular
                    import('./services/excelService').then(m => m.exportErrorsToExcel(data, newName));
                  }}
                  onReset={handleReset} 
                />
            </div>
        )}
      </main>
      )}

      {!showSplash && !showLogin && (
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={recurso6} alt="Marca GLE" className="h-8 sm:h-10 w-auto opacity-90" />
              <div className="hidden sm:block h-6 w-px bg-gray-200"></div>
              <div className="text-sm text-gray-600">contacto@glecolombia.com</div>
            </div>
            <div className="flex items-center gap-2">
              <a href="tel:+573102695133" className="px-3 py-1 rounded-lg text-sm font-semibold bg-gray-50 text-gray-700 border border-gray-200">+57 3102695133</a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Bogotá</div>
              <div className="text-gray-600">+601 6953631</div>
              <div className="text-gray-600">Av. Carrera 70 No. 48 - 45</div>
              <div className="text-gray-500">Barrio Normandía</div>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Medellín</div>
              <div className="text-gray-600">+604 4795831</div>
              <div className="text-gray-600">Cra 43 No. 43° - 99 / Of. 1305</div>
              <div className="text-gray-500">El Poblado</div>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Barranquilla</div>
              <div className="text-gray-600">+57 3186159753</div>
              <div className="text-gray-600">Cra 55 # 100 - 51 Oficina 709</div>
              <div className="text-gray-500">Bluegardens</div>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Cali</div>
              <div className="text-gray-600">+57 3180185734</div>
              <div className="text-gray-600">Av. 6A Bis # 35N - 100</div>
              <div className="text-gray-500">Chipichape, Of. 615</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            <span>Protección de datos personales</span>
            <span>Términos y condiciones de servicio</span>
            <span>Política de calidad</span>
            <span>Proceso PQR’s e Indemnizaciones</span>
          </div>

          <div className="text-xs text-gray-400 text-center border-t border-gray-200 pt-4">
            &copy; {new Date().getFullYear()} Grupo Logístico Especializado (GLE). Todos los derechos reservados.
          </div>
        </div>
      </footer>
      )}
    </div>
  );
};

export default App;
