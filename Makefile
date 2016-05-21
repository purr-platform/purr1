.DEFAULT_GOAL = help

bin    := $(shell npm bin)
babel  := $(bin)/babel
eslint := $(bin)/eslint
ometa  := $(bin)/ometajs2js

# -- [ TASKS ] ---------------------------------------------------------
help:
	@echo ""
	@echo "AVAILABLE TASKS"
	@echo ""
	@echo "  compile ................ Compiles the project."
	@echo "  clean .................. Removes build artifacts."
	@echo "  test ................... Runs the tests for the project."
	@echo "  lint ................... Lints all source files."
	@echo ""


compile: $(SRC)
	$(babel) src --source-map inline --out-dir lib
	$(babel) runtime/src --source-map inline --out-dir runtime/lib
	$(ometa) --beautify < languages/caneles/parser.ometajs > languages/caneles.js

lint:
	$(eslint) .