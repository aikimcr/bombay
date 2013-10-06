NODE_MODULES = ./node_modules
PACKAGE = ./package.json
JS_DIR = ./public/javascripts
JS_LIB = $(JS_DIR)/lib
TEST_DIR = ./test
TEST_CLIENT_DIR = $(TEST_DIR)/client
TEST_CLIENT_LIB = $(TEST_CLIENT_DIR)/lib

JADE_JS_DIR = $(JS_LIB)/jade
JADE_JS_RUNTIME = $(JADE_JS_DIR)/runtime.js
JADE_SRC = $(NODE_MODULES)/jade/runtime.js

CHAI_JS = $(TEST_CLIENT_LIB)/chai.js
CHAI_SRC = $(NODE_MODULES)/chai/chai.js

MOCHA_JS = $(TEST_CLIENT_LIB/mocha.js
MOCHA_JS_SRC = $(NODE_MODULES)/mocha/mocha.js
MOCHA_CSS = $(TEST_CLIENT_LIB/mocha.css
MOCHA_CSS_SRC = $(NODE_MODULES)/mocha/mocha.js

SCHEMA = ./sql/schema.sql
DATABASE = ./bombay.db

install: $(NODE_MODULES) $(JADE_JS_RUNTIME) $(DATABASE)

test: install

$(JADE_JS_RUNTIME): $(NODE_MODULES) $(JADE_JS_DIR)
	cp $(JADE_SRC) $(JADE_JS_RUNTIME)

$(JADE_JS_DIR): $(JS_LIB)
	mkdir $(JADE_JS_DIR)

$(JS_LIB):
	mkdir $(JS_LIB)

$(NODE_MODULES): $(PACKAGE)
	npm install

$(DATABASE): $(SCHEMA)
	touch $(DATABASE)
	sqlite3 $(DATABASE) '.read sql/schema.sql'

$(CHAI_JS): $(NODE_MODULES) $(TEST_CLIENT_LIB) $(CHAI_SRC)
	cp $(CHAI_SRC) $(CHAI_JS)

$(MOCHA_JS): $(NODE_MODULES) $(TEST_CLIENT_LIB) $(MOCHA_JS_SRC)
	cp $(MOCHA_JS_SRC) $(MOCHA_JS)

$(MOCHA_CSS): $(NODE_MODULES) $(TEST_CLIENT_LIB) $(MOCHA_CSS_SRC)
	cp $(MOCHA_CSS_SRC) $(MOCHA_CSS)

$(TEST_CLIENT_LIB): $(TEST_CLIENT_DIR)
	mkdir $(TEST_CLIENT_LIB)

$(TEST_CLIENT_DIR): $(TEST_DIR)
	mkdir $(TEST_CLIENT_DIR)
