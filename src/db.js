import Dexie from 'dexie'

export const db = new Dexie('surtimax')

db.version(1).stores({
  settings: 'key',
  categories: '++id, name',
  products: '++id, name, categoryId, barcode, [categoryId+name]',
  sales: '++id, date, method',
  saleItems: '++id, saleId, productId',
  expenses: '++id, date, category'
})

db.version(2).stores({
  settings: 'key',
  categories: '++id, name',
  products: '++id, name, categoryId, barcode, [categoryId+name]',
  sales: '++id, date, method',
  saleItems: '++id, saleId, productId',
  expenses: '++id, date, category',
  registers: '++id, status, openDate, closeDate'
})

export const INITIAL_CATALOG = [
  { name: 'BANANITAS', category: 'Galletas', price: 2, stock: 29 },
  { name: 'PIPOCA PEQUEÑA FRESA', category: 'Pipocas', price: 2.5, stock: 9 },
  { name: 'PIPOCA FRESA GRANDE', category: 'Pipocas', price: 16, stock: 6 },
  { name: 'CHISITO PEQUEÑO', category: 'Pipocas', price: 2, stock: 61 },
  { name: 'CHISITO FAMILIAR', category: 'Pipocas', price: 18, stock: 5 },
  { name: 'PIPOCA CHOCOLATE PEQUEÑO', category: 'Pipocas', price: 2.5, stock: 4 },
  { name: 'PIPOCA FAMILIAR CHOCOLATE', category: 'Pipocas', price: 24, stock: 2 },
  { name: 'PIPOCA AZUL PEQUEÑA', category: 'Pipocas', price: 2, stock: 16 },
  { name: 'AZUL PIPOCA FAMILIAR', category: 'Pipocas', price: 18, stock: 5 },
  { name: 'LA CALECITA ALFAJOR', category: 'Galletas', price: 4, stock: 24 },
  { name: 'LA CALECITA GALLETA PEQUEÑA', category: 'Galletas', price: 1.5, stock: 48 },
  { name: 'OREO TUBO', category: 'Galletas', price: 10, stock: 7 },
  { name: 'OREO', category: 'Galletas', price: 4, stock: 5 },
  { name: 'GENIO', category: 'Galletas', price: 4, stock: 3 },
  { name: 'KILOMBO', category: 'Galletas', price: 3, stock: 6 },
  { name: 'WAFER 40gr. PEQUEÑO', category: 'Galletas', price: 3.5, stock: 31 },
  { name: 'WAFER 100gr.', category: 'Galletas', price: 6, stock: 48 },
  { name: 'FRAC', category: 'Galletas', price: 4, stock: 16 },
  { name: 'CHIP AJOY', category: 'Galletas', price: 5, stock: 3 },
  { name: 'SOCIAL CLUB', category: 'Galletas', price: 4, stock: 28 },
  { name: 'SODA CHOCO', category: 'Galletas', price: 5, stock: 9 },
  { name: 'RITZ', category: 'Galletas', price: 5, stock: 16 },
  { name: 'CREMOSITA', category: 'Galletas', price: 3, stock: 29 },
  { name: 'DORADITAS', category: 'Galletas', price: 5, stock: 1 },
  { name: 'MARIA', category: 'Galletas', price: 5, stock: 39 },
  { name: 'TITA 110 gr.', category: 'Galletas', price: 5, stock: 8 },
  { name: 'TITA 120 gr.', category: 'Galletas', price: 1.5, stock: 45 },
  { name: 'TITA 22 gr.', category: 'Galletas', price: 1, stock: 16 },
  { name: 'ARTESANA 180 gr.', category: 'Galletas', price: 6, stock: 12 },
  { name: 'ARTESANA 32 gr.', category: 'Galletas', price: 1.5, stock: 40 },
  { name: 'GALLETA 300gr. CAMAÑO', category: 'Galletas', price: 8, stock: 5 },
  { name: 'OPERA 55 gr.', category: 'Galletas', price: 5, stock: 7 },
  { name: 'MAICITAS', category: 'Galletas', price: 13, stock: 38 },
  { name: 'TURRON', category: 'Galletas', price: 3, stock: 44 },
  { name: 'GOLPE', category: 'Galletas', price: 3, stock: 32 },
  { name: 'VIZIO', category: 'Galletas', price: 7.5, stock: 3 },
  { name: 'GOLAZO', category: 'Galletas', price: 2, stock: 23 },
  { name: 'CHIRLITO', category: 'Galletas', price: 2, stock: 19 },
  { name: 'QUINUA (PALITO DE TARWI)', category: 'Galletas', price: 2, stock: 20 },
  { name: 'OSITO MOGUL', category: 'Golosinas', price: 5, stock: 11 },
  { name: 'GUSANITO FINI', category: 'Golosinas', price: 8, stock: 13 },
  { name: 'AMBERRIES', category: 'Golosinas', price: 8, stock: 8 },
  { name: 'MORAS FINI', category: 'Golosinas', price: 8, stock: 6 },
  { name: 'DENTADURA FINI', category: 'Golosinas', price: 8, stock: 3 },
  { name: 'TORCIDO FINI', category: 'Golosinas', price: 8, stock: 6 },
  { name: 'MASHMELO FINI', category: 'Golosinas', price: 8, stock: 6 },
  { name: 'EVOLUTION GROSSO', category: 'Golosinas', price: 5, stock: 21 },
  { name: 'TRUCOLO', category: 'Golosinas', price: 3, stock: 17 },
  { name: 'CHICLE LARGO', category: 'Golosinas', price: 2, stock: 82 },
  { name: 'POOSH', category: 'Golosinas', price: 1, stock: 19 },
  { name: 'GOMITA MASHMELO', category: 'Golosinas', price: 1.5, stock: 32 },
  { name: 'BURBUJA', category: 'Golosinas', price: 6, stock: 17 },
  { name: 'FRASCO DE OJOS', category: 'Golosinas', price: 1, stock: 1 },
  { name: 'FRASCO DE FRESAS', category: 'Golosinas', price: 1, stock: 1 },
  { name: 'FRASCO DE GELATINAS', category: 'Golosinas', price: 1, stock: 1 },
  { name: 'FRASCO SPIDERMAN', category: 'Golosinas', price: 1, stock: 1 },
  { name: 'FRASCO DE MONEDAS DE CHOCOLATE', category: 'Golosinas', price: 1, stock: 1 },
  { name: 'FRASCO DE HUEVO DE CHOCOLATE', category: 'Golosinas', price: 1, stock: 1 },
  { name: 'BON O BON', category: 'Golosinas', price: 2.5, stock: 17 },
  { name: 'SAPITO', category: 'Golosinas', price: 2, stock: 15 },
  { name: 'CHUBI', category: 'Golosinas', price: 3, stock: 8 },
  { name: 'BATON', category: 'Golosinas', price: 3.5, stock: 16 },
  { name: 'MOMENTO', category: 'Golosinas', price: 3, stock: 1 },
  { name: 'BLOCK CHOCOLATE', category: 'Golosinas', price: 7, stock: 10 },
  { name: 'MECANO', category: 'Golosinas', price: 2.5, stock: 26 },
  { name: 'FONDANTE', category: 'Golosinas', price: 1, stock: 5 },
  { name: 'NUCITA', category: 'Golosinas', price: 1.5, stock: 67 },
  { name: 'POWERADE 990 ml', category: 'Bebidas', price: 14, stock: 3 },
  { name: 'POWERADE 473 ml', category: 'Bebidas', price: 7, stock: 11 },
  { name: 'MALTA', category: 'Bebidas', price: 7, stock: 15 },
  { name: 'MALTIN', category: 'Bebidas', price: 10, stock: 7 },
  { name: 'ROCK STAR', category: 'Bebidas', price: 6, stock: 5 },
  { name: 'RED BULL', category: 'Bebidas', price: 18, stock: 53 },
  { name: 'FURY', category: 'Bebidas', price: 10, stock: 11 },
  { name: 'CICLON', category: 'Bebidas', price: 10, stock: 4 },
  { name: 'BLACK', category: 'Bebidas', price: 8, stock: 7 },
  { name: 'MONSTHER', category: 'Bebidas', price: 22, stock: 14 },
  { name: 'TOP POWER', category: 'Bebidas', price: 12, stock: 28 },
  { name: 'CERVEZA AMSTEL', category: 'Bebidas', price: 10, stock: 8 },
  { name: 'CERVEZA PACEÑA', category: 'Bebidas', price: 13, stock: 29 },
  { name: 'CERVEZA HUARI LATA', category: 'Bebidas', price: 14, stock: 10 },
  { name: 'CERVEZA HUARI PALITO', category: 'Bebidas', price: 11, stock: 48 },
  { name: 'CERVEZA HUARI MIEL', category: 'Bebidas', price: 15, stock: 21 },
  { name: 'CERVEZA CORONA', category: 'Bebidas', price: 15, stock: 24 },
  { name: 'CERVEZA SNAIDER', category: 'Bebidas', price: 10, stock: 10 },
  { name: 'CERVEZA GOLDEN', category: 'Bebidas', price: 10, stock: 8 },
  { name: 'FOUR LOCO', category: 'Bebidas', price: 40, stock: 12 },
  { name: 'DR. LEMON', category: 'Bebidas', price: 18, stock: 12 },
  { name: 'VINO TORO TINTO', category: 'Bebidas', price: 17, stock: 2 },
  { name: 'VINO TORO BLANCO', category: 'Bebidas', price: 15, stock: 2 },
  { name: 'TRES PLUMAS', category: 'Bebidas', price: 11, stock: 12 },
  { name: 'GRANADA 500 ml', category: 'Bebidas', price: 8, stock: 8 },
  { name: 'CIGARRO HAMSTER', category: 'Bebidas', price: 0, stock: 10 },
  { name: 'CIGARRO DERBI', category: 'Bebidas', price: 0, stock: 1 },
  { name: 'CIGARRO HILLS', category: 'Bebidas', price: 0, stock: 8 },
  { name: 'PEPSI 3 L', category: 'Refrescos', price: 16, stock: 3 },
  { name: 'PEPSI 2.5 L', category: 'Refrescos', price: 10, stock: 6 },
  { name: 'PEPSI 250 ml', category: 'Refrescos', price: 3.5, stock: 2 },
  { name: 'MENDOCINA 1 L', category: 'Refrescos', price: 7, stock: 3 },
  { name: 'GRANJA 300 ml', category: 'Refrescos', price: 6, stock: 4 },
  { name: 'GRANJA 2 L', category: 'Refrescos', price: 22, stock: 3 },
  { name: 'AGUA VITAL 3 L', category: 'Refrescos', price: 9, stock: 2 },
  { name: 'AGUA VITAL 2 L', category: 'Refrescos', price: 8, stock: 1 },
  { name: 'AGUA VITAL 600 ml', category: 'Refrescos', price: 5, stock: 17 },
  { name: 'AGUA VITAL 350 ml', category: 'Refrescos', price: 3, stock: 3 },
  { name: 'AGUA CON GAS VITAL 2.2 L', category: 'Refrescos', price: 8, stock: 10 },
  { name: 'AGUA PURA VIDA 500 ml', category: 'Refrescos', price: 5, stock: 24 },
  { name: 'AGUA PURA VIDA 2 L', category: 'Refrescos', price: 7, stock: 5 },
  { name: 'COCA COLA 3 L', category: 'Refrescos', price: 20, stock: 5 },
  { name: 'COCA COLA 2 L', category: 'Refrescos', price: 14, stock: 6 },
  { name: 'COCA COLA 500 ml', category: 'Refrescos', price: 6, stock: 4 },
  { name: 'COCA COLA ZERO 2 L', category: 'Refrescos', price: 15, stock: 6 },
  { name: 'COCA COLA DE VIDRIO 1 L', category: 'Refrescos', price: 7, stock: 8 },
  { name: 'FANTA DE VIDRIO 1.5 L', category: 'Refrescos', price: 8, stock: 3 },
  { name: 'SIMBA 2 L', category: 'Refrescos', price: 12, stock: 7 },
  { name: 'FANTA 2 L', category: 'Refrescos', price: 14, stock: 13 },
  { name: 'DEL VALLE 2 L', category: 'Refrescos', price: 13, stock: 5 },
  { name: 'AQUARIUS 2 L', category: 'Refrescos', price: 14, stock: 7 },
  { name: 'SPRITE 3 L', category: 'Refrescos', price: 20, stock: 5 },
  { name: 'SPRITE 2.5 L', category: 'Refrescos', price: 16, stock: 6 },
  { name: 'FANTA 500 ml', category: 'Refrescos', price: 6, stock: 7 },
  { name: 'FANTA 300 ml', category: 'Refrescos', price: 3.5, stock: 11 },
  { name: 'FANTA PERSONAL VIDRIO', category: 'Refrescos', price: 3, stock: 19 },
  { name: 'DEL VALLE 300 ml', category: 'Refrescos', price: 4, stock: 0 },
  { name: 'COCA COLA 300 ml', category: 'Refrescos', price: 3.5, stock: 1 },
  { name: 'YOGURT GRIEGO (BOLSA)', category: 'Lácteos', price: 25, stock: 3 },
  { name: 'YOGURT GRIEGO (VASO) 160gr', category: 'Lácteos', price: 9, stock: 6 },
  { name: 'LECHE EVAPORADA PIL', category: 'Lácteos', price: 9, stock: 3 },
  { name: 'MANTEQUILLA PIL', category: 'Lácteos', price: 23, stock: 2 },
  { name: 'YOGURT FRUTADO EN VASO', category: 'Lácteos', price: 5, stock: 6 },
  { name: 'LECHE PIL ENTERA', category: 'Lácteos', price: 9, stock: 5 },
  { name: 'LECHE ENTERA PROLAC', category: 'Lácteos', price: 8.5, stock: 0 },
  { name: 'KARPIL 900 ml', category: 'Lácteos', price: 5, stock: 6 },
  { name: 'CHICOLAC', category: 'Lácteos', price: 2, stock: 9 },
  { name: 'CHIQUICHOC', category: 'Lácteos', price: 3, stock: 6 },
  { name: 'YOGO BOY', category: 'Lácteos', price: 1.5, stock: 9 },
  { name: 'JUGUITO PIL', category: 'Lácteos', price: 3, stock: 25 },
  { name: 'AGUA SACHET', category: 'Lácteos', price: 1, stock: 56 },
  { name: 'AZUCAR 5.5 KG', category: 'Cocina', price: 45, stock: 1 },
  { name: 'ACEITE 5 L', category: 'Cocina', price: 90, stock: 2 },
  { name: 'ACEITE 900 ml', category: 'Cocina', price: 16, stock: 5 },
  { name: 'FOSFORO UNIDAD', category: 'Cocina', price: 1, stock: 91 },
  { name: 'FOSFORO PAQUETE', category: 'Cocina', price: 9, stock: 18 },
  { name: 'AJI PANCA', category: 'Cocina', price: 1, stock: 104 },
  { name: 'COMINO', category: 'Cocina', price: 1, stock: 58 },
  { name: 'RUBIS YUPI', category: 'Cocina', price: 1, stock: 19 },
  { name: 'MOSTAZA 200gr', category: 'Cocina', price: 11, stock: 6 },
  { name: 'MAYONESA 225 gr', category: 'Cocina', price: 12, stock: 7 },
  { name: 'SALSA GOLF 200gr', category: 'Cocina', price: 13, stock: 1 },
  { name: 'BARBACOA', category: 'Cocina', price: 16, stock: 3 },
  { name: 'SALSA SOYA 500 ml', category: 'Cocina', price: 15, stock: 5 },
  { name: 'SALSA SOYA 150 ml', category: 'Cocina', price: 7, stock: 5 },
  { name: 'MANTEQUILLA 410 gr', category: 'Cocina', price: 23, stock: 5 },
  { name: 'MANTEQUILLA VASO 210 gr', category: 'Cocina', price: 15, stock: 5 },
  { name: 'FLAN KRIS', category: 'Cocina', price: 11, stock: 5 },
  { name: 'PUDIN', category: 'Cocina', price: 10, stock: 9 },
  { name: 'MAICENA KRIS CAJA', category: 'Cocina', price: 8, stock: 4 },
  { name: 'MAICENA KRIS EN BOLSA', category: 'Cocina', price: 7, stock: 8 },
  { name: 'GELATINA KRIS', category: 'Cocina', price: 7, stock: 7 },
  { name: 'MONDADIENTE', category: 'Cocina', price: 3, stock: 25 },
  { name: 'POLVO DE HORNEAR', category: 'Cocina', price: 5, stock: 9 },
  { name: 'ARROZ GALLO', category: 'Cocina', price: 10, stock: 3 },
  { name: 'FIDEO LAZARONI', category: 'Cocina', price: 8, stock: 8 },
  { name: 'AZUCAR 1.1 Kg', category: 'Cocina', price: 8, stock: 3 },
  { name: 'HARINA 1 Kg AMARILLO', category: 'Cocina', price: 10, stock: 2 },
  { name: 'TE EN CAJA', category: 'Cocina', price: 7, stock: 30 },
  { name: 'NESCAFE PERSONAL CAJA', category: 'Cocina', price: 2, stock: 1 },
  { name: 'HARRY LIMONERO', category: 'Cocina', price: 6, stock: 6 },
  { name: 'NESCAFE VIDRIO 160 gr', category: 'Cocina', price: 85, stock: 4 },
  { name: 'NESCAFE BOLSA 40 gr', category: 'Cocina', price: 18, stock: 4 },
  { name: 'AVENA EN CAJA KRIS', category: 'Cocina', price: 13, stock: 5 },
  { name: 'TE CAJA GRANDE 50 SOBRES', category: 'Cocina', price: 22, stock: 3 },
  { name: 'PAÑAL MAMI', category: 'Limpieza e Higiene', price: 3, stock: 20 },
  { name: 'PAÑAL MI BEBE', category: 'Limpieza e Higiene', price: 3, stock: 11 },
  { name: 'CARIÑOSITO XG', category: 'Limpieza e Higiene', price: 3, stock: 36 },
  { name: 'CARIÑOSITO XXG', category: 'Limpieza e Higiene', price: 3, stock: 34 },
  { name: 'CARIÑOSITO G', category: 'Limpieza e Higiene', price: 3, stock: 40 },
  { name: 'MI BEBE XG', category: 'Limpieza e Higiene', price: 3, stock: 36 },
  { name: 'MI BEBE XXG', category: 'Limpieza e Higiene', price: 3, stock: 32 },
  { name: 'MI BEBE G', category: 'Limpieza e Higiene', price: 3, stock: 40 },
  { name: 'SERVILLETA NACIONAL', category: 'Limpieza e Higiene', price: 3, stock: 2 },
  { name: 'PAÑUELO ELITE', category: 'Limpieza e Higiene', price: 3, stock: 29 },
  { name: 'PAÑUELO FINESSE', category: 'Limpieza e Higiene', price: 2, stock: 20 },
  { name: 'NOSOTRAS NATURAL', category: 'Limpieza e Higiene', price: 12, stock: 9 },
  { name: 'NOSOTRAS INVISIBLE', category: 'Limpieza e Higiene', price: 12, stock: 8 },
  { name: 'CEPILLO DENTAL ADULTO', category: 'Limpieza e Higiene', price: 7, stock: 9 },
  { name: 'CEPILLO DENTAL NIÑOS', category: 'Limpieza e Higiene', price: 5, stock: 12 },
  { name: 'LIMPIA PISO SOLQUIM', category: 'Limpieza e Higiene', price: 27, stock: 4 },
  { name: 'LIMPIA VIDRIO SOLQUIM', category: 'Limpieza e Higiene', price: 17, stock: 6 },
  { name: 'MULTI USO SOLQUIM', category: 'Limpieza e Higiene', price: 18, stock: 6 },
  { name: 'AMBIENTADOR TODO BRILLO', category: 'Limpieza e Higiene', price: 14, stock: 6 },
  { name: 'BAYGON', category: 'Limpieza e Higiene', price: 28, stock: 6 },
  { name: 'LAVANDINA 4L', category: 'Limpieza e Higiene', price: 45, stock: 7 },
  { name: 'LAVANDINA 1L', category: 'Limpieza e Higiene', price: 15, stock: 14 },
  { name: 'SACA GRASA BRISTAR', category: 'Limpieza e Higiene', price: 22, stock: 6 },
  { name: 'FERDY (100 UNIDAD)', category: 'Limpieza e Higiene', price: 15, stock: 6 },
  { name: 'FERDY (50 UNIDAD)', category: 'Limpieza e Higiene', price: 8, stock: 13 },
  { name: 'NENE SOFT (50 UNIDAD)', category: 'Limpieza e Higiene', price: 8, stock: 6 },
  { name: 'CARIÑOSITOS (50 UNIDAD)', category: 'Limpieza e Higiene', price: 9, stock: 13 },
  { name: 'WAWITAS (120 UNIDAD)', category: 'Limpieza e Higiene', price: 14, stock: 1 },
  { name: 'WAWITAS (50 PAÑITOS)', category: 'Limpieza e Higiene', price: 7, stock: 10 },
  { name: 'ACE UNO', category: 'Limpieza e Higiene', price: 16, stock: 9 },
  { name: 'ACE TODO BRILLO', category: 'Limpieza e Higiene', price: 16, stock: 2 },
  { name: 'FER BRILLANTE', category: 'Limpieza e Higiene', price: 15, stock: 4 },
  { name: 'ACE PATITO 640 gr', category: 'Limpieza e Higiene', price: 15, stock: 11 },
  { name: 'ACE PATITO 140 gr', category: 'Limpieza e Higiene', price: 4, stock: 25 },
  { name: 'SURF 140 gr', category: 'Limpieza e Higiene', price: 4, stock: 23 },
  { name: 'JABON UNO', category: 'Limpieza e Higiene', price: 7, stock: 16 },
  { name: 'CEPILLO PARA ROPA', category: 'Limpieza e Higiene', price: 6, stock: 4 },
  { name: 'ESPONJA SUELTA', category: 'Limpieza e Higiene', price: 3, stock: 3 },
  { name: 'ESPONJA PAQUETE', category: 'Limpieza e Higiene', price: 12, stock: 2 },
  { name: 'SOLQUIM LAVA VAJILLA 110 ml', category: 'Limpieza e Higiene', price: 17, stock: 6 },
  { name: 'SOLQUIM LAVA VAJILLA 5000 ml', category: 'Limpieza e Higiene', price: 55, stock: 6 },
  { name: 'SAPOLIO LAVA VAJILLA 750 ml', category: 'Limpieza e Higiene', price: 14, stock: 5 },
  { name: 'HIGIENICO NACIONAL VERDE', category: 'Limpieza e Higiene', price: 12, stock: 3 },
  { name: 'HIGIENICO NACIONAL ROSADO', category: 'Limpieza e Higiene', price: 10, stock: 8 },
  { name: 'HIGIENICO FINESSE', category: 'Limpieza e Higiene', price: 13, stock: 1 },
  { name: 'HIGIENICO PERLITA', category: 'Limpieza e Higiene', price: 12, stock: 1 },
  { name: 'AXE', category: 'Limpieza e Higiene', price: 28, stock: 6 },
  { name: 'NIVEA CREMA 60 ml', category: 'Limpieza e Higiene', price: 22, stock: 6 },
  { name: 'MENTISAN', category: 'Limpieza e Higiene', price: 12, stock: 6 },
  { name: 'PILA PANASONIC GRANDE', category: 'Limpieza e Higiene', price: 18, stock: 10 },
  { name: 'PILA PANASONIC TRIPLE A', category: 'Limpieza e Higiene', price: 5, stock: 50 },
  { name: 'COLGATE GRANDE', category: 'Limpieza e Higiene', price: 16, stock: 3 },
  { name: 'COLGATE PEQUEÑO', category: 'Limpieza e Higiene', price: 13, stock: 6 },
  { name: 'PINZA', category: 'Limpieza e Higiene', price: 2, stock: 11 },
  { name: 'COTONETE', category: 'Limpieza e Higiene', price: 6, stock: 12 },
  { name: 'GEL PEQUEÑO', category: 'Limpieza e Higiene', price: 6, stock: 11 },
  { name: 'SHAMPOO 900 gr', category: 'Limpieza e Higiene', price: 25, stock: 4 },
  { name: 'JABON DOVE', category: 'Limpieza e Higiene', price: 15, stock: 5 },
  { name: 'JABON PLUSS BELLE', category: 'Limpieza e Higiene', price: 8, stock: 5 },
  { name: 'JABON PROTEX', category: 'Limpieza e Higiene', price: 10, stock: 6 },
  { name: 'BLUE CHEM.', category: 'Aceites y Aditivos', price: 270, stock: 1 },
  { name: 'ACKROH AZUL', category: 'Aceites y Aditivos', price: 80, stock: 52 },
  { name: 'ACKROM NEGRO', category: 'Aceites y Aditivos', price: 70, stock: 49 },
  { name: 'STP NARANJA', category: 'Aceites y Aditivos', price: 90, stock: 30 },
  { name: 'ELEVADOR DE OCTANAJE LUBRISTONE', category: 'Aceites y Aditivos', price: 65, stock: 18 },
  { name: 'LIQUIDO HIDRAULICO', category: 'Aceites y Aditivos', price: 28, stock: 15 },
  { name: 'LIQUIDO DE FRENO LUMEX', category: 'Aceites y Aditivos', price: 27, stock: 33 },
  { name: 'LIQUIDO DE FRENO WAGNER', category: 'Aceites y Aditivos', price: 35, stock: 1 },
  { name: 'STHIL PEQUEÑO', category: 'Aceites y Aditivos', price: 25, stock: 23 },
  { name: 'STHIL GRANDE', category: 'Aceites y Aditivos', price: 70, stock: 6 },
  { name: 'ADITIVO LUBRISTONE PARA MOTO', category: 'Aceites y Aditivos', price: 50, stock: 18 },
  { name: 'CINTA AISLANTE', category: 'Aceites y Aditivos', price: 10, stock: 8 },
  { name: 'LETRERO TAXI', category: 'Aceites y Aditivos', price: 25, stock: 4 },
  { name: 'LIQUI MOLY AZUL', category: 'Aceites y Aditivos', price: 320, stock: 3 },
  { name: 'LIQUI MOLY VERDE', category: 'Aceites y Aditivos', price: 230, stock: 16 },
  { name: 'WD-40 MULTI USO 155 gr.', category: 'Aceites y Aditivos', price: 90, stock: 5 },
  { name: 'WD-40 MULTI USO 85 gr.', category: 'Aceites y Aditivos', price: 75, stock: 5 },
  { name: 'AMBIENTADOR DE 6 Bs', category: 'Aceites y Aditivos', price: 6, stock: 19 },
  { name: 'AMBIENTADOR DE 14 Bs', category: 'Aceites y Aditivos', price: 14, stock: 9 },
  { name: 'ESPONJA', category: 'Aceites y Aditivos', price: 5, stock: 4 },
  { name: 'BORNE PARA BATERIA', category: 'Aceites y Aditivos', price: 28, stock: 6 },
  { name: 'AGUA PARA PARABRISAS', category: 'Aceites y Aditivos', price: 17, stock: 23 },
  { name: 'AGUA PARA BATERIA', category: 'Aceites y Aditivos', price: 12, stock: 23 },
  { name: 'AGUA PARA RADIADOR GOLDEN', category: 'Aceites y Aditivos', price: 65, stock: 4 },
  { name: 'AGUA PARA RADIADOR LUBRISTONE', category: 'Aceites y Aditivos', price: 55, stock: 3 },
  { name: 'AGUA PARA RADIADOR LUBRIMEX', category: 'Aceites y Aditivos', price: 55, stock: 2 },
  { name: 'ACEITE PARA MOTOR 20W-50', category: 'Aceites y Aditivos', price: 50, stock: 18 },
  { name: 'OCTANAJE ROSTER', category: 'Aceites y Aditivos', price: 75, stock: 1 }
]

export async function seedCatalog() {
  const existing = await db.products.toArray()
  const names = new Set(existing.map((p) => p.name.toLowerCase()))
  const catMap = {}
  for (const c of await db.categories.toArray()) catMap[c.name] = c.id
  let added = 0
  for (const item of INITIAL_CATALOG) {
    if (names.has(item.name.toLowerCase())) continue
    if (!catMap[item.category]) catMap[item.category] = await db.categories.add({ name: item.category })
    await db.products.add({
      name: item.name,
      categoryId: catMap[item.category],
      barcode: '',
      costPrice: 0,
      salePrice: item.price,
      stock: item.stock,
      minStock: 5,
      expiryDate: '',
      unit: 'und'
    })
    added++
  }
  return added
}

export async function resetAndSeed() {
  await db.transaction('rw', db.categories, db.products, db.sales, db.saleItems, db.expenses, db.settings, db.registers, async () => {
    await Promise.all([
      db.categories.clear(),
      db.products.clear(),
      db.sales.clear(),
      db.saleItems.clear(),
      db.expenses.clear(),
      db.settings.clear(),
      db.registers.clear()
    ])
  })
  await seedCatalog()
}

export async function openRegister(openingAmount) {
  const open = await db.registers.where('status').equals('open').first()
  if (open) return open
  return db.registers.add({
    status: 'open',
    openDate: new Date().toISOString(),
    closeDate: null,
    openingAmount,
    countedCash: null,
    difference: null,
    note: ''
  })
}

export async function closeRegister(id, { countedCash, difference, note }) {
  await db.registers.update(id, {
    status: 'closed',
    closeDate: new Date().toISOString(),
    countedCash,
    difference,
    note
  })
}

export const DEFAULT_SETTINGS = {
  storeName: 'Mi Tienda',
  currency: 'Bs.',
  warnDays: 30,
  autoCatalog: true
}

export async function getSettings() {
  const map = {}
  const rows = await db.settings.toArray()
  for (const r of rows) map[r.key] = r.value
  return { ...DEFAULT_SETTINGS, ...map }
}

export async function saveSettings(patch) {
  for (const [key, value] of Object.entries(patch)) {
    await db.settings.put({ key, value })
  }
}

export async function completeSale({ date, method, note, items, total }) {
  return db.transaction('rw', db.sales, db.saleItems, db.products, async () => {
    const saleId = await db.sales.add({ date, method, note, total })
    for (const it of items) {
      await db.saleItems.add({
        saleId,
        productId: it.productId,
        name: it.name,
        qty: it.qty,
        price: it.price,
        cost: it.cost
      })
      const p = await db.products.get(it.productId)
      if (p) await db.products.update(it.productId, { stock: Math.max(0, p.stock - it.qty) })
    }
    return saleId
  })
}

export async function deleteSale(saleId) {
  return db.transaction('rw', db.sales, db.saleItems, db.products, async () => {
    const items = await db.saleItems.where('saleId').equals(saleId).toArray()
    for (const it of items) {
      const p = await db.products.get(it.productId)
      if (p) await db.products.update(it.productId, { stock: p.stock + it.qty })
    }
    await db.saleItems.where('saleId').equals(saleId).delete()
    await db.sales.delete(saleId)
  })
}

export async function adjustStock(productId, delta) {
  const p = await db.products.get(productId)
  if (!p) return
  await db.products.update(productId, { stock: Math.max(0, p.stock + delta) })
}

export async function resetAll() {
  await db.delete()
  await db.open()
}

export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function addDaysISO(iso, days) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function daysUntil(iso) {
  const today = new Date(todayISO() + 'T12:00:00')
  const d = new Date(iso + 'T12:00:00')
  return Math.round((d - today) / 86400000)
}

export function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}