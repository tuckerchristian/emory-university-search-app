/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ELASTICSEARCH_ENDPOINT: string
  readonly VITE_ELASTICSEARCH_API_KEY: string
  readonly VITE_ANALYTICS_API_KEY: string
  readonly VITE_DEBUG: string
  readonly VITE_ANALYTICS_COLLECTION_NAME: string
  readonly VITE_ANALYTICS_ENABLED: string
  readonly VITE_ANALYTICS_DEBUG: string
  readonly VITE_AI_SUMMARY_ENABLED: string
  readonly VITE_INFERENCE_ENDPOINT: string
  readonly VITE_ELASTIC_RUM_ENABLED: string
  readonly VITE_ELASTIC_RUM_SERVER_URL: string
  readonly VITE_ELASTIC_RUM_SERVICE_NAME: string
  readonly VITE_ELASTIC_RUM_SERVICE_VERSION: string
  readonly VITE_ELASTIC_RUM_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 