{
  description = "rehype-tree-sitter";
  inputs = {
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    {
      self,
      fenix,
      nixpkgs,
    }:
    let
      forAllSystems = nixpkgs.lib.genAttrs [
        "aarch64-darwin"
        "x86_64-darwin"
        "x86_64-linux"
        "aarch64-linux"
      ];
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          rust =
            with fenix.packages.${system};
            combine [
              stable.rustc
              stable.cargo
              targets.aarch64-unknown-linux-gnu.stable.rust-std
              targets.x86_64-unknown-linux-gnu.stable.rust-std
              targets.aarch64-apple-darwin.stable.rust-std
              targets.x86_64-apple-darwin.stable.rust-std
            ];
        in
        {
          default = pkgs.mkShell {
            buildInputs = [
              pkgs.nodejs_22
              pkgs.tree-sitter
              pkgs.cargo-zigbuild
              pkgs.oxlint
              rust
            ]
            ++ pkgs.lib.optionals pkgs.stdenv.hostPlatform.isDarwin [
              pkgs.libiconv
            ];
          };
        }
      );
    };
}
