export const colors = {

  primary: '#1a1a1a',

  primaryDark: '#000000',

  primarySoft: '#ececec',

  background: '#f2f2f2',

  surface: '#ffffff',

  border: '#d9d9d9',

  text: '#111111',

  textMuted: '#5c5c5c',

  textLight: '#8a8a8a',

  success: '#1a7f37',

  danger: '#b42318',

  warning: '#8a6d1d',

  star: '#111111',

  overlay: 'rgba(0, 0, 0, 0.45)',

};



export const spacing = {

  xs: 4,

  sm: 8,

  md: 12,

  lg: 16,

  xl: 24,

  xxl: 32,

};



export const radius = {

  sm: 8,

  md: 12,

  lg: 16,

  xl: 24,

  full: 999,

};



export const typography = {

  h1: { fontSize: 28, fontWeight: '700', color: colors.text },

  h2: { fontSize: 22, fontWeight: '700', color: colors.text },

  h3: { fontSize: 18, fontWeight: '600', color: colors.text },

  body: { fontSize: 15, color: colors.text },

  small: { fontSize: 13, color: colors.textMuted },

  tiny: { fontSize: 11, color: colors.textLight },

};



export const shadow = {

  card: {

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.08,

    shadowRadius: 6,

    elevation: 2,

  },

};



export const CATEGORIES = [

  { id: 'electronics', label: 'Elektronika' },

  { id: 'clothing', label: 'Odzież' },

  { id: 'furniture', label: 'Meble' },

  { id: 'vehicles', label: 'Pojazdy' },

  { id: 'sports', label: 'Sport' },

  { id: 'books', label: 'Książki' },

  { id: 'other', label: 'Inne' },

];



export const CONDITIONS = [

  { id: 'new', label: 'Nowy' },

  { id: 'used', label: 'Używany' },

  { id: 'damaged', label: 'Uszkodzony' },

];



export const labelForCategory = (id) =>

  CATEGORIES.find((c) => c.id === id)?.label ?? id;



export const labelForCondition = (id) =>

  CONDITIONS.find((c) => c.id === id)?.label ?? id;

