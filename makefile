
# no need to get clever here

lib/test.js: test/test.js
	@mkdir -p lib
	@babel test/test.js -o lib/test.js


lib/Progressor.js: src/Progressor.js
	@mkdir -p lib
	@babel src/Progressor.js -o lib/Progressor.js

build: lib/Progressor.js lib/test.js

