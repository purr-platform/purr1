paket := .paket/paket.exe
fohm := node_modules/.bin/fohm

help:
	@echo ""

# Installs paket and other F# dependencies, using Mono
source/paket.dependencies:
	cd source && mono .paket/paket.exe install

.PHONY: install-mono
install-mono: source/paket.dependencies

# Installs npm dependencies
source/package.json:
	cd source && npm install

.PHONY: npm
npm: source/package.json

# Builds the VM project
.PHONY: vm
vm: source/package.json source/paket.dependencies
	dotnet restore source/vm
	cd source/vm && dotnet fable webpack -- -p --config webpack.config.js
