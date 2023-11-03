import os from "node:os";

const lookup = {
    "darwin-x64": "./dist/x86_64-apple-darwin.node",
    "linux-x64": "./dist/x86_64-unknown-linux-gnu.node",
    "linux-arm64": "./dist/aarch64-unknown-linux-gnu.node",
    "darwin-arm64": "./dist/aarch64-apple-darwin.node",
}

export function getBinaryPath() {
    return lookup[`${os.platform()}-${os.arch()}`] ?? "./dist/index.node";
}

export function hasPrebuiltBinary() {
    return lookup[`${os.platform()}-${os.arch()}`] !== undefined;
}
