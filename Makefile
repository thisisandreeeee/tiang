test-dapp:
	cd $(shell pwd)/app
	npm test

test-contracts:
	truffle test

compile:
	truffle compile

migrate:
	truffle migrate

run:
	cd $(shell pwd)/app
	npm run start

build:
	cd $(shell pwd)/app
	npm run build
