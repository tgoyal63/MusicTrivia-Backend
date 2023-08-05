# Music Trivia Backend
This project is a backend for a music trivia game. It is built with Node.js, Express, TypeScript, and Sequelize for PostgreSQL database. It also uses Socket.IO for real-time communication.

## Features
- User authentication and management
- Real-time game rooms with Socket.IO
- Music trivia game logic
- Integration with Spotify API for music data

## Getting Started
### Prerequisites
- Node.js
- PostgreSQL
### Installation
- Clone the repository
    ```bash
    git clone https://github.com/tgoyal63/MusicTrivia-Backend.git
    ```
- Install NPM packages
    ```bash
    npm install
    ```
- Copy .env.example file or create a .env file in the root directory and fill in your environment variables
    ```bash
    DB_NAME=your_database_name
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_HOST=your_database_host
    PORT=your_port
    CORS_ORIGIN=your_cors_origin
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
    ```
- Run the server
    ````bash
    npm run dev
    ````
### Usage
The server will start and listen for requests on the port you specified. You can make requests to the server endpoints to create users, create game rooms, start games, etc.

### Scripts
- `npm run build`: Compiles TypeScript to JavaScript
- `npm run dev`: Starts the server in development mode with Nodemon
- `npm run start`: Starts the server
- `npm run test`: Runs tests with Jest
- `npm run lint`: Lints the code with ESLint

### Project Structure
- `src/`: Source files
- `game/`: Game logic
- `models/`: Sequelize models for User and Song
- `routes/`: Express routes
- `socket/`: Socket.IO setup
- `utils/`: Utility functions
- `nodemon.json`: Nodemon configuration
- `package.json`: Project metadata and dependencies
- `tsconfig.json`: TypeScript configuration
#### Built With
- [Node.js](https://nodejs.org/en)
- [Express](https://expressjs.com)
- [TypeScript](https://www.typescriptlang.org)
- [Sequelize](https://sequelize.org)
- [Socket.IO](https://socket.io)
- [Spotify API](https://developer.spotify.com/documentation/web-api)

### License
This project is licensed under the ISC License.

### Project Link
[https://github.com/tgoyal63/MusicTrivia](https://github.com/tgoyal63/MusicTrivia)