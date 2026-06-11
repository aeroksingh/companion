import { invoke as tauriInvoke } from "@tauri-apps/api/core";

export async function invoke<T = void>(
  cmd: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await tauriInvoke<T>(cmd, args);
  } catch (error) {
    // import.meta.env is fine in Vite — tsconfig needs vite/client types
    console.error(`[invoke:${cmd}]`, error);
    throw error;
  }
}
