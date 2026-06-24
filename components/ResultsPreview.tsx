import React from 'react';
import { NormalizedData } from '../types';
import { COLORS } from '../constants';
import { ArrowRight, CheckCircle2, Download, AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  data: NormalizedData[];
  onDownload: () => void;
  onDownloadErrors?: () => void;
  onReset: () => void;
}

const ResultsPreview: React.FC<Props> = ({ data, onDownload, onReset, onDownloadErrors }) => {
  // Show only first 50 rows for performance in preview
  const previewData = data.slice(0, 50);
  const errorCount = data.filter(d => d.status === 'Error').length;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: COLORS.primary }}>
                    <CheckCircle2 className="w-5 h-5" style={{ color: COLORS.success }} />
                    Vista Previa de Resultados
                </h2>
                <p className="text-sm text-gray-500">Mostrando los primeros 50 registros</p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all active:scale-95"
                >
                    <RotateCcw className="w-4 h-4" />
                    Nueva Consulta
                </button>
                {onDownloadErrors && errorCount > 0 && (
                  <button
                    onClick={onDownloadErrors}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white shadow-md hover:shadow-lg transition-all active:scale-95 bg-red-600"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Errores ({errorCount})
                  </button>
                )}
                <button
                    onClick={onDownload}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    <Download className="w-4 h-4" />
                    Descargar Excel
                </button>
            </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                        <th className="p-4 font-semibold border-b">Dirección Original</th>
                        <th className="p-4 font-semibold border-b w-8"></th>
                        <th className="p-4 font-semibold border-b" style={{ color: COLORS.primary }}>Dirección Google (GLE)</th>
                        <th className="p-4 font-semibold border-b">Ciudad</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {previewData.map((row, idx) => (
                        <tr key={idx} className={`border-b border-gray-50 transition-colors ${row.status==='OK'?'bg-green-50': row.status==='Revisar'?'bg-yellow-50':'bg-red-50'}`}>
                            <td className="p-4 text-gray-600 font-mono">{row.original}</td>
                            <td className="p-4 text-center">
                                <ArrowRight className="w-4 h-4 text-gray-300" />
                            </td>
                            <td className={`p-4 font-medium font-mono`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-900">{row.normalized}</span>
                                    {row.status === 'OK' && (
                                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">OK</span>
                                    )}
                                    {row.status === 'Revisar' && (
                                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" /> Revisar</span>
                                    )}
                                    {row.status === 'Error' && (
                                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Error</span>
                                    )}
                                </div>
                            </td>
                            <td className="p-4 text-gray-500">{row.city}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
            Descarga el archivo para ver todos los {data.length.toLocaleString()} registros.
        </div>
    </div>
  );
};

export default ResultsPreview;
