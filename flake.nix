{
  description = "rehype-tree-sitter";
  inputs = {
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nixpkgs.url = "github:nixos/nixpkgs";
  };

  outputs = { self, fenix, nixpkgs }:
    let
      pkgs = nixpkgs.legacyPackages.aarch64-darwin;
      rust = 
        with fenix.packages.aarch64-darwin; combine [
          stable.rustc
          stable.cargo
          targets.aarch64-unknown-linux-gnu.stable.rust-std
          targets.x86_64-unknown-linux-gnu.stable.rust-std
          targets.aarch64-apple-darwin.stable.rust-std
          targets.x86_64-apple-darwin.stable.rust-std
        ];
    in {
      devShell.aarch64-darwin =
        pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs_20
            pkgs.tree-sitter
            pkgs.libiconvReal
            pkgs.cargo-zigbuild
            rust
          ];
        };
    };
}
