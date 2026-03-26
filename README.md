# Base Quest RPG ⚔️

A fully onchain RPG game deployed on Base blockchain.

## What is Base Quest?
Players can create heroes, battle monsters, earn XP, 
level up and collect loot — all stored permanently on Base.

## Contracts on Base Mainnet

| Contract | Address |
|---|---|
| Hero | 0xF1B... |
| Monster | 0x3A1...B33E3 |
| Battle | 0xA5B...94FD2 |
| Loot | 0xC29...5F840 |

## How to Play
1. Call createHero() with your hero name
2. Call battle() with monster ID (0=Goblin, 1=Orc, 2=Dragon)
3. Call rollLoot() to collect items after winning
4. Call getHero() to check your stats

## Built With
- Solidity ^0.8.20
- Base Mainnet
- Remix IDE

## Author
Built by Jonze100 for Base ecosystemy
## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
