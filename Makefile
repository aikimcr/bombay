NPM = /usr/local/bin/npm
PYTHON7 = /opt/python2.7/bin/python2.7 
NODE_MODULES = ./node_modules
PACKAGE = ./package.json

all: $(NODE_MODULES)

$(NODE_MODULES): $(PACKAGE)
	PYTHON=$(PYTHON7) $(NPM) install
