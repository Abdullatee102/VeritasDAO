import veritasDAOAbiJson from './VeritasDAO.json';
import veritasTokenAbiJson from './VeritasGovernanceToken.json';
import type { Abi } from 'viem';

export const VERITAS_DAO_ABI = veritasDAOAbiJson as unknown as Abi;
export const VERITAS_TOKEN_ABI = veritasTokenAbiJson as unknown as Abi;

