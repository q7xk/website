export interface WaveTheme {
  bg: string;
  ink1: string;
  ink2: string;
}

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  let h = (hex || "").trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
