import os from "node:os";
import { exec } from "node:child_process";

const lookup = {
    "darwin-x64": "./dist/x86_64-apple-darwin.node",
    "linux-x64": "./dist/x86_64-unknown-linux-gnu.node",
    "darwin-arm64": "./dist/aarch64-apple-darwin.node",
}

export function getBinaryPath() {
    return lookup[`${os.platform()}-${os.arch()}`] ?? "./dist/index.node";
}

export function hasPrebuiltBinary() {
    return lookup[`${os.platform()}-${os.arch()}`] !== undefined;
}

if (!hasPrebuiltBinary()) {
    console.log("Building library for native platform...");
    const buildProcess = exec("cargo build --release && mkdir -p dist && find target/release -maxdepth 1 -type f -name \"librehype_tree_sitter*\" ! -name \"*.d\" -exec cp {} dist/index.node \\;");
    buildProcess.stdout.pipe(process.stdout);
    buildProcess.stderr.pipe(process.stderr);
} else {
    console.log(`Skipping cargo build, prebuilt binary is available (platform=${os.platform()}, architecture=${os.arch()})`);
}




