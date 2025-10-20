/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Emoji Mart Web Component type definitions
declare namespace JSX {
  interface IntrinsicElements {
    'em-emoji': {
      id?: string;
      set?: 'native' | 'apple' | 'google' | 'twitter' | 'facebook';
      size?: string;
      fallback?: string;
      skin?: string | number;
    };
  }
}
