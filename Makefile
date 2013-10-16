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

MOCHA = $(NODE_MODULES)/mocha
MOCHA_JS = $(TEST_CLIENT_LIB)/mocha.js
MOCHA_JS_SRC = $(NODE_MODULES)/mocha/mocha.js
MOCHA_CSS = $(TEST_CLIENT_LIB)/mocha.css
MOCHA_CSS_SRC = $(NODE_MODULES)/mocha/mocha.js

SHOULD_JS = $(NODE_MODULES)/should

TEST_FILES = $(MOCHA_JS) $(MOCHA_CSS) $(CHAI_JS) $(SHOULD_JS)

SCHEMA = ./sql/schema.sql
DATABASE = ./bombay.db

all: $(NODE_MODULES) $(JADE_JS_RUNTIME)

install: $(NODE_MODULES) $(JADE_JS_RUNTIME) test

test: $(NODE_MODULES) $(JADE_JS_RUNTIME) $(MOCHA) $(SHOULD_JS)
	npm test

test_setup: $(TEST_FILES)

jade: $(NODE_MODULES) $(JADE_JS_RUNTIME)

database: $(DATABASE)

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

$(CHAI_SRC): $(NODE_MODULES)
	npm install chai

$(CHAI_JS): $(TEST_CLIENT_LIB) $(CHAI_SRC)
	cp $(CHAI_SRC) $(CHAI_JS)

$(MOCHA_JS_SRC): $(MOCHA)

$(MOCHA_JS): $(TEST_CLIENT_LIB) $(MOCHA_JS_SRC)
	cp $(MOCHA_JS_SRC) $(MOCHA_JS)

$(MOCHA_CSS_SRC): $(MOCHA)

$(MOCHA):
	npm install mocha

$(MOCHA_CSS): $(TEST_CLIENT_LIB) $(MOCHA_CSS_SRC)
	cp $(MOCHA_CSS_SRC) $(MOCHA_CSS)

$(SHOULD_JS):
	npm install should

$(TEST_CLIENT_LIB): $(TEST_CLIENT_DIR)
	mkdir $(TEST_CLIENT_LIB)

$(TEST_CLIENT_DIR): $(TEST_DIR)
	mkdir $(TEST_CLIENT_DIR)
