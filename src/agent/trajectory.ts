import fs from "fs";
import path from "path";

export interface TrajectoryEntry {
  timestamp: string;
  phase: string;
  input?: unknown;
  tool?: string;
  toolOutput?: unknown;
  decision?: string;
  result?: unknown;
}

const TRAJECTORY_PATH = path.resolve(__dirname, "..", "..", "data", "trajectories", "agent.jsonl");

export function appendTrajectory(entry: TrajectoryEntry) {
  const dir = path.dirname(TRAJECTORY_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.appendFileSync(TRAJECTORY_PATH, `${JSON.stringify(entry)}\n`, "utf-8");
}

export function readTrajectoryLog(): TrajectoryEntry[] {
  if (!fs.existsSync(TRAJECTORY_PATH)) return [];
  const lines = fs.readFileSync(TRAJECTORY_PATH, "utf-8").split(/\r?\n/).filter(Boolean);
  return lines.map((line) => JSON.parse(line) as TrajectoryEntry);
}
