import { exec } from "node:child_process";
import { hasPrebuiltBinary } from './prebuilt.js';

if (!hasPrebuiltBinary()) {
    console.log("Building library for native platform...");
    const buildProcess = exec("cargo build --release && mkdir -p dist && find target/release -maxdepth 1 -type f -name \"librehype_tree_sitter*\" ! -name \"*.d\" -exec cp {} dist/index.node \\;");
    buildProcess.stdout.pipe(process.stdout);
    buildProcess.stderr.pipe(process.stderr);
}
