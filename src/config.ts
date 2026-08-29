export const AGENT_CONFIG = {
  // Decision threshold for accepting agent/model outputs. If final confidence < threshold, mark uncertain.
  confidenceThreshold: 0.7,
  // How many top suggestions to surface on fallback
  topK: 3,
};
