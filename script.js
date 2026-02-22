// Game State
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' or 'pvb'
let scores = { X: 0, O: 0, draw: 0 };

// Winning combinations
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]              // Diagonals
];

// DOM Elements
const cells = document.querySelectorAll('.cell');
const currentPlayerDisplay = document.getElementById('current');
const resetBtn = document.getElementById('resetBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const modeButtons = document.querySelectorAll('.mode-btn');
const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');
const scoreDrawDisplay = document.getElementById('scoreDraw');

// Initialize game
function init() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    resetBtn.addEventListener('click', resetGame);
    resetScoreBtn.addEventListener('click', resetScore);
    modeButtons.forEach(btn => {
        btn.addEventListener('click', handleModeChange);
    });
    updateScoreDisplay();
}

// Handle mode change
function handleModeChange(e) {
    modeButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    gameMode = e.target.dataset.mode;
    resetGame();
}

// Handle cell click
function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.index);

    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();

    // Bot's turn in PvB mode
    if (gameActive && gameMode === 'pvb' && currentPlayer === 'O') {
        setTimeout(botMove, 500);
    }
}

// Update cell
function handleCellPlayed(clickedCell, index) {
    board[index] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add('taken', currentPlayer.toLowerCase());
}

// Check for win or draw
function handleResultValidation() {
    let roundWon = false;
    let winningCombination = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === '' || board[b] === '' || board[c] === '') {
            continue;
        }
        if (board[a] === board[b] && board[b] === board[c]) {
            roundWon = true;
            winningCombination = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        gameActive = false;
        highlightWinningCells(winningCombination);
        setTimeout(() => {
            announceWinner();
            scores[currentPlayer]++;
            updateScoreDisplay();
        }, 400);
        return;
    }

    // Check for draw
    if (!board.includes('')) {
        gameActive = false;
        setTimeout(() => {
            currentPlayerDisplay.textContent = "It's a Draw! 🤝";
            scores.draw++;
            updateScoreDisplay();
            // Auto-restart after 2 seconds
            setTimeout(() => {
                resetGame();
            }, 2000);
        }, 300);
        return;
    }

    // Change player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    currentPlayerDisplay.textContent = currentPlayer;
}

// Highlight winning cells
function highlightWinningCells(combination) {
    combination.forEach(index => {
        cells[index].classList.add('winning');
    });
}

// Announce winner
function announceWinner() {
    const winner = currentPlayer;
    const playerName = gameMode === 'pvb' && winner === 'O' ? 'Bot' : `Player ${winner}`;
    currentPlayerDisplay.textContent = `${playerName} Wins! 🎉`;
}

// Bot move with adjustable difficulty (makes mistakes sometimes)
function botMove() {
    if (!gameActive) return;

    let move;
    // Bot makes optimal move 60% of the time, random move 40% of the time
    const playOptimal = Math.random() > 0.4;
    
    if (playOptimal) {
        move = getBestMove();
    } else {
        move = getRandomMove();
    }
    
    const cell = cells[move];
    handleCellPlayed(cell, move);
    handleResultValidation();
}

// Get random available move
function getRandomMove() {
    const availableMoves = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            availableMoves.push(i);
        }
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Minimax algorithm for bot (optimal play)
function getBestMove() {
    let bestScore = -Infinity;
    let move = 0;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    const result = checkWinner();
    if (result !== null) {
        return result === 'O' ? 10 - depth : result === 'X' ? depth - 10 : 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] !== '' && board[a] === board[b] && board[b] === board[c]) {
            return board[a];
        }
    }
    return board.includes('') ? null : 'draw';
}

// Reset game
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    currentPlayerDisplay.textContent = currentPlayer;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'x', 'o', 'winning');
    });
}

// Reset score
function resetScore() {
    scores = { X: 0, O: 0, draw: 0 };
    updateScoreDisplay();
    resetGame();
}

// Update score display
function updateScoreDisplay() {
    scoreXDisplay.textContent = scores.X;
    scoreODisplay.textContent = scores.O;
    scoreDrawDisplay.textContent = scores.draw;
}

// Start the game
init();
