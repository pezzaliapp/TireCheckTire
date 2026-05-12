import * as storage from './storage.js';
import { emit } from './events.js';

// Default settings shape
const DEFAULT_SETTINGS = {
  // Officina profile
  officina: '',
  piva: '',
  tel: '',
  addr: '',
  email: '',

  // AI provider
  aiProvider: 'gemini',
  aiKey: '',
  aiModel: 'gemini-2.5-flash-lite',
  aiEndpoint: '',
  ollamaEndpoint: 'http://localhost:11434/api/generate',

  // EPREL
  eprelProxy: '',

  // Webhook
  webhook: '',

  // WhatsApp default
  whatsappNumber: '',

  // Mode default: 'auto' | 'truck'
  modeDefault: 'auto',

  // Suppliers (B2B)
  suppliers: null, // null = use defaults

  // Service catalog override
  serviceCatalog: null,

  // Onboarding done
  onboardingDone: false,

  // Legal terms acceptance — stores the accepted TERMS_VERSION,
  // empty string means user has never accepted.
  termsAccepted: '',
};

export const state = {
  settings: { ...DEFAULT_SETTINGS },
  mode: 'auto',              // current active mode
  currentScreen: 'dashboard',
  scanData: null,            // staged scan inputs
  analysisResult: null,      // last analysis result
  quoteDraft: null,          // current quote being built
};

export function loadSettings() {
  const saved = storage.get('settings');
  if (saved && typeof saved === 'object') {
    state.settings = { ...DEFAULT_SETTINGS, ...saved };
  }
  state.mode = state.settings.modeDefault || 'auto';
  return state.settings;
}

export function saveSettings(patch = {}) {
  state.settings = { ...state.settings, ...patch };
  storage.set('settings', state.settings);
  emit('settings:changed', state.settings);
  return state.settings;
}

export function setMode(mode) {
  state.mode = mode === 'truck' ? 'truck' : 'auto';
  emit('mode:changed', state.mode);
}

export function isAIConfigured() {
  const s = state.settings;
  if (s.aiProvider === 'ollama') return !!s.ollamaEndpoint;
  return !!(s.aiKey && s.aiKey.trim());
}
