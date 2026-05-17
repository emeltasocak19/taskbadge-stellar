# TaskBadge Stellar

TaskBadge is a simple Stellar Soroban dApp that lets users mark workshop or hackathon tasks as completed on-chain.

## Project Name

- TaskBadge Stellar

## About Me

- name: Emel Tasocak
- Learning smart contract development
- Building simple Stellar Testnet projects
- Interested in blockchain-based progress tracking
- Exploring how on-chain records can support workshops and hackathons

## Project Details

TaskBadge lets a user connect a Freighter wallet, choose a task, and save that task as completed on Stellar Testnet. The Soroban smart contract stores whether a wallet has completed a specific task, how many unique tasks that wallet has completed, and the total number of completed tasks across the contract. Duplicate tasks are not counted twice.

## Vision

TaskBadge turns learning progress into a small on-chain record. It can help workshops, hackathons, and beginner bootcamps show proof of participation without building a large backend. The project is intentionally simple so new developers can understand wallet signing, smart contract storage, TypeScript bindings, and frontend interaction in one complete app.

## Development Plan

1. Create Soroban storage keys for completed tasks, each user's task count, and total task completions.
2. Add `complete_task(user, task)` with wallet authorization and duplicate-task protection.
3. Add read functions: `has_task(user, task)`, `get_task_count(user)`, and `get_total_tasks()`.
4. Write contract tests for new tasks, duplicate tasks, multiple users, and total counter updates.
5. Build the React frontend with Freighter wallet connection, task selection, completion status, and progress counters.
6. Build, generate TypeScript bindings, deploy the contract to Stellar Testnet, and connect the deployed contract ID to the frontend.

## Personal Story

I built TaskBadge to understand how smart contracts can track progress in a simple and useful way. The project helped me practice wallet authorization, unique on-chain records, generated TypeScript bindings, and frontend interaction with a deployed Stellar contract.

## Smart Contract Functions

- `complete_task(user, task)` completes a task for a user and returns the user's task count.
- `has_task(user, task)` checks if a user already completed a task.
- `get_task_count(user)` returns the number of unique tasks completed by a user.
- `get_total_tasks()` returns the total number of unique task completions.

## Deployed Contract

- Network: Stellar Testnet
- Contract ID: `CARFQ2FENKLDNAM4IDIWVUDVN7HMEJAQA3745FDS7V4P2HC6OMCLLX4W`
- Explorer: <https://stellar.expert/explorer/testnet/contract/CARFQ2FENKLDNAM4IDIWVUDVN7HMEJAQA3745FDS7V4P2HC6OMCLLX4W>

## Tech Stack

- Stellar Soroban smart contract
- Rust
- React
- TypeScript
- Vite
- Freighter wallet

## Installation

Install the Soroban target:

```bash
rustup target add wasm32v1-none
```

Run contract tests:

```bash
cargo test
```

Build the contract:

```bash
stellar contract build
```

Install and build the generated TypeScript binding:

```bash
cd frontend/packages/taskbadge
npm install
npm run build
cd ../..
```

Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```bash
http://localhost:4324
```

## Visual Concept

- Mascot: friendly robot
- Setting: bright workshop city
- Physical keywords: completing tasks, collecting glowing badges
- Art direction: futuristic happy digital painting with clear progress energy, simple blockchain lights, and a builder-friendly mood
