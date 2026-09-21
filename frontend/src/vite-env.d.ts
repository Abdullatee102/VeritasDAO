/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REOWN_PROJECT_ID: string;
  readonly VITE_BOT_RPC_URL: string;
  readonly VITE_BOT_CHAIN_ID: string;
  readonly VITE_BOT_EXPLORER_URL: string;
  readonly VITE_VERITAS_DAO_CONTRACT_ADDRESS: string;
  readonly VITE_VERITAS_GOVERNANCE_TOKEN_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

