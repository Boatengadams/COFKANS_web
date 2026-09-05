// Ghana administrative regions and major cities/towns per region.
// Used by checkout and buy-now sheet for region -> city cascade dropdowns.

export const GHANA_REGIONS = {
  'Greater Accra': [
    'Accra', 'Tema', 'Madina', 'Adenta', 'Ashaiman', 'Teshie', 'Nungua',
    'Dansoman', 'Lapaz', 'Achimota', 'East Legon', 'Spintex', 'Kasoa (East)',
    'Weija', 'Dome', 'Amasaman', 'Prampram', 'Dodowa',
  ],
  'Ashanti': [
    'Kumasi', 'Obuasi', 'Ejisu', 'Konongo', 'Mampong', 'Bekwai', 'Asokwa',
    'Suame', 'Tafo', 'Asokore Mampong', 'Offinso', 'Agogo', 'Effiduase',
  ],
  'Western': [
    'Sekondi', 'Takoradi', 'Tarkwa', 'Axim', 'Prestea', 'Bogoso', 'Half Assini',
    'Elubo', 'Agona Nkwanta',
  ],
  'Western North': [
    'Sefwi Wiawso', 'Bibiani', 'Juaboso', 'Enchi', 'Sefwi Bekwai',
  ],
  'Central': [
    'Cape Coast', 'Kasoa', 'Winneba', 'Mankessim', 'Swedru', 'Saltpond',
    'Elmina', 'Dunkwa-on-Offin', 'Assin Fosu', 'Apam',
  ],
  'Eastern': [
    'Koforidua', 'Nkawkaw', 'Akim Oda', 'Suhum', 'Begoro', 'Mpraeso',
    'Kibi', 'Akosombo', 'Nsawam', 'Aburi', 'Asamankese',
  ],
  'Volta': [
    'Ho', 'Hohoe', 'Keta', 'Aflao', 'Kpando', 'Anloga', 'Sogakope',
    'Akatsi', 'Denu',
  ],
  'Oti': [
    'Dambai', 'Jasikan', 'Kadjebi', 'Krachi', 'Nkwanta',
  ],
  'Northern': [
    'Tamale', 'Yendi', 'Savelugu', 'Tolon', 'Bimbilla', 'Gushegu', 'Karaga',
  ],
  'Savannah': [
    'Damongo', 'Salaga', 'Bole', 'Sawla', 'Daboya',
  ],
  'North East': [
    'Nalerigu', 'Walewale', 'Gambaga', 'Chereponi',
  ],
  'Upper East': [
    'Bolgatanga', 'Bawku', 'Navrongo', 'Zebilla', 'Sandema', 'Paga',
  ],
  'Upper West': [
    'Wa', 'Lawra', 'Tumu', 'Nandom', 'Jirapa', 'Nadowli',
  ],
  'Bono': [
    'Sunyani', 'Berekum', 'Dormaa Ahenkro', 'Wenchi', 'Sampa',
  ],
  'Bono East': [
    'Techiman', 'Kintampo', 'Atebubu', 'Nkoranza', 'Yeji', 'Prang',
  ],
  'Ahafo': [
    'Goaso', 'Bechem', 'Duayaw Nkwanta', 'Hwidiem', 'Kenyasi',
  ],
} as const;

export type GhanaRegionName = keyof typeof GHANA_REGIONS;

export const GHANA_REGION_NAMES = Object.keys(GHANA_REGIONS) as GhanaRegionName[];

export function getCitiesForRegion(region: string): string[] {
  return (GHANA_REGIONS as Record<string, readonly string[]>)[region]
    ? [...(GHANA_REGIONS as Record<string, readonly string[]>)[region]]
    : [];
}

export function isValidGhanaRegion(name: string): name is GhanaRegionName {
  return name in GHANA_REGIONS;
}
