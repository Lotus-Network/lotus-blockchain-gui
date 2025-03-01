import { toBech32m, fromBech32m } from '@lotus/api';

function stripHexPrefix(hex: string) {
  if (hex.startsWith('0x') || hex.startsWith('0X')) {
    return hex.slice(2);
  }
  return hex;
}

export function didToDIDId(did: string): string {
  return toBech32m(stripHexPrefix(did), 'did:lotus:');
}

export function didFromDIDId(didId: string): string | undefined {
  let decoded: string | undefined = undefined;

  try {
    decoded = fromBech32m(didId);
  } catch (e) {
    return undefined;
  }

  return decoded;
}
