import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { COLORS } from '../constants';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  progress?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing, progress = 0 }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div 
      className={`relative w-full rounded-2xl border transition-all duration-300 ease-in-out shadow-sm
        ${isDragging ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {isProcessing ? (
           <div className="flex flex-col items-center animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: COLORS.primary }} />
                <p className="text-lg font-medium text-gray-700">Procesando archivo...</p>
                <p className="text-sm text-gray-500 mt-2">Normalizando direcciones con motor GLE</p>
                <div className="w-full max-w-sm mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full" style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: COLORS.primary }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
                </div>
           </div>
        ) : (
            <>
                <div className="p-4 rounded-full bg-red-50 mb-4">
                    <FileSpreadsheet className="w-10 h-10" style={{ color: COLORS.primary }} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1" style={{ letterSpacing: '-0.01em' }}>
                    Subir Reporteador
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                    Arrastra y suelta tu archivo Excel (.xlsx) aquí, o haz clic para seleccionar.
                    El archivo debe contener una columna llamada <strong>"Dirección"</strong>.
                </p>
                <label className="cursor-pointer">
                    <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        className="hidden" 
                        onChange={handleFileInput}
                    />
                    <span 
                        className="px-6 py-3 rounded-lg font-medium text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        Seleccionar Archivo
                    </span>
                </label>
            </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;