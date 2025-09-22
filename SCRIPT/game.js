 // Game data storage
        let gameData = {};
        
        function saveToStorage(key, value) {
            gameData[key] = value;
        }
        
        function getFromStorage(key) {
            return gameData[key] || null;
        }

        // Enhanced game state
        let currentScore = 0;
        let currentLevel = 1;
        let gameTimer = 0;
        let timerInterval;
        let currentCard = null;
        let flippedCards = 0;
        let totalCards = 12;
        let lives = 3;
        let streak = 0;
        let multiplier = 1;
        let powerUps = { hints: 3, skips: 2, freeze: 1 };
        let isTimeFrozen = false;
        let totalQuestions = 0;
        let correctAnswers = 0;

        // Enhanced question bank
        let questionBank = [
            {
                type: 'mcq',
                question: 'What is the capital of ancient Egypt?',
                options: ['Memphis', 'Thebes', 'Alexandria', 'Cairo'],
                correct: 0,
                points: 10,
                difficulty: 'easy'
            },
            {
                type: 'mcq',
                question: 'Which wonder of the ancient world was in Alexandria?',
                options: ['Colossus', 'Lighthouse', 'Hanging Gardens', 'Pyramid'],
                correct: 1,
                points: 15,
                difficulty: 'medium'
            },
            {
                type: 'truefalse',
                question: 'The Great Pyramid was built for Pharaoh Khufu.',
                correct: true,
                points: 10,
                difficulty: 'easy'
            },
            {
                type: 'text',
                question: 'What metal alloy is made from copper and tin?',
                correct: 'bronze',
                points: 20,
                difficulty: 'medium'
            },
            {
                type: 'mcq',
                question: 'Which ancient civilization built Machu Picchu?',
                options: ['Aztec', 'Maya', 'Inca', 'Olmec'],
                correct: 2,
                points: 15,
                difficulty: 'medium'
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
                points: 10,
                difficulty: 'easy'
            },
            {
                type: 'text',
                question: 'What is the study of ancient civilizations called?',
                correct: 'archaeology',
                points: 20,
                difficulty: 'hard'
            },
            {
                type: 'bonus',
                message: '💎 Ancient Gem Found! +30 Points!',
                points: 30
            },
            {
                type: 'curse',
                message: '💀 Ancient Curse! -10 Points!',
                points: -10
            },
            {
                type: 'mcq',
                question: 'Who was the famous female pharaoh of Egypt?',
                options: ['Nefertiti', 'Cleopatra', 'Hatshepsut', 'Ankhesenamun'],
                correct: 2,
                points: 20,
                difficulty: 'hard'
            },
            {
                type: 'text',
                question: 'What river was crucial to ancient Egyptian civilization?',
                correct: 'nile',
                points: 15,
                difficulty: 'easy'
            }
        ];

        // Initialize game
        function initGame() {
            // Load player data with fallback
            const playerData = getFromStorage('playerData');
            if (playerData && playerData.name) {
                document.getElementById('playerName').textContent = playerData.name;
            } else {
                // Try to get name from URL parameters
                const urlParams = new URLSearchParams(window.location.search);
                const name = urlParams.get('name');
                if (name) {
                    document.getElementById('playerName').textContent = name;
                    saveToStorage('playerData', { name: name, timestamp: new Date().toISOString() });
                }
            }
            
            updatePowerUpDisplay();
            startTimer();
            createCards();
            
            console.log('🏛️ Enhanced temple game initialized!');
        }

        function startTimer() {
            timerInterval = setInterval(() => {
                if (!isTimeFrozen) {
                    gameTimer++;
                    const minutes = Math.floor(gameTimer / 60);
                    const seconds = gameTimer % 60;
                    document.getElementById('timer').textContent = 
                        `⏰ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
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
                card.dataset.question = JSON.stringify(shuffled[i % shuffled.length]);
                
                card.innerHTML = `
                    <div class="card-face card-back">
                        <div class="card-number">Card ${i + 1}</div>
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
            
            card.classList.add('flipped');
            currentCard = card;
            
            const questionData = JSON.parse(card.dataset.question);
            const cardIndex = card.dataset.index;
            const frontFace = document.getElementById(`cardFront${cardIndex}`);
            
            if (questionData.type === 'bonus') {
                frontFace.className = 'card-face card-front bonus-card';
                frontFace.innerHTML = questionData.message;
                
                setTimeout(() => {
                    addScore(questionData.points);
                    showFeedback(`Bonus +${questionData.points} points! 🎉`, 'correct');
                    card.classList.add('disabled');
                    checkGameComplete();
                }, 1000);
            } else if (questionData.type === 'curse') {
                frontFace.className = 'card-face card-front curse-card';
                frontFace.innerHTML = questionData.message;
                
                setTimeout(() => {
                    addScore(questionData.points);
                    loseLife();
                    showFeedback(`Curse! ${questionData.points} points! 💀`, 'incorrect');
                    card.classList.add('disabled');
                    checkGameComplete();
                }, 1000);
            } else {
                frontFace.innerHTML = `
                    <div class="question-type">${questionData.type.toUpperCase()}</div>
                    <div class="question-text">${questionData.question}</div>
                `;
                
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
            currentCard.selectedAnswer = answer;
            submitAnswer();
        }

        function submitAnswer() {
            const modal = document.getElementById('answerSection');
            const inputEl = document.getElementById('answerInput');
            const questionData = JSON.parse(currentCard.dataset.question);
            
            let userAnswer;
            let isCorrect = false;
            
            totalQuestions++;
            
            if (questionData.type === 'text') {
                userAnswer = inputEl.value.trim().toLowerCase();
                isCorrect = userAnswer === questionData.correct.toLowerCase();
            } else {
                userAnswer = currentCard.selectedAnswer;
                isCorrect = userAnswer === questionData.correct;
            }
            
            modal.style.display = 'none';
            
            if (isCorrect) {
                correctAnswers++;
                streak++;
                updateMultiplier();
                
                let points = questionData.points * multiplier;
                addScore(points);
                
                showFeedback(`Correct! +${points} points! Streak: ${streak} 🎉`, 'correct');
                currentCard.classList.add('disabled', 'combo');
                
                if (streak % 3 === 0) {
                    showFeedback(`${streak} Streak Bonus! 🔥`, 'combo');
                }
            } else {
                streak = 0;
                multiplier = 1;
                updateMultiplier();
                loseLife();
                
                showFeedback('Incorrect! The card returns to shadow... 💀', 'incorrect');
                
                setTimeout(() => {
                    currentCard.classList.remove('flipped');
                }, 1500);
            }
            
            checkGameComplete();
        }

        function addScore(points) {
            currentScore += points;
            document.getElementById('score').textContent = currentScore;
            
            const newLevel = Math.floor(currentScore / 100) + 1;
            if (newLevel > currentLevel) {
                currentLevel = newLevel;
                document.getElementById('level').textContent = currentLevel;
                showFeedback(`Level Up! Welcome to Level ${currentLevel}! ⭐`, 'correct');
            }
        }

        function loseLife() {
            if (lives > 0) {
                lives--;
                const hearts = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
                document.getElementById('lives').textContent = hearts;
                
                if (lives === 0) {
                    showFeedback('Game Over! No lives remaining! 💀', 'incorrect');
                    setTimeout(() => {
                        endGame();
                    }, 2000);
                }
            }
        }

        function updateMultiplier() {
            multiplier = Math.min(1 + Math.floor(streak / 3), 5);
            document.getElementById('multiplier').textContent = multiplier + 'x';
            document.getElementById('streak').textContent = streak;
        }

        function useHint() {
            if (powerUps.hints > 0 && currentCard) {
                powerUps.hints--;
                updatePowerUpDisplay();
                
                const questionData = JSON.parse(currentCard.dataset.question);
                if (questionData.type === 'mcq') {
                    const wrongOptions = document.querySelectorAll('.answer-btn');
                    let removed = 0;
                    wrongOptions.forEach((btn, index) => {
                        if (index !== questionData.correct && removed < 2) {
                            btn.style.opacity = '0.3';
                            btn.disabled = true;
                            removed++;
                        }
                    });
                } else if (questionData.type === 'text') {
                    const hint = questionData.correct.charAt(0).toUpperCase();
                    showFeedback(`Hint: Answer starts with "${hint}"`, 'combo');
                }
            }
        }

        function skipQuestion() {
            if (powerUps.skips > 0 && currentCard) {
                powerUps.skips--;
                updatePowerUpDisplay();
                
                const modal = document.getElementById('answerSection');
                modal.style.display = 'none';
                
                currentCard.classList.add('disabled');
                showFeedback('Question Skipped! 🌪️', 'combo');
                checkGameComplete();
            }
        }

        function freezeTime() {
            if (powerUps.freeze > 0) {
                powerUps.freeze--;
                updatePowerUpDisplay();
                
                isTimeFrozen = true;
                showFeedback('Time Frozen for 30 seconds! ❄️', 'combo');
                
                setTimeout(() => {
                    isTimeFrozen = false;
                    showFeedback('Time Unfrozen! ⏰', 'combo');
                }, 30000);
            }
        }

        function updatePowerUpDisplay() {
            document.getElementById('hintBtn').textContent = `💡 Hint (${powerUps.hints})`;
            document.getElementById('skipBtn').textContent = `⏭️ Skip (${powerUps.skips})`;
            document.getElementById('freezeBtn').textContent = `❄️ Freeze (${powerUps.freeze})`;
            
            document.getElementById('hintBtn').disabled = powerUps.hints === 0;
            document.getElementById('skipBtn').disabled = powerUps.skips === 0;
            document.getElementById('freezeBtn').disabled = powerUps.freeze === 0;
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
            
            if (flippedCards === totalCards || lives === 0) {
                endGame();
            }
        }

        function endGame() {
            clearInterval(timerInterval);
            
            setTimeout(() => {
                const gameComplete = document.getElementById('gameComplete');
                const finalScore = document.getElementById('finalScore');
                const finalStats = document.getElementById('finalStats');
                
                finalScore.textContent = currentScore;
                
                const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
                finalStats.innerHTML = `
                    <div style="margin-bottom: 15px;">
                        <strong>Final Statistics:</strong><br>
                        Time: ${Math.floor(gameTimer / 60)}:${(gameTimer % 60).toString().padStart(2, '0')}<br>
                        Questions Answered: ${correctAnswers}/${totalQuestions}<br>
                        Accuracy: ${accuracy}%<br>
                        Best Streak: ${Math.max(streak, 0)}<br>
                        Level Reached: ${currentLevel}
                    </div>
                `;
                
                gameComplete.style.display = 'block';
                
                const completionData = {
                    score: currentScore,
                    level: currentLevel,
                    time: gameTimer,
                    accuracy: accuracy,
                    streak: streak,
                    date: new Date().toISOString()
                };
                saveToStorage('lastGame', completionData);
            }, 1000);
        }

        function restartGame() {
            currentScore = 0;
            currentLevel = 1;
            gameTimer = 0;
            flippedCards = 0;
            lives = 3;
            streak = 0;
            multiplier = 1;
            powerUps = { hints: 3, skips: 2, freeze: 1 };
            isTimeFrozen = false;
            totalQuestions = 0;
            correctAnswers = 0;
            
            document.getElementById('score').textContent = '0';
            document.getElementById('level').textContent = '1';
            document.getElementById('lives').textContent = '❤️❤️❤️';
            document.getElementById('streak').textContent = '0';
            document.getElementById('multiplier').textContent = '1x';
            document.getElementById('gameComplete').style.display = 'none';
            
            updatePowerUpDisplay();
            clearInterval(timerInterval);
            startTimer();
            createCards();
        }

        function openAdmin() {
            window.open('admin.html', '_blank');
        }

        // Initialize game when page loads
        window.addEventListener('load', initGame);

        // Console messages
        console.log('%c🏛️ ENHANCED TEMPLE QUIZ GAME LOADED 🏛️', 'color: #8bc34a; font-size: 16px; font-weight: bold;');
        console.log('%c🎮 New features: Lives, Streaks, Power-ups, Enhanced Stats!', 'color: #ffc107; font-size: 12px;');
    