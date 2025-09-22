     // Create falling leaves
        function createLeaves() {
            const leavesContainer = document.getElementById('leaves');
            const leafSymbols = ['🍃', '🌿', '🌱'];
            
            setInterval(() => {
                if (leavesContainer.children.length < 15) {
                    const leaf = document.createElement('div');
                    leaf.className = 'leaf';
                    leaf.textContent = leafSymbols[Math.floor(Math.random() * leafSymbols.length)];
                    leaf.style.left = Math.random() * 100 + '%';
                    leaf.style.animationDuration = (Math.random() * 4 + 6) + 's';
                    leaf.style.animationDelay = Math.random() * 2 + 's';
                    leavesContainer.appendChild(leaf);
                    
                    // Remove leaf after animation
                    setTimeout(() => {
                        if (leaf.parentNode) {
                            leaf.parentNode.removeChild(leaf);
                        }
                    }, 10000);
                }
            }, 1500);
        }

        // Create decorative vines
        function createVines() {
            const vinesContainer = document.getElementById('vines');
            const vinePositions = [
                { left: '5%', top: '0%' },
                { right: '5%', top: '0%' },
                { left: '0%', top: '30%' },
                { right: '0%', top: '30%' }
            ];
            
            vinePositions.forEach((pos, i) => {
                const vine = document.createElement('div');
                vine.className = 'vine';
                vine.textContent = '🌿';
                Object.assign(vine.style, pos);
                vine.style.animationDelay = i * 0.5 + 's';
                vinesContainer.appendChild(vine);
            });
        }

        // Enhanced click effect
        function addTreasureClick(element) {
            element.style.transform = 'scale(0.95) rotateX(15deg)';
            element.style.filter = 'brightness(1.2)';
            
            setTimeout(() => {
                element.style.transform = '';
                element.style.filter = '';
            }, 200);
        }

        // Card interaction effects
        const treasureCard = document.getElementById('treasureCard');
        
        treasureCard.addEventListener('mouseenter', function() {
            this.style.animation = 'none';
        });

        treasureCard.addEventListener('mouseleave', function() {
            this.style.animation = 'treasureFloat 4s ease-in-out infinite';
        });

   // Next page function
function nextPage() {
    const card = document.getElementById('treasureCard');
    addTreasureClick(card);
    
    // Dramatic temple entrance effect
    setTimeout(() => {
        card.style.transform = 'scale(1.3) rotateY(180deg)';
        card.style.opacity = '0';
        card.style.filter = 'brightness(2) blur(5px)';
        
        // Add screen flash effect
        document.body.style.background = 'radial-gradient(circle, #ffc107 0%, transparent 70%)';
        
        setTimeout(() => {
            document.body.style.background = '';
            // Redirect after effect
            window.location.href = 'HTML/next.html';
        }, 600);
    }, 300);
}


        // Jungle ambience sounds (visual feedback)
        function playJungleAmbience() {
            console.log('🦜 *Jungle birds chirping* 🌿');
            console.log('🐒 *Distant monkey calls* 🌺');
        }

        // Initialize the jungle
        createLeaves();
        createVines();
        playJungleAmbience();

        // Console Easter eggs
        console.log('%c🏛️ TEMPLE CARDS INITIALIZED 🏛️', 'color: #8bc34a; font-size: 16px; font-weight: bold; text-shadow: 2px 2px 4px #000;');
        console.log('%c🌿 The ancient jungle awakens... 💎', 'color: #ffc107; font-size: 12px;');
