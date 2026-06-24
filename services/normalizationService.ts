import { ADDRESS_MAPPING, CASE_FIXES, POI_MAP, CITIES_MAP } from '../constants';

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const normalizeTextBasic = (s: string): string => {
  if (!s) return "";
  
  let text = s.toString();
  
  // 1. Remove accents (tildes) - NFD Normalization (but keep ñ)
  text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 2. Normalize dashes
  text = text.replace(/–/g, '-').replace(/—/g, '-');
  
  // 3. Replace common punctuation (.,:;/) with space, but keep '#'
  text = text.replace(/[.,:;\\/"'()]/g, ' ');

  // 4. Remove multiple spaces and trim
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

export const applyTokenMapping = (address: any): string => {
  if (!address || String(address).trim().toLowerCase() === 'nan' || String(address).trim().toLowerCase() === 'none') {
    return "";
  }

  // Initial cleaning
  let text = " " + normalizeTextBasic(String(address)) + " ";
  let textLow = text.toLowerCase();

  const denoiseMap: Record<string, string> = {
    "av": "avenida",
    "cl": "calle",
    "cra": "carrera",
    "dg": "diagonal",
    "tv": "transversal",
    "calle": "calle",
    "carrera": "carrera",
    "avenida": "avenida"
  };
  textLow = textLow.replace(/\b([a-z])(?:\s+[a-z]){1,4}\b/g, (m) => {
    const joined = m.replace(/\s+/g, '');
    return denoiseMap[joined] || m;
  });

  const poiKeys = Object.keys(POI_MAP).sort((a, b) => b.length - a.length);
  for (const k of poiKeys) {
    const re = new RegExp(`(?<!\\w)${escapeRegExp(k)}(?!\\w)`, 'i');
    if (re.test(textLow.trim())) {
      return POI_MAP[k];
    }
  }

  const tens: Record<string, number> = {
    "diez": 10, "once": 11, "doce": 12, "trece": 13, "catorce": 14, "quince": 15,
    "dieciseis": 16, "diecisiete": 17, "dieciocho": 18, "diecinueve": 19,
    "veinte": 20, "treinta": 30, "cuarenta": 40, "cincuenta": 50, "sesenta": 60,
    "setenta": 70, "ochenta": 80, "noventa": 90
  };
  const units: Record<string, number> = {
    "cero":0, "uno":1, "una":1, "dos":2, "tres":3, "cuatro":4, "cinco":5, "seis":6,
    "siete":7, "ocho":8, "nueve":9
  };
  textLow = textLow.replace(/veinti\s*(uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)/g, (_m, u) => String(20 + (units[u]||0)));
  textLow = textLow.replace(/(treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)\s+y\s+(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)/g,
    (_m, t, u) => String((tens[t]||0) + (units[u]||0))
  );
  textLow = textLow.replace(/\b(diez|once|doce|trece|catorce|quince|dieciseis|diecisiete|dieciocho|diecinueve|veinte|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa|cero|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\b/g,
    m => String(tens[m] ?? units[m] ?? m)
  );
  textLow = textLow.replace(/(\b\d{1,2}\b)\s+(\b\d{1,2}\b)/g, (_m, a, b) => `${a}-${b}`);

  const keywords = [
    "calle","carrera","avenida","avenida calle","avenida carrera","diagonal","transversal","circular","autopista","via","vía","camino","variante","troncal",
    "sur","norte","este","oeste","bis"
  ];
  textLow = textLow.replace(/\b(?:[a-z])(?:\s+[a-z]){2,}\b/g, (m) => {
    const joined = m.replace(/\s+/g, '');
    if (keywords.includes(joined)) return joined;
    return m;
  });

  // --- STEP 1: KEYWORD REPLACEMENT (The Dictionary Attack) ---
  const sortedKeys = Object.keys(ADDRESS_MAPPING).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const std = ADDRESS_MAPPING[key];
    const normalizedKey = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,:;\\/]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Strict whole word matching to avoid partial replacements (e.g. replacing 'int' inside 'pintura')
    const pattern = new RegExp(`(?<!\\w)${escapeRegExp(normalizedKey)}(?!\\w)`, 'g');
    
    if (pattern.test(textLow)) {
       textLow = textLow.replace(pattern, std.toLowerCase());
    }
  }

  // --- STEP 2: SYMBOL STANDARDIZATION ---
  // Suffixes isolated: 10S -> 10 Sur, 10 S -> 10 Sur
  textLow = textLow.replace(/(?<=\d)(s|n|e)(?!\w)/g, (match) => {
      if (match === 's') return ' sur';
      if (match === 'n') return ' norte';
      if (match === 'e') return ' este';
      return match;
  });
  textLow = textLow.replace(/(?<!\w)(s|n|e)(?!\w)/g, (match) => {
      if (match === 's') return 'sur';
      if (match === 'n') return 'norte';
      if (match === 'e') return 'este';
      return match;
  });
  
  // Handle "No", "Nro", "Num" -> "#"
  textLow = textLow.replace(/\b(nro|no|n°|num|nº|numero|número)\b\.?/gi, '#');

  const mainVias = "avenida calle|avenida carrera|calle|carrera|diagonal|transversal|avenida|circular|autopista|vía|via|camino|variante|troncal";
  const reorderRegex = new RegExp(`^\s*(\d+[a-z]?(?:\s*-\s*\d+)?)\s*#\s*(${mainVias})\b\s*(\d+[a-z]?)(?:\s*-\s*(\d+))?`, 'i');
  const reorderMatch = textLow.match(reorderRegex);
  if (reorderMatch) {
    const vnum = reorderMatch[3];
    const vtype = reorderMatch[2];
    const p = reorderMatch[1];
    textLow = `${vtype} ${vnum} # ${p}`;
  }

  const reorderAnywhere = new RegExp(`(\d+[a-z]?(?:\s*-\s*\d+)?)\s*#\s*(${mainVias})\b\s*(\d+[a-z]?)`, 'i');
  const matchAny = textLow.match(reorderAnywhere);
  if (matchAny && !/^\s*(avenida calle|avenida carrera|calle|carrera|diagonal|transversal|avenida|circular|autopista|vía|via|camino|variante|troncal)/i.test(textLow)) {
    const p = matchAny[1];
    const vtype = matchAny[2];
    const vnum = matchAny[3];
    textLow = `${vtype} ${vnum} # ${p}`;
  }

  // --- STEP 3: ADVANCED STRUCTURAL REPAIR (Audit: Critical for 100% effectiveness) ---
  
  const mainVias2 = mainVias;
  
  // Check if we already have a hash or common housing types that might confuse the number logic
  if (!textLow.includes('#')) {
     // Regex explained:
     // 1. (Via Type - greedy match for 'avenida calle' first)
     // 2. (Number + optional letter + optional suffix 'sur/norte' etc)
     // 3. (Space)
     // 4. (Next Number)
     
     // Simple case: Via 10 20
     const simpleMissingHash = new RegExp(`(${mainVias2})\\s+([0-9]+[a-z]?)\\s+([0-9]+)`, 'i');
     
     // Suffix case: Via 10 Sur 20
     const suffixMissingHash = new RegExp(`(${mainVias2})\\s+([0-9]+[a-z]?\\s+(?:sur|norte|este|oeste))\\s+([0-9]+)`, 'i');

     if (suffixMissingHash.test(textLow)) {
         textLow = textLow.replace(suffixMissingHash, '$1 $2 # $3');
     } else if (simpleMissingHash.test(textLow)) {
         textLow = textLow.replace(simpleMissingHash, '$1 $2 # $3');
     }
  }

  // 3.2. Insert '-' if missing in the generating plate
  // Pattern: # 20 30 -> # 20-30
  // Pattern: # 20 30 -> # 20-30
  const missingDashRegex = /#\s*([0-9]+[a-z]?)\s+([0-9]+)(?!\w)/i;
  if (missingDashRegex.test(textLow)) {
     textLow = textLow.replace(missingDashRegex, '# $1-$2');
  }

  if (!textLow.includes('#')) {
    const threeNums = new RegExp(`(^.*?\b)(${mainVias2}|[a-záéíóúñ]+)?\s*(\d+[a-z]?)\s+(\d+[a-z]?)\s+(\d+)\b`, 'i');
    if (threeNums.test(textLow)) {
      textLow = textLow.replace(threeNums, (_m, pre, _via, n1, n2, n3) => `${pre.trim()} ${_via ? _via.trim() + ' ' : ''}# ${n1}-${n2}`);
    } else {
      const twoNums = new RegExp(`(^.*?\b)(\d+[a-z]?)\s+(\d+)\b`, 'i');
      if (twoNums.test(textLow)) {
        textLow = textLow.replace(twoNums, (_m, pre, n1, n2) => `${pre.trim()} # ${n1}-${n2}`);
      }
    }
  }

  // --- STEP 4: RECAPITALIZATION ---
  let tokens = textLow.split(/\s+/);
  tokens = tokens.map(t => {
      // Check exact match in CASE_FIXES
      if (CASE_FIXES[t.toLowerCase()]) return CASE_FIXES[t.toLowerCase()];
      
      // Keep Letter-Number combos uppercase: 26A, 11B
      if (/^\d+[a-z]+$/.test(t)) {
          return t.toUpperCase(); 
      }
      
      // Default: Title Case
      return t.charAt(0).toUpperCase() + t.slice(1);
  });
  text = tokens.join(" ");

  // --- STEP 5: FINAL CLEANUP & FORMATTING (Audit: Spacing details) ---

  // Ensure strict spacing around # : "Word # Word"
  text = text.replace(/\s*#\s*/g, ' # ');

  // Ensure compact spacing around - : "10-20"
  text = text.replace(/\s*-\s*/g, '-');

  // Fix space between Number and Suffix Direction: "10Sur" -> "10 Sur"
  text = text.replace(/(\d+)(Sur|Norte|Este|Oeste|Bis)/gi, '$1 $2');
  
  // Fix "Bis" spacing: "BisA" -> "Bis A"
  text = text.replace(/\b(Bis)([a-z])\b/gi, '$1 $2');
  
  // Ensure space after Bis if followed by number
  text = text.replace(/(Bis)(\d)/gi, '$1 $2');
  
  // Clean up double hashes if any logic added them (Safety check)
  text = text.replace(/#\s*#/g, '#');

  return text.trim();
};

export const normalizeAddressWithComplement = (address: any): { address: string, complement: string } => {
  if (!address) return { address: "", complement: "" };
  let raw = String(address);
  let complementParts: string[] = [];

  const parenRe = /\(([^)]*)\)/g;
  raw = raw.replace(parenRe, (_m, inside) => { complementParts.push(String(inside).trim()); return ' '; });

  const compKeywords = [
    'apartamento','apto','ap','apt','interior','int','manzana','mz','bloque','bl','torre','to','piso','local','oficina','bodega','casa','lote','unidad','entrada','sector'
  ];
  const compRe = new RegExp(`\\b(${compKeywords.join('|')})\\b\\s*[#-]?\\s*([a-z0-9]+)?`, 'gi');
  raw = raw.replace(compRe, (_m, k, v) => { const t = (k + (v ? ' ' + v : '')).trim(); complementParts.push(t); return ' '; });

  const normalized = applyTokenMapping(raw);
  return { address: normalized, complement: complementParts.filter(Boolean).join(', ') };
};

export const buildGoogleAddress = (addressNorm: string, city: string | null): string => {
  if (!addressNorm) return "";
  
  // RETURN ONLY THE NORMALIZED ADDRESS
  // No city, no country, no extras.
  return addressNorm;
};

export const normalizeCity = (city: string | null): string => {
  if (!city) return "";
  const s = normalizeTextBasic(city).toLowerCase();
  return CITIES_MAP[s] || city.toString();
};
