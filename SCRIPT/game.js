  // Game data storage
        let gameData = {};
        
        function saveToStorage(key, value) {
            gameData[key] = value;
        }
        
        function getFromStorage(key) {
            return gameData[key] || null;
        }

        // Game state
        let currentScore = 0;
        let currentLevel = 1;
        let gameTimer = 0;
        let timerInterval;
        let currentCard = null;
        let flippedCards = 0;
        let totalCards = 9;
        
        // Questions database
        const questionBank = [
            {
                type: 'mcq',
                question: 'What is the capital of ancient Egypt?',
                options: ['Memphis', 'Thebes', 'Alexandria', 'Cairo'],
                correct: 0,
                points: 10
            },
            {
                type: 'mcq',
                question: 'Which wonder of the ancient world was in Alexandria?',
                options: ['Colossus', 'Lighthouse', 'Hanging Gardens', 'Pyramid'],
                correct: 1,
                points: 15
            },
            {
                type: 'truefalse',
                question: 'The Great Pyramid was built for Pharaoh Khufu.',
                correct: true,
                points: 10
            },
            {
                type: 'text',
                question: 'What metal alloy is made from copper and tin?',
                correct: 'bronze',
                points: 20
            },
            {
                type: 'mcq',
                question: 'Which ancient civilization built Machu Picchu?',
                options: ['Aztec', 'Maya', 'Inca', 'Olmec'],
                correct: 2,
                points: 15
            },
            {
                type: 'bonus',
                message: '🎁 Temple Blessing! +25 Points!',
                points: 25
            },
            {
                type: 'truefalse',
                question: 'Julius Caesar was the first Roman Emperor.',
                correct: false,
                points: 10
            },
            {
                type: 'text',
                question: 'What is the study of ancient civilizations called?',
                correct: 'archaeology',
                points: 20
            },
            {
                type: 'bonus',
                message: '💎 Ancient Gem Found! +30 Points!',
                points: 30
            }
        ];

        // Initialize game
        function initGame() {
            // Load player data
            const playerData = getFromStorage('playerData');
            if (playerData) {
                document.getElementById('playerName').textContent = playerData.name;
            }
            
            // Start timer
            startTimer();
            
            // Create cards
            createCards();
            
            console.log('🏛️ Temple game initialized!');
        }

        function startTimer() {
            timerInterval = setInterval(() => {
                gameTimer++;
                const minutes = Math.floor(gameTimer / 60);
                const seconds = gameTimer % 60;
                document.getElementById('timer').textContent = 
                    `⏰ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        }

        function createCards() {
            const grid = document.getElementById('cardsGrid');
            grid.innerHTML = '';
            
            // Shuffle questions
            const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
            
            for (let i = 0; i < totalCards; i++) {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.index = i;
                card.dataset.question = JSON.stringify(shuffled[i]);
                
                card.innerHTML = `
                    <div class="card-face card-back">
                        🔮<br>?
                    </div>
                    <div class="card-face card-front" id="cardFront${i}">
                        <!-- Content will be set when flipped -->
                    </div>
                `;
                
                card.addEventListener('click', () => flipCard(card));
                grid.appendChild(card);
            }
        }

        function flipCard(card) {
            if (card.classList.contains('flipped') || card.classList.contains('disabled')) {
                return;
            }
            
            // Flip animation
            card.classList.add('flipped');
            currentCard = card;
            
            // Parse question data
            const questionData = JSON.parse(card.dataset.question);
            const cardIndex = card.dataset.index;
            const frontFace = document.getElementById(`cardFront${cardIndex}`);
            
            // Set card content based on type
            if (questionData.type === 'bonus') {
                frontFace.className = 'card-face card-front bonus-card';
                frontFace.innerHTML = questionData.message;
                
                // Auto-award bonus after delay
                setTimeout(() => {
                    addScore(questionData.points);
                    showFeedback(`Bonus +${questionData.points} points! 🎉`, 'correct');
                    card.classList.add('disabled');
                    checkGameComplete();
                }, 1000);
            } else {
                frontFace.innerHTML = `
                    <div class="question-type">${questionData.type.toUpperCase()}</div>
                    <div class="question-text">${questionData.question}</div>
                `;
                
                // Show answer modal after flip animation
                setTimeout(() => {
                    showAnswerModal(questionData);
                }, 300);
            }
        }

        function showAnswerModal(questionData) {
            const modal = document.getElementById('answerSection');
            const questionEl = document.getElementById('answerQuestion');
            const optionsEl = document.getElementById('answerOptions');
            const inputEl = document.getElementById('answerInput');
            const typeEl = document.getElementById('answerType');
            
            typeEl.textContent = questionData.type.toUpperCase();
            questionEl.textContent = questionData.question;
            
            // Clear previous content
            optionsEl.innerHTML = '';
            inputEl.style.display = 'none';
            inputEl.value = '';
            
            if (questionData.type === 'mcq') {
                questionData.options.forEach((option, index) => {
                    const btn = document.createElement('button');
                    btn.className = 'answer-btn';
                    btn.textContent = option;
                    btn.onclick = () => selectAnswer(index);
                    optionsEl.appendChild(btn);
                });
            } else if (questionData.type === 'truefalse') {
                ['True', 'False'].forEach((option, index) => {
                    const btn = document.createElement('button');
                    btn.className = 'answer-btn';
                    btn.textContent = option;
                    btn.onclick = () => selectAnswer(index === 0);
                    optionsEl.appendChild(btn);
                });
            } else if (questionData.type === 'text') {
                inputEl.style.display = 'block';
                inputEl.focus();
            }
            
            modal.style.display = 'block';
        }

        function selectAnswer(answer) {
            // Store selected answer and submit
            currentCard.selectedAnswer = answer;
            submitAnswer();
        }

        function submitAnswer() {
            const modal = document.getElementById('answerSection');
            const inputEl = document.getElementById('answerInput');
            const questionData = JSON.parse(currentCard.dataset.question);
            
            let userAnswer;
            let isCorrect = false;
            
            if (questionData.type === 'text') {
                userAnswer = inputEl.value.trim().toLowerCase();
                isCorrect = userAnswer === questionData.correct.toLowerCase();
            } else {
                userAnswer = currentCard.selectedAnswer;
                isCorrect = userAnswer === questionData.correct;
            }
            
            // Hide modal
            modal.style.display = 'none';
            
            // Show feedback and update score
            if (isCorrect) {
                addScore(questionData.points);
                showFeedback(`Correct! +${questionData.points} points! 🎉`, 'correct');
                currentCard.classList.add('disabled');
            } else {
                showFeedback('Incorrect! The card returns to shadow... 💀', 'incorrect');
                
                // Flip card back after delay
                setTimeout(() => {
                    currentCard.classList.remove('flipped');
                }, 1500);
            }
            
            checkGameComplete();
        }

        function addScore(points) {
            currentScore += points;
            document.getElementById('score').textContent = currentScore;
            
            // Level up every 100 points
            const newLevel = Math.floor(currentScore / 100) + 1;
            if (newLevel > currentLevel) {
                currentLevel = newLevel;
                document.getElementById('level').textContent = currentLevel;
                showFeedback(`Level Up! Welcome to Level ${currentLevel}! ⭐`, 'correct');
            }
        }

        function showFeedback(message, type) {
            const feedback = document.getElementById('feedback');
            feedback.textContent = message;
            feedback.className = `feedback ${type}`;
            feedback.style.display = 'block';
            
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 3000);
        }

        function checkGameComplete() {
            const flippedCards = document.querySelectorAll('.card.disabled').length;
            
            if (flippedCards === totalCards) {
                clearInterval(timerInterval);
                
                setTimeout(() => {
                    const gameComplete = document.getElementById('gameComplete');
                    const finalScore = document.getElementById('finalScore');
                    
                    finalScore.textContent = currentScore;
                    gameComplete.style.display = 'block';
                    
                    // Save completion data
                    const completionData = {
                        score: currentScore,
                        level: currentLevel,
                        time: gameTimer,
                        date: new Date().toISOString()
                    };
                    saveToStorage('lastGame', completionData);
                }, 1000);
            }
        }

        function restartGame() {
            // Reset game state
            currentScore = 0;
            currentLevel = 1;
            gameTimer = 0;
            flippedCards = 0;
            
            // Reset display
            document.getElementById('score').textContent = '0';
            document.getElementById('level').textContent = '1';
            document.getElementById('gameComplete').style.display = 'none';
            
            // Clear timer and restart
            clearInterval(timerInterval);
            startTimer();
            
            // Recreate cards
            createCards();
        }

        // Initialize game when page loads
        window.addEventListener('load', initGame);

        // Console messages
        console.log('%c🏛️ TEMPLE QUIZ GAME LOADED 🏛️', 'color: #8bc34a; font-size: 16px; font-weight: bold;');
        console.log('%c🎴 Click cards to reveal ancient wisdom!', 'color: #ffc107; font-size: 12px;');