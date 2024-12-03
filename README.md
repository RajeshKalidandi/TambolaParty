# TambolaParty 🎮

A modern digital platform for playing Tambola (Housie) games, perfect for Indian families and communities.

## Features

- Real-time game lobbies with advanced filtering
- Host & earn from games
- Zero platform fees
- Instant UPI payments
- Perfect for events & gatherings
- Real-time multiplayer experience
- Auto-daub numbers
- Multiple ticket support
- Secure wallet system with bank integration
- Real-time notifications and updates

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Styling:** TailwindCSS + Framer Motion
- **State Management:** React Context
- **Backend:** Supabase
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL (Supabase)
- **Real-time:** Supabase Realtime
- **UI Components:** Lucide Icons
- **Notifications:** React Hot Toast

## Project Structure
src/ ├── components/ # Reusable UI components │ ├── common/ # Shared components │ ├── create-room/ # Room creation flow │ ├── dashboard/ # Host dashboard │ ├── game/ # Game components │ └── lobby/ # Game lobby components ├── lib/ # Utility functions and services │ ├── auth/ # Authentication context and hooks │ └── supabase.ts # Supabase client configuration ├── pages/ # Main page components │ ├── auth/ # Authentication pages │ ├── game/ # Game-related pages │ └── payments/ # Payment and wallet pages ├── types/ # TypeScript definitions └── App.tsx # Main application component


## Recent Updates

### Game Lobby Enhancements
- Implemented real-time room search with debouncing
- Added advanced filtering options (price range, start time, category)
- Integrated real-time updates for room changes
- Added proper error handling and loading states

### Wallet System
- Added secure wallet management
- Implemented bank account integration
- Added withdrawal functionality
- Real-time transaction history
- Primary bank account management

### Authentication & Security
- Implemented secure user authentication
- Added protected routes
- Integrated user context throughout the app
- Added proper error handling and validation

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/TambolaParty.git

2. Install dependencies
```bash
cd TambolaParty
npm install

3. Set up environment variables
```
cp .env.example .env

4. Start the development server
```
npm run dev

Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

License
MIT

