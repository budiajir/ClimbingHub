// Design System Tokens — Bouldering & Climbing Hub Indonesia
// Single source of truth for all design decisions

export const colors = {
  // Backgrounds
  granite: '#12161A',
  crag: '#1E242B',
  cragLight: '#252C36',
  cragBorder: '#2E3743',

  // Accents
  lime: '#CCFF00',
  limeDim: '#A8D400',
  limeAlpha: 'rgba(204,255,0,0.15)',

  cyan: '#06B6D4',
  cyanAlpha: 'rgba(6,182,212,0.15)',

  redpoint: '#EF4444',
  redpointAlpha: 'rgba(239,68,68,0.15)',

  project: '#FF6B00',
  projectAlpha: 'rgba(255,107,0,0.15)',

  // Text
  chalk: '#F8FAFC',
  chalkDim: '#CBD5E1',
  slateAsh: '#94A3B8',
  slateDeep: '#64748B',
} as const

// Ascent type color mapping
export const ascentColors = {
  flash: { bg: 'rgba(204,255,0,0.15)', text: '#CCFF00', border: 'rgba(204,255,0,0.3)' },
  onsight: { bg: 'rgba(6,182,212,0.15)', text: '#06B6D4', border: 'rgba(6,182,212,0.3)' },
  redpoint: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', border: 'rgba(239,68,68,0.3)' },
  repeat: { bg: 'rgba(148,163,184,0.15)', text: '#94A3B8', border: 'rgba(148,163,184,0.3)' },
} as const

export type AscentType = keyof typeof ascentColors

// Grade color scale (V-scale)
export const gradeColors: Record<string, string> = {
  'VB': '#94A3B8',
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
