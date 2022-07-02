import sha256 from 'crypto-js/sha256';

export async function getSha256(str: string) {
    return '0x' + sha256(str).toString();
}