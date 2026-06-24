import XLSX from 'xlsx-js-style';
import { AddressRow, NormalizedData } from '../types';
import { normalizeAddressWithComplement, buildGoogleAddress, normalizeCity } from './normalizationService';
import { COLORS } from '../constants';

export const processExcelFile = async (file: File, onProgress?: (current: number, total: number) => void): Promise<NormalizedData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Assume first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json<AddressRow>(sheet);
        
        if (jsonData.length === 0) {
            resolve([]);
            return;
        }

        const keys = Object.keys(jsonData[0]);
        const findKeyFlexible = (arr: string[], candidates: string[]) => {
            const lower = arr.map(k => k.toLowerCase());
            for (const cand of candidates) {
                const idx = lower.findIndex(k => k.includes(cand));
                if (idx >= 0) return arr[idx];
            }
            return undefined;
        };
        const addressKey = findKeyFlexible(keys, ['direcc', 'direccion', 'address', 'dir', 'ubicac', 'domicilio']);
        const cityKey = findKeyFlexible(keys, ['ciudad', 'city', 'municipio', 'localidad']);

        if (!addressKey) {
            reject(new Error("No se encontró una columna de 'Dirección' en el archivo."));
            return;
        }

        const total = jsonData.length;
        const processed: NormalizedData[] = jsonData.map((row, idx) => {
            const original = row[addressKey];
            const city = cityKey ? row[cityKey] : '';
            const cityStd = normalizeCity(String(city || ''));
            const raw = String(original || '');
            const cleaned = raw.replace(/[.]/g, ' ').replace(/\s+/g, ' ').trim();
            const { address: normalized, complement } = normalizeAddressWithComplement(cleaned);
            
            const fullGoogleAddress = buildGoogleAddress(normalized, city);
            
            // LOGIC FOR "REAL CHANGES"
            // We want to count it as changed if we improved:
            // 1. Terminology (Cl -> Calle)
            // 2. Structure (Added #, Removed No.)
            // 3. Formatting (Standardized spaces around # or -)
            // 4. Casing (calle -> Calle)
            
            const strOriginal = cleaned;
            const strNormalized = normalized.trim();
            
            // Compare string vs string directly. 
            // Since our normalization engine is deterministic and standardizes spacing,
            // any deviation from the input string is a valid "organization" improvement.
            // Example: "Calle 10#20" -> "Calle 10 # 20" (Change = True)
            const viaRegex = /(avenida calle|avenida carrera|calle|carrera|diagonal|transversal|avenida|circular|autopista|vía|via|camino|variante|troncal)/i;
            const hasVia = viaRegex.test(strNormalized);
            const hasNumbers = /\d+/.test(strNormalized);
            const isValidBase = hasVia && hasNumbers;
            const isChanged = isValidBase && strNormalized.length > 0;
            const status: 'OK' | 'Revisar' | 'Error' = strNormalized.length === 0 ? 'Error' : (isValidBase ? 'OK' : 'Revisar');

            const item: NormalizedData = {
                original: strOriginal,
                normalized: fullGoogleAddress,
                city: cityStd,
                isChanged: isChanged,
                originalRow: row,
                complement,
                status
            };

            if (onProgress) onProgress(idx + 1, total);
            return item;
        });

        resolve(processed);

      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const exportToExcel = (data: NormalizedData[], fileName: string) => {
    // Create export data structure
    const exportData = data.map(item => ({
        ...item.originalRow,
        'Direcciones Google': item.normalized,
        'Complemento': item.complement || '',
        'Estado': item.status === 'OK' ? 'Normalizado' : (item.status === 'Revisar' ? 'Revisar' : 'Error')
    }));

    // Create a new worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // --- STYLING (Corporate: Red, Gray, White) ---
    
    // Header Style: GLE Red Background, White Text
    const headerStyle = {
        fill: { fgColor: { rgb: "D32F2F" } }, // GLE Red
        font: { color: { rgb: "FFFFFF" }, bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
            top: { style: "thin", color: { rgb: "B71C1C" } },
            bottom: { style: "thin", color: { rgb: "B71C1C" } }
        }
    };

    // Changed Data: Light Gray/White (Clean)
    const okColStyle = { fill: { fgColor: { rgb: "E8F5E9" } }, font: { color: { rgb: "2E7D32" } } }; // Green

    // Unchanged Data: BRIGHT Yellow (Identification Strip)
    const reviewColStyle = { fill: { fgColor: { rgb: "FFFDE7" } }, font: { color: { rgb: "827717" } } }; // Yellow
    const errorColStyle = { fill: { fgColor: { rgb: "FFEBEE" } }, font: { color: { rgb: "C62828" } } }; // Red

    // Apply styles
    const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:A1");
    
    const keys = Object.keys(exportData[0] || {});
    const googleColIndex = keys.indexOf('Direcciones Google');
    const statusColIndex = keys.indexOf('Estado');
    const complementColIndex = keys.indexOf('Complemento');

    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            if (!worksheet[cellRef]) continue;

            // Header Row
            if (R === 0) {
                worksheet[cellRef].s = headerStyle;
            } 
            // Content Rows
            else {
                // Formatting specific columns
                if (C === googleColIndex || C === statusColIndex || C === complementColIndex) {
                    const rowData = exportData[R - 1];
                    const estado = rowData && rowData['Estado'];
                    worksheet[cellRef].s = estado === 'Normalizado' ? okColStyle : (estado === 'Revisar' ? reviewColStyle : errorColStyle);
                }
            }
        }
    }

    // Adjust Column Widths
    const colWidths = keys.map(key => ({
        wch: Math.max(key.length + 5, 15)
    }));
    if (googleColIndex >= 0) colWidths[googleColIndex] = { wch: 50 };
    if (complementColIndex >= 0) colWidths[complementColIndex] = { wch: 20 };
    if (statusColIndex >= 0) colWidths[statusColIndex] = { wch: 15 };

    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nomenclatura GLE");
    
    XLSX.writeFile(workbook, fileName);
};

export const exportErrorsToExcel = (data: NormalizedData[], fileName: string) => {
    const failed = data.filter(d => d.status === 'Error');
    if (failed.length === 0) return;
    const exportData = failed.map(item => ({
        ...item.originalRow,
        'Direcciones Google': item.normalized,
        'Complemento': item.complement || '',
        'Estado': 'Error'
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Errores');
    XLSX.writeFile(workbook, fileName);
};