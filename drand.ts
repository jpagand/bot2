import { ChainOptions } from "./deps.ts";

export const chainHash = "52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971";
const publicKey =
  "83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a";

// See https://drand.love/developer/
// Note that https://api.drand.secureweb3.com:6875 does not support quicknet.
export const defaultEndpoints = [
  // `https://api.drand.sh/`,
  "https://api2.drand.sh/",
  "https://api3.drand.sh/",
  "https://drand.cloudflare.com/",
];

export const drandOptions: ChainOptions = {
  disableBeaconVerification: true,
  noCache: false,
  chainVerificationParams: { chainHash, publicKey },
};

/** Appends the chain hash to the endpoint */
export function drandBaseUrl(endpoint: string): string {
  return endpoint.replace(/\/$/, "") + "/" + chainHash;
}

// https://api3.drand.sh/52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971/info
const DRAND_GENESIS = 1692803367;
const DRAND_ROUND_LENGTH = 3;

/**
 * Time of round in milliseconds.
 *
 * See TimeOfRound implementation: https://github.com/drand/drand/blob/eb36ba81e3f28c966f95bcd602f60e7ff8ef4c35/chain/time.go#L30-L33
 */
export function timeOfRound(round: number): number {
  return (DRAND_GENESIS + (round - 1) * DRAND_ROUND_LENGTH) * 1000;
}

/**
 * Time between publishing and now in milliseconds
 */
export function publishedSince(round: number): number {
  return Date.now() - timeOfRound(round);
}

/**
 * Time between now and publishing in milliseconds
 */
export function publishedIn(round: number): number {
  return -publishedSince(round);
}
