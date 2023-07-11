{
  description = "rehype-tree-sitter";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
  };

  outputs = { self, nixpkgs }:
    let pkgs = nixpkgs.legacyPackages.aarch64-darwin;
    in {
      devShell.aarch64-darwin =
        pkgs.mkShell { buildInputs = [ pkgs.nodejs_20 ]; };
  };
}
