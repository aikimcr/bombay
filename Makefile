NODE_MODULES = ./node_modules
PACKAGE = ./package.json
JS_DIR = ./public/javascripts
JS_LIB = $(JS_DIR)/lib
TEST_CLIENT_LIB = ./public/test/lib

KNOCKOUT_URL = http\://knockoutjs.com/downloads/knockout-3.0.0.js
KNOCKOUT_JS = $(JS_LIB)/knockout-3.0.0.js

PIDDER_URL = http\://sourceforge.net/projects/pidcrypt/files/pidcrypt/pidCrypt.crypto.library.005/pidCrypt.crypto.library.005.zip/download
PIDDER_ZIP = $(JS_LIB)/pidCrypt.crypto.library.005.zip
PIDDER_DIR = $(JS_LIB)/javascripts

CRYPTO_DIR = ./crypto
PRIVATE_KEY = $(CRYPTO_DIR)/rsa_private.pem
PUBLIC_KEY = $(CRYPTO_DIR)/rsa_public.pem

CHAI_URL = http\://chaijs.com/chai.js
CHAI_JS = $(TEST_CLIENT_LIB)/chai.js
CHAI_SRC = $(NODE_MODULES)/chai/chai.js

SINON_URL = http\://sinonjs.org/releases/sinon-1.10.2.js
SINON_JS = $(TEST_CLIENT_LIB)/sinon.js

SINON_CHAI_URL = https\://raw.githubusercontent.com/domenic/sinon-chai/master/lib/sinon-chai.js
SINON_CHAI_JS = $(TEST_CLIENT_LIB)/sinon-chai.js

MOCHA = $(NODE_MODULES)/mocha
MOCHA_JS = $(TEST_CLIENT_LIB)/mocha.js
MOCHA_JS_SRC = $(NODE_MODULES)/mocha/mocha.js
MOCHA_CSS = $(TEST_CLIENT_LIB)/mocha.css
MOCHA_CSS_SRC = $(NODE_MODULES)/mocha/mocha.js

SHOULD_JS = $(NODE_MODULES)/should

TEST_FILES = $(MOCHA_JS) $(MOCHA_CSS) $(CHAI_JS) $(SINON_JS) $(SINON_CHAI_JS) $(SHOULD_JS)

SCHEMA = ./sql/schema.sql
DATABASE = ./bombay.db

all: $(NODE_MODULES) $(KNOCKOUT_JS) $(PIDDER_DIR) $(PUBLIC_KEY)

install: $(NODE_MODULES) $(KNOCKOUT_JS) test

test: $(NODE_MODULES) $(MOCHA) $(SHOULD_JS)
	npm test

test_setup: $(TEST_FILES)

database: $(DATABASE)

$(KNOCKOUT_JS): $(JS_LIB)
	curl -o $(KNOCKOUT_JS) $(KNOCKOUT_URL)

$(PIDDER_ZIP): $(JS_LIB)
	curl -L -o $(PIDDER_ZIP) $(PIDDER_URL)

$(PIDDER_DIR): $(PIDDER_ZIP)
	unzip -d $(JS_LIB) $(PIDDER_ZIP)

$(CRYPTO_DIR):
	mkdir $@

$(PRIVATE_KEY): $(CRYPTO_DIR)
	if [ -f $@ ]; then mv -f $@ $@.old; fi
	openssl genrsa -out $@

$(PUBLIC_KEY): $(PRIVATE_KEY)
	if [ -f $@ ]; then mv -f $@ $@.old; fi
	openssl rsa -in $? -pubout -out $@

$(JS_LIB):
	mkdir $(JS_LIB)

$(NODE_MODULES): $(PACKAGE)
	npm install

$(DATABASE): $(SCHEMA)
	touch $(DATABASE)
	sqlite3 $(DATABASE) '.read sql/schema.sql'

$(CHAI_JS): $(TEST_CLIENT_LIB)
	curl -o $(CHAI_JS) $(CHAI_URL)

# $(CHAI_SRC): $(NODE_MODULES)
# 	npm install chai
# 
# $(CHAI_JS): $(TEST_CLIENT_LIB) $(CHAI_SRC)
# 	cp $(CHAI_SRC) $(CHAI_JS)


$(SINON_JS): $(TEST_CLIENT_LIB)
	curl -o $(SINON_JS) $(SINON_URL)

$(SINON_CHAI_JS): $(TEST_CLIENT_LIB)
	curl -o $(SINON_CHAI_JS) $(SINON_CHAI_URL)

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
