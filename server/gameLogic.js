const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const BOARD_SIZE = 5;
const INITIAL_PLAYER = 'A';

let gameState = {
    board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
    currentPlayer: INITIAL_PLAYER,
    gameOver: false,
    winner: null
};

// Broadcast updated game state to all connected clients
function broadcastGameState() {
    const state = JSON.stringify({ type: 'update', gameState });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(state);
        }
    });
}

// Initialize the game state
function initializeGame() {
    gameState = {
        board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
        currentPlayer: INITIAL_PLAYER,
        gameOver: false,
        winner: null
    };
}

// Handle incoming WebSocket messages
wss.on('connection', ws => {
    console.log('New client connected');
    
    // Send initial game state to the new client
    ws.send(JSON.stringify({ type: 'update', gameState }));

    ws.on('message', message => {
        const data = JSON.parse(message);
        console.log('Received message from client:', data);

        switch (data.action) {
            case 'initialize':
                initializeGame();
                broadcastGameState();
                break;
                
            case 'move':
                if (gameState.gameOver) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Game is already over.' }));
                    return;
                }

                const { character, move, x, y } = data;

                if (!validateMove(character, move, x, y)) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid move.' }));
                    return;
                }

                processMove(character, move, x, y);
                if (checkGameOver()) {
                    gameState.gameOver = true;
                    gameState.winner = gameState.currentPlayer === 'A' ? 'B' : 'A';
                } else {
                    gameState.currentPlayer = gameState.currentPlayer === 'A' ? 'B' : 'A';
                }
                broadcastGameState();
                break;

            default:
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid action.' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Validate the move based on game rules
function validateMove(character, move, x, y) {
    // Add validation logic for moves based on character type and game rules
    // This is a placeholder; actual implementation needed based on character rules
    return true;
}

// Process the move and update game state
function processMove(character, move, x, y) {
    // Implement move logic: update board, handle captures, etc.
    // This is a placeholder; actual implementation needed based on character rules
}

// Check if the game is over (one player has no remaining characters)
function checkGameOver() {
    const playerAHasCharacters = gameState.board.flat().some(cell => cell && cell.player === 'A');
    const playerBHasCharacters = gameState.board.flat().some(cell => cell && cell.player === 'B');
    return !playerAHasCharacters || !playerBHasCharacters;
}

console.log('WebSocket server is running on ws://localhost:8080');
