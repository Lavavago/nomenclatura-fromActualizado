import React from 'react';
import { COLORS } from '../constants';
const recurso6Url = new URL('../pages/Recurso-6.png', import.meta.url).href;
import { ArrowLeft } from 'lucide-react';

interface Props { onLogout?: () => void; showLogout?: boolean; onChangePassword?: () => void; showChangePassword?: boolean; onManageTeam?: () => void; showManageTeam?: boolean; isAdmin?: boolean }

const Header: React.FC<Props> = ({ onLogout, showLogout, onChangePassword, showChangePassword, onManageTeam, showManageTeam, isAdmin }) => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-7">
            <img src={recurso6Url} alt="GLE Colombia" className="h-10 w-auto opacity-90" />
            <div className="hidden sm:block h-6 w-px bg-gray-200"></div>
            <div className="flex flex-col">
                <h1 className="text-base sm:text-lg font-semibold leading-tight" style={{ color: '#000000' }}>
                    Nomenclatura GLE
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 tracking-wider uppercase">
                    Grupo Logístico Especializado
                </p>
            </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
             {showManageTeam && (
               <button onClick={onManageTeam} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-95 active:scale-95" style={{ backgroundColor: COLORS.primary }}>
                 Equipo
               </button>
             )}
             {showChangePassword && (
               <button onClick={onChangePassword} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-95 active:scale-95" style={{ backgroundColor: COLORS.primary }}>
                 Cambiar Contraseña
               </button>
             )}
             {showLogout && (
               <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-95 active:scale-95" style={{ backgroundColor: COLORS.primary }}>
                 <ArrowLeft className="w-4 h-4" />
                 Volver al Login
               </button>
             )}
             <div className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                v2.4
             </div>
        </div>
      </div>
      <div className="h-0.5 w-full" style={{ backgroundColor: COLORS.primary }}></div>
    </header>
  );
};

export default Header;
