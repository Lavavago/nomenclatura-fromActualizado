export const COLORS = {
  primary: '#D32F2F', // Corporate Red (Strong, professional)
  secondary: '#424242', // Dark Gray
  accent: '#757575',  // Medium Gray
  white: '#FFFFFF',
  grayLight: '#F5F5F5',
  success: '#388E3C', // Green for stats
  warning: '#FBC02D', // Yellow for unchanged
};

// URL for GLE Logo (Using the same URL, UI handles error fallback)
export const LOGO_URL = "https://www.glecolombia.com/wp-content/uploads/2023/02/Logo-GLE-Mesa-de-trabajo-1.png";

// Comprehensive Mapping based on GLE Nomenclatura Matrix
// Expanded to include common directions, housing types, and urban terms
export const ADDRESS_MAPPING: Record<string, string> = {
  // --- VIAS PRINCIPALES (Priority 1) ---
  'avenida calle': 'Avenida Calle',
  'av calle': 'Avenida Calle',
  'av. calle': 'Avenida Calle',
  'av cl': 'Avenida Calle',
  'av. cl': 'Avenida Calle',
  'avcl': 'Avenida Calle',
  'ac': 'Avenida Calle',
  
  'avenida carrera': 'Avenida Carrera',
  'av carrera': 'Avenida Carrera',
  'av. carrera': 'Avenida Carrera',
  'av cr': 'Avenida Carrera',
  'av. cr': 'Avenida Carrera',
  'avcra': 'Avenida Carrera',
  'ak': 'Avenida Carrera',

  'calle': 'Calle',
  'cl': 'Calle',
  'cl.': 'Calle',
  'cll': 'Calle',
  'c/': 'Calle',
  'c.': 'Calle',
  'cal': 'Calle',
  
  'carrera': 'Carrera',
  'cra': 'Carrera',
  'cra.': 'Carrera',
  'cr': 'Carrera',
  'cr.': 'Carrera',
  'crra': 'Carrera',
  'k': 'Carrera',
  'kr': 'Carrera',
  'kra': 'Carrera',
  'krr': 'Carrera',

  'avenida': 'Avenida',
  'av': 'Avenida',
  'av.': 'Avenida',
  'avda': 'Avenida',
  'ave': 'Avenida',

  'diagonal': 'Diagonal',
  'diag': 'Diagonal',
  'dg': 'Diagonal',
  'dg.': 'Diagonal',

  'transversal': 'Transversal',
  'transv': 'Transversal',
  'trv': 'Transversal',
  'tv': 'Transversal',
  'tr': 'Transversal', // Context dependent, but usually Transversal in address header

  'autopista': 'Autopista',
  'autop': 'Autopista',
  'auto': 'Autopista',

  'circular': 'Circular',
  'circ': 'Circular',
  'cir': 'Circular',
  'cq': 'Circular',

  'troncal': 'Troncal',
  'carretera': 'Carretera',
  'crt': 'Carretera',
  'variante': 'Variante',
  'camino': 'Camino',
  'via': 'Vía',
  'vía': 'Vía',

  // --- SUFIJOS Y PUNTOS CARDINALES ---
  'sur': 'Sur',
  'norte': 'Norte',
  'este': 'Este',
  'oeste': 'Oeste',
  'oriente': 'Oriente',
  'occidente': 'Occidente',
  'bis': 'Bis',
  'par': 'Par',
  'impar': 'Impar',

  // --- COMPLEMENTOS DE VIVIENDA ---
  'apartamento': 'Apartamento',
  'apto': 'Apartamento',
  'ap': 'Apartamento',
  'apt': 'Apartamento',
  
  'interior': 'Interior',
  'int': 'Interior',
  'int.': 'Interior',
  'inte': 'Interior',
  
  'manzana': 'Manzana',
  'mz': 'Manzana',
  'mza': 'Manzana',
  'mnz': 'Manzana',
  
  'bloque': 'Bloque',
  'bl': 'Bloque',
  'bq': 'Bloque',
  'blq': 'Bloque',
  
  'casa': 'Casa',
  'cs': 'Casa',
  'ca': 'Casa',
  
  'lote': 'Lote',
  'lt': 'Lote',
  
  'piso': 'Piso',
  'planta': 'Planta',
  'nivel': 'Nivel',
  
  'torre': 'Torre',
  'to': 'Torre', 
  
  'urbanizacion': 'Urbanización',
  'urbanización': 'Urbanización',
  'urb': 'Urbanización',
  'urb.': 'Urbanización',
  
  'conjunto': 'Conjunto',
  'conj': 'Conjunto',
  'cnj': 'Conjunto',
  
  'residencial': 'Residencial',
  'res': 'Residencial',
  
  'etapa': 'Etapa',
  'et': 'Etapa',
  
  'barrio': 'Barrio',
  'br': 'Barrio',
  'brr': 'Barrio',
  'b/': 'Barrio',
  
  'kilometro': 'Kilómetro',
  'km': 'Kilómetro',
  'kms': 'Kilómetro',
  
  'vereda': 'Vereda',
  'vda': 'Vereda',
  
  'corregimiento': 'Corregimiento',
  'cgto': 'Corregimiento',
  
  'hacienda': 'Hacienda',
  'hda': 'Hacienda',
  
  'finca': 'Finca',
  'fca': 'Finca',
  
  'local': 'Local',
  'lc': 'Local',
  'loc': 'Local',
  
  'oficina': 'Oficina',
  'of': 'Oficina',
  'ofi': 'Oficina',
  
  'bodega': 'Bodega',
  'bg': 'Bodega',
  'bd': 'Bodega',
  
  'supermanzana': 'Supermanzana',
  'sm': 'Supermanzana',
  
  'agrupacion': 'Agrupación',
  'agrup': 'Agrupación',
  
  'unidad': 'Unidad',
  'unid': 'Unidad',
  'ud': 'Unidad',

  'entrada': 'Entrada',
  'ent': 'Entrada',
  
  'zona': 'Zona',
  'sector': 'Sector',
};

// Proper casing list to ensure clean output
export const CASE_FIXES: Record<string, string> = {
  "calle": "Calle",
  "carrera": "Carrera",
  "avenida": "Avenida",
  "diagonal": "Diagonal",
  "transversal": "Transversal",
  "autopista": "Autopista",
  "circular": "Circular",
  "troncal": "Troncal",
  "carretera": "Carretera",
  "variante": "Variante",
  "vía": "Vía",
  "camino": "Camino",
  "sur": "Sur",
  "norte": "Norte",
  "este": "Este",
  "oeste": "Oeste",
  "oriente": "Oriente",
  "occidente": "Occidente",
  "bis": "Bis",
  "apartamento": "Apartamento",
  "interior": "Interior",
  "manzana": "Manzana",
  "bloque": "Bloque",
  "casa": "Casa",
  "lote": "Lote",
  "piso": "Piso",
  "torre": "Torre",
  "urbanización": "Urbanización",
  "conjunto": "Conjunto",
  "residencial": "Residencial",
  "etapa": "Etapa",
  "barrio": "Barrio",
  "kilómetro": "Kilómetro",
  "vereda": "Vereda",
  "local": "Local",
  "oficina": "Oficina",
  "bodega": "Bodega",
  "hacienda": "Hacienda",
  "finca": "Finca",
  "sector": "Sector",
  "zona": "Zona",
  "entrada": "Entrada",
  "unidad": "Unidad",
  "agrupación": "Agrupación",
  "supermanzana": "Supermanzana"
};

export const POI_MAP: Record<string, string> = {
  "centro comercial andino": "Calle 82 # 11-71",
  "andino": "Calle 82 # 11-71",
  "unicentro bogota": "Avenida 15 # 124-30",
  "parque lleras": "Calle 10 # 37-13",
  "chipichape": "Avenida 6A # 35N-100"
};

export const CITIES_MAP: Record<string, string> = {
  "bog": "Bogotá",
  "bogota": "Bogotá",
  "bogotá": "Bogotá",
  "bogota d.c": "Bogotá",
  "bogotá d.c": "Bogotá",
  "bogotá dc": "Bogotá",
  "bogota dc": "Bogotá",
  "med": "Medellín",
  "medellin": "Medellín",
  "medellín": "Medellín",
  "medallo": "Medellín",
  "baq": "Barranquilla",
  "barranquilla": "Barranquilla",
  "cal": "Cali",
  "cali": "Cali",
  "cart": "Cartagena",
  "cartagena": "Cartagena"
};