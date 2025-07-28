/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ELASTICSEARCH_ENDPOINT: string
  readonly VITE_ELASTICSEARCH_API_KEY: string
  readonly VITE_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 