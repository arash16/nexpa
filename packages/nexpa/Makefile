BABEL := node_modules/.bin/babel
MOCHA := node_modules/.bin/mocha
MOCHA_PHANTOM := node_modules/.bin/mocha-phantomjs
ROLLUP := node_modules/.bin/rollup
SRC := src2


build: build-es6 build-umd

build-es6:
	BABEL_ENV=es6 $(BABEL) -s true $(SRC) -d ./es/

build-umd:
	BABEL_ENV=umd $(ROLLUP) -c

clean:
	rm -rf lib/* es/*

test: test-node test-phantom

test-node:
	$(NYC) --reporter=html $(MOCHA) -r ./test/setup.js

test-phantom:
	$(MOCHA_PHANTOM) ./test/browser.html
