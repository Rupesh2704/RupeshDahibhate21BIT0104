const BOARD_SIZE = 5;
const websocket = new WebSocket('ws://localhost:8080');

let selectedCharacter = null;

// Initialize the game when WebSocket connection is opened
websocket.onopen = () => {
    console.log('Connected to the server');
    initializeGame();
};

// Handle incoming WebSocket messages
websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received data from server:', data);
    if (data.type === 'update') {
        updateBoard(data.gameState);
        updateTurnIndicator(data.gameState.currentPlayer);
        if (data.gameState.gameOver) {
            alert(`Game Over! Player ${data.gameState.winner} wins!`);
        }
    } else if (data.type === 'error') {
        alert(data.message);
    }
};

// Initialize game logic
function initializeGame() {
    websocket.send(JSON.stringify({ action: 'initialize' }));
}

// Update the game board based on game state
function updateBoard(gameState) {
    const board = document.getElementById('game-board');
    board.innerHTML = ''; // Clear previous board content
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = i;
            cell.dataset.y = j;
            const char = gameState.board[i][j];
            if (char) {
                cell.textContent = char.name;
                cell.classList.add(`player-${char.player}`);
            }
            board.appendChild(cell);
        }
    }
}

// Update the turn indicator
function updateTurnIndicator(currentPlayer) {
    document.getElementById('player-turn').textContent = `Current Player: ${currentPlayer}`;
}

// Handle cell clicks for moves and character selection
document.getElementById('game-board').addEventListener('click', (event) => {
    if (event.target.classList.contains('cell')) {
        const x = parseInt(event.target.dataset.x, 10);
        const y = parseInt(event.target.dataset.y, 10);

        if (selectedCharacter) {
            sendMove(x, y);
        } else {
            const char = event.target.textContent.trim();
            if (char) {
                selectCharacter(char);
                event.target.classList.add('selected');
            }
        }
    }
});

// Select a character
function selectCharacter(character) {
    if (!selectedCharacter) {
        selectedCharacter = character;
        document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('selected'));
        alert(`Selected character ${character}`);
    }
}

// Send a move command to the server
function sendMove(x, y) {
    if (selectedCharacter) {
        const move = prompt('Enter your move (e.g., P1:L)');
        if (move) {
            websocket.send(JSON.stringify({ action: 'move', character: selectedCharacter, move, x, y }));
            selectedCharacter = null; // Deselect character after move
        }
    } else {
        alert('No character selected');
    }
}

// Reset the game
document.getElementById('reset-game').addEventListener('click', () => {
    initializeGame();
});
