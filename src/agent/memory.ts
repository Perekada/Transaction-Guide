import fs from "fs";
import path from "path";

const MEMORY_PATH = path.join(__dirname, "..", "..", "data", "memory.json");

export interface MerchantMemory {
  [merchantKey: string]: {
    canonicalCategory: string;
    notes?: string;
  };
}

export function loadMemory(): MerchantMemory {
  try {
    const raw = fs.readFileSync(MEMORY_PATH, "utf-8");
    return JSON.parse(raw) as MerchantMemory;
  } catch (e) {
    return {};
  }
}

export function saveMemory(mem: MerchantMemory) {
  const dir = path.dirname(MEMORY_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(mem, null, 2), "utf-8");
}

export function getMerchant(mem: MerchantMemory, key: string) {
  return mem[key];
}

export function setMerchant(mem: MerchantMemory, key: string, payload: { canonicalCategory: string; notes?: string }) {
  mem[key] = payload;
  saveMemory(mem);
}
