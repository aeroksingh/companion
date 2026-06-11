import { runPipeline, PipelineInput } from "./pipeline";

// Read args — Tauri passes --input '{"inputPath":...}'
const args = process.argv.slice(2);
const inputIdx = args.indexOf("--input");

if (inputIdx === -1 || !args[inputIdx + 1]) {
  console.error("Usage: companion-pipeline --input <json>");
  process.exit(1);
}

let input: PipelineInput;
try {
  input = JSON.parse(args[inputIdx + 1]);
} catch {
  console.error("Invalid JSON input");
  process.exit(1);
}

(async () => {
  try {
    const result = await runPipeline(input);
    // Tauri sidecar reads stdout lines prefixed with RESULT:
    console.log(`RESULT:${JSON.stringify(result)}`);
    process.exit(0);
  } catch (err) {
    const result = {
      success: false,
      error: String(err),
      spritePath: "",
      frameCount: 0,
      spriteWidth: 0,
      spriteHeight: 0,
    };
    console.log(`RESULT:${JSON.stringify(result)}`);
    process.exit(1);
  }
})();
