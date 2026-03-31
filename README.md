# lockkey

A high-contrast, retro-themed focus system designed to protect your attention. **lockkey** forces you to confront your distractions through time delays, ivory-themed cognitive friction, and psychological "Guilt Trip" protocols.

## The Aesthetic
- **Visuals**: High-contrast Ivory-on-Near-Black retro gaming theme.
- **Typography**: Strict 16px/14px/12px scale using 'Outfit'.
- **Geometry**: Sharp, non-rounded blocks with 4px hard shadows.
- **Tone**: System-terminal style, zero emojis, high stakes.

## Features
- **🧱 Ivory-Block Locks**: Secure your platform credentials behind geometric time-constraints.
- **⏳ Delay Protocol**: Early access is gated by a 15-minute cooldown and a cognitive challenge.
- **🎭 The Guilt Trip**: Emergency bypasses (Fuck It Mode) trigger a multi-phase mirrored reflection, an unwinnable Tic-Tac-Toe struggle, and a mandatory rationalization step.
- **🧠 Cognitive Logic**: Unlocking requires a calculated math or typing challenge to prove deliberate intent.
- **🔒 AES-256-GCM**: Industry-standard encryption for all stored credentials.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion
- **Backend**: Node.js, Express, SQLite (Sequelize)
- **Authentication**: JWT, bcryptjs

## Quick Start

1. **Install dependencies**:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Set up `.env`**:
   Rename `server/.env.example` to `server/.env` and update `ENCRYPTION_KEY` to a 64-char hex string (32 bytes).

3. **Database**: 
   The system uses a local SQLite database (`server/database.sqlite`), initialized automatically on first run.

4. **Boot Sequence**:
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev

   # Terminal 2: Frontend
   cd client && npm run dev
   ```

## Operating Guidelines
- **Commitment**: The system is designed to make it hard to fail. Respect the protocol.
- **Integrity**: Every emergency bypass is recorded and rationalized.
