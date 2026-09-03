export const DEMO_EXECUTION_EVENT = "tradenova:demo-execution";

export function emitDemoExecution() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(DEMO_EXECUTION_EVENT));
  }
}
