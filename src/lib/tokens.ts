// Design System Tokens — Bouldering & Climbing Hub Indonesia
// Single source of truth for all design decisions

export const colors = {
  // Official Brand Color Palette
  graphite900: '#23262C',
  graphite700: '#3A3F47',
  cloudZink: '#D1D5DB',
  safetyOrange: '#FE7733',
  neonSprout: '#B1FA63',
  paperWhite: '#FFFFFF',

  // Theme Mappings
  granite: '#23262C',
  crag: '#3A3F47',
  cragLight: '#4A505A',
  cragBorder: '#4E5661',

  // Accents
  lime: '#B1FA63',
  limeDim: '#9FE350',
  limeAlpha: 'rgba(177,250,99,0.15)',

  cyan: '#06B6D4',
  cyanAlpha: 'rgba(6,182,212,0.15)',

  redpoint: '#FE7733',
  redpointAlpha: 'rgba(254,119,51,0.15)',

  project: '#FE7733',
  projectAlpha: 'rgba(254,119,51,0.15)',

  // Text
  chalk: '#FFFFFF',
  chalkDim: '#D1D5DB',
  slateAsh: '#D1D5DB',
  slateDeep: '#9CA3AF',
} as const

// Ascent type color mapping
export const ascentColors = {
  flash: { bg: 'rgba(177,250,99,0.15)', text: '#B1FA63', border: 'rgba(177,250,99,0.3)' },
  onsight: { bg: 'rgba(6,182,212,0.15)', text: '#06B6D4', border: 'rgba(6,182,212,0.3)' },
  redpoint: { bg: 'rgba(254,119,51,0.15)', text: '#FE7733', border: 'rgba(254,119,51,0.3)' },
  repeat: { bg: 'rgba(209,213,219,0.15)', text: '#D1D5DB', border: 'rgba(209,213,219,0.3)' },
} as const

export type AscentType = keyof typeof ascentColors

// Grade color scale (V-scale)
export const gradeColors: Record<string, string> = {
  'VB': '#D1D5DB',
  'V0': '#86EFAC',
  'V1': '#4ADE80',
  'V2': '#A3E635',
  'V3': '#FDE047',
  'V4': '#FACC15',
  'V5': '#FB923C',
  'V6': '#F97316',
  'V7': '#EF4444',
  'V8': '#DC2626',
  'V9': '#C026D3',
  'V10': '#9333EA',
  'V11': '#7C3AED',
  'V12': '#6D28D9',
  'V13': '#1D4ED8',
  'V14': '#1E40AF',
  'V15': '#172554',
  'V16': '#0F172A',
  'V17': '#020617',
}

// Dual grade mapping
export const dualGrades: Record<string, { vscale: string; font: string }> = {
  'VB': { vscale: 'VB', font: '3' },
  'V0': { vscale: 'V0', font: '4' },
  'V1': { vscale: 'V1', font: '5' },
  'V2': { vscale: 'V2', font: '5+' },
  'V3': { vscale: 'V3', font: '6A' },
  'V4': { vscale: 'V4', font: '6B' },
  'V5': { vscale: 'V5', font: '6C' },
  'V6': { vscale: 'V6', font: '7A' },
  'V7': { vscale: 'V7', font: '7A+' },
  'V8': { vscale: 'V8', font: '7B' },
  'V9': { vscale: 'V9', font: '7B+' },
  'V10': { vscale: 'V10', font: '7C' },
  'V11': { vscale: 'V11', font: '7C+' },
  'V12': { vscale: 'V12', font: '8A' },
}

// Marker types for topo
export const topoMarkers = {
  S: { label: 'S', color: '#CCFF00', desc: 'Start' },
  Z: { label: 'Z', color: '#06B6D4', desc: 'Zone' },
  T: { label: 'T', color: '#EF4444', desc: 'Top' },
} as const

export type MarkerType = keyof typeof topoMarkers
