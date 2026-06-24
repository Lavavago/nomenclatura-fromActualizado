import React from 'react';
import { Database, Zap, AlertTriangle } from 'lucide-react';
import { ProcessingStats } from '../types';
import { COLORS } from '../constants';

interface Props {
    stats: ProcessingStats;
}

const StatsCards: React.FC<Props> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center border-l-4" style={{ borderLeftColor: COLORS.secondary }}>
                <div className="p-3 rounded-full bg-gray-100 mr-4">
                    <Database className="w-6 h-6" style={{ color: COLORS.secondary }} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Registros</p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                        {stats.total.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center border-l-4" style={{ borderLeftColor: COLORS.primary }}>
                <div className="p-3 rounded-full bg-red-50 mr-4">
                    <Zap className="w-6 h-6" style={{ color: COLORS.primary }} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Normalizados</p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                        {stats.changed.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center border-l-4" style={{ borderLeftColor: COLORS.success }}>
                <div className="p-3 rounded-full bg-green-50 mr-4">
                    <Zap className="w-6 h-6" style={{ color: COLORS.success }} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Efectividad</p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.success }}>
                        {stats.percentage.toFixed(1)}%
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StatsCards;