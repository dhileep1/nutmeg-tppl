
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/87d974df-dc60-464b-bfc4-908055801cbb

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/87d974df-dc60-464b-bfc4-908055801cbb) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

## Local Development Setup

### Prerequisites
- Node.js (v18 or later)
- npm (v9 or later)

### Installation Steps

1. Clone the repository
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies for both frontend and backend
```sh
# Install frontend dependencies
npm install

# Install backend dependencies
cd TPPL-Backend
npm install
cd ..
```

3. Set up environment variables
- Create a `.env` file in the `TPPL-Backend` directory
- Add the following required environment variables:
  ```
  PORT=5000
  DATABASE_URL=your_postgres_connection_string
  JWT_SECRET=your_jwt_secret
  ```

### Running the Application

You can run the frontend and backend concurrently:

```sh
# Open two terminal windows/tabs

# Terminal 1: Start the backend server
cd TPPL-Backend
npm run dev

# Terminal 2: Start the frontend development server
npm run dev
```

### Accessing the Application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## What technologies are used for this project?

This project is built with:
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Node.js
- Express
- PostgreSQL

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/87d974df-dc60-464b-bfc4-908055801cbb) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
```
