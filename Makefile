network=develop

env:
	npm install

test-dapp:
	cd $(shell pwd)/app && npm test

test-contracts:
	truffle test

compile:
	truffle compile

migrate:
	truffle migrate --network $(network)

run:
	cd $(shell pwd)/app && npm run start

build:
	cd $(shell pwd)/app && npm run build

ganache:
	ganache-cli

clean:
	rm $(shell pwd)/app/build/*
