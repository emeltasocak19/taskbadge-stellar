# TaskBadge Stellar

TaskBadge is a simple Stellar Soroban dApp that lets users mark workshop or hackathon tasks as completed on-chain.

## Project Name

- TaskBadge Stellar

## Who Are You

- name: Emel Tasocak
- Learning smart contract development
- Building simple Stellar Testnet projects
- Interested in blockchain-based progress tracking

## Project Details

TaskBadge lets a user connect a Freighter wallet, choose a task, and save that task as completed on Stellar Testnet. The Soroban smart contract stores whether a wallet has completed a specific task, how many unique tasks that wallet has completed, and the total number of completed tasks across the contract. Duplicate tasks are not counted twice.

## Vision

TaskBadge turns learning progress into a small on-chain record. It can help workshops, hackathons, and beginner bootcamps show proof of participation without building a large backend. The project is intentionally simple so new developers can understand wallet signing, smart contract storage, TypeScript bindings, and frontend interaction in one complete app.

## Smart Contract Functions

- `complete_task(user, task)` completes a task for a user and returns the user's task count.
- `has_task(user, task)` checks if a user already completed a task.
- `get_task_count(user)` returns the number of unique tasks completed by a user.
- `get_total_tasks()` returns the total number of unique task completions.

## Deployed Contract

- Network: Stellar Testnet
- Contract ID: `CARFQ2FENKLDNAM4IDIWVUDVN7HMEJAQA3745FDS7V4P2HC6OMCLLX4W`
- Explorer: https://stellar.expert/explorer/testnet/contract/CARFQ2FENKLDNAM4IDIWVUDVN7HMEJAQA3745FDS7V4P2HC6OMCLLX4W

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

## ChatGPT Prompt 1

Write me a project description, in less than 150 simple, straightforward words, for a blockchain project on Stellar. The project lets users connect a wallet and mark learning tasks as completed on-chain.

## ChatGPT Prompt 2

Now, also write a vision statement, in 100 simple, straightforward words, for this project. Talk about how on-chain progress tracking can help students and hackathon builders.

## ChatGPT Prompt 3

Now, write me a software development plan for this project. Mainly focus on smart contract functions, variables, and features. Then mention the frontend. Keep it under 6 steps. Final step can be deployment.

## ChatGPT Prompt 4

Now, write a personal story summary in less than 100 words about building a simple Stellar task badge app as a first smart contract project.

## ChatGPT Prompt 5

Can you also write a draft GitHub README on how to install the project?

## ImgCreator Prompt

Futuristic happy digital painting with a friendly robot mascot in a bright workshop city, completing tasks, collecting glowing badges, simple blockchain lights.
