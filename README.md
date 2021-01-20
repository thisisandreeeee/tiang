# tiang

Ethereum dapp implementation of in-between

## Getting started

Install [node](https://nodejs.org/en/download/) v14.15.4 with npm v6.14.10. Then, install npm dependencies:

```bash
make env
```

Verify that all tests are passing:

```bash
make test-dapp
make test-contracts
```

Compile solidity contracts:

```
make compile
```

Deploy contracts to a test blockchain:

```
make ganache
make migrate
```

Run frontend locally:

```
make run
```

Build frontend for production:

```
make build
```
