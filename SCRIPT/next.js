// Game data storage (In your environment, replace this with localStorage)
let gameData = {};

// For localStorage version, use this instead:
/*
function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}
*/

// Current session storage functions
function saveToStorage(key, value) {
    gameData[key] = value;
    console.log(`💾 Saved to session: ${key}:`, value);
}

function getFromStorage(key) {
    return gameData[key] || null;
}

// Create floating gems
function createGems() {
    const gemsContainer = document.getElementById('gems');
    const gemSymbols = ['💎', '💰', '🏺', '⭐'];
    
    for (let i = 0; i < 8; i++) {
        const gem = document.createElement('div');
        gem.className = 'gem';
        gem.textContent = gemSymbols[Math.floor(Math.random() * gemSymbols.length)];
        gem.style.left = Math.random() * 90 + '%';
        gem.style.top = Math.random() * 90 + '%';
        gem.style.animationDelay = Math.random() * 4 + 's';
        gem.style.animationDuration = (Math.random() * 2 + 3) + 's';
        gemsContainer.appendChild(gem);
    }
}

// Input validation and effects
const nameInput = document.getElementById('playerName');
const startButton = document.getElementById('startButton');
const errorMessage = document.getElementById('errorMessage');

nameInput.addEventListener('input', function() {
    const name = this.value.trim();
    
    if (name.length > 0) {
        errorMessage.style.display = 'none';
        startButton.style.opacity = '1';
        startButton.disabled = false;
    } else {
        startButton.style.opacity = '0.6';
        startButton.disabled = true;
    }
});

nameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value.trim()) {
        startGame();
    }
});

// Start game function
function startGame() {
    const playerName = nameInput.value.trim();
    
    if (!playerName) {
        errorMessage.style.display = 'block';
        nameInput.style.border = '3px solid #ff6b6b';
        nameInput.focus();
        
        setTimeout(() => {
            nameInput.style.border = '3px solid #8bc34a';
        }, 2000);
        return;
    }

    // Save player data
    const playerData = {
        name: playerName,
        timestamp: new Date().toISOString(),
        level: 1,
        score: 0
    };

    saveToStorage('playerData', playerData);
    saveToStorage('gameStarted', true);

    // Visual feedback
    startButton.innerHTML = '🌟 ENTERING TEMPLE... 🌟';
    startButton.disabled = true;
    
    // Add dramatic effect
    document.querySelector('.main-container').style.transform = 'scale(1.05)';
    document.querySelector('.main-container').style.filter = 'brightness(1.2)';
    
    setTimeout(() => {
        document.body.style.background = 'radial-gradient(circle, #ffc107 0%, transparent 70%)';
        
        setTimeout(() => {
            // Navigate to game page
            console.log(`🏛️ Welcome ${playerName}! Navigating to temple...`);
            
            // If using localStorage (for real file system), uncomment this:
            // window.location.href = 'game.html';
            
            // For demonstration purposes, show message
            
            // Uncomment the line below when you have the actual game.html file:
            window.location.href = 'game.html';
        }, 800);
    }, 1000);
}

// Initialize temple
createGems();

// Focus on input when page loads
window.addEventListener('load', () => {
    nameInput.focus();
});

// Console temple messages
console.log('%c🏛️ TEMPLE PLAYER SETUP LOADED 🏛️', 'color: #8bc34a; font-size: 16px; font-weight: bold;');
console.log('%c💎 Current session data will be stored in memory', 'color: #ffc107; font-size: 12px;');
console.log('%c🔧 To use localStorage, uncomment the localStorage functions in the code', 'color: #ff8f00; font-size: 10px;');
console.log('%c🎮 Ready to navigate to game.html when start button is clicked!', 'color: #4caf50; font-size: 12px;');