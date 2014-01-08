NODE_MODULES = ./node_modules
PACKAGE = ./package.json
JS_DIR = ./public/javascripts
JS_LIB = $(JS_DIR)/lib
TEST_CLIENT_LIB = ./public/test/lib

KNOCKOUT_URL = http\://knockoutjs.com/downloads/knockout-3.0.0.js
KNOCKOUT_JS = $(JS_LIB)/knockout-3.0.0.js

PIDDER_URL=http\://sourceforge.net/projects/pidcrypt/files/pidcrypt/pidCrypt.crypto.library.005/pidCrypt.crypto.library.005.zip/download
PIDDER_ZIP = $(JS_LIB)/pidCrypt.crypto.library.005.zip

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

all: $(NODE_MODULES) $(KNOCKOUT_JS) $(PIDDER_ZIP)

install: $(NODE_MODULES) $(KNOCKOUT_JS) test

test: $(NODE_MODULES) $(MOCHA) $(SHOULD_JS)
	npm test

test_setup: $(TEST_FILES)

database: $(DATABASE)

$(KNOCKOUT_JS): $(JS_LIB)
	curl -o $(KNOCKOUT_JS) $(KNOCKOUT_URL)

$(PIDDER_ZIP): $(JS_LIB)
	curl -L -o $(PIDDER_ZIP) $(PIDDER_URL)

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

$(TEST_CLIENT_LIB):
	mkdir $(TEST_CLIENT_LIB)
