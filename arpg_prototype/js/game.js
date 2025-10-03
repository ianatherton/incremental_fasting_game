class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        
        // Make canvas focusable for keyboard input
        this.canvas.tabIndex = 1;
        this.canvas.focus();
        
        // Game world
        this.world = new World(this.canvas);
        
        // Game objects
        this.character = new Character(1000, 750); // Start in center of world
        this.character.setWorldBounds(this.world.getWorldBounds());
        
        // UI elements
        this.playerPosElement = document.getElementById('playerPos');
        this.playerStateElement = document.getElementById('playerState');
        
        // Stats UI elements
        this.playerLifeElement = document.getElementById('playerLife');
        this.playerDamageElement = document.getElementById('playerDamage');
        this.playerDisciplineElement = document.getElementById('playerDiscipline');
        this.disciplineRateElement = document.getElementById('disciplineRate');
        
        // Cost UI elements
        this.lifeCostElement = document.getElementById('lifeCost');
        this.damageCostElement = document.getElementById('damageCost');
        
        // Quest control UI elements
        this.questSetupElement = document.getElementById('questSetup');
        this.questActiveElement = document.getElementById('questActive');
        this.questStartInputElement = document.getElementById('questStartInput');
        this.fastingDurationElement = document.getElementById('fastingDuration');
        
        // Progression UI elements
        this.currentRankElement = document.getElementById('currentRank');
        this.stageDescriptionElement = document.getElementById('stageDescription');
        this.progressFillElement = document.getElementById('progressFill');
        this.nextRankElement = document.getElementById('nextRank');
        this.nextThresholdElement = document.getElementById('nextThreshold');
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.character.keys[e.key] = true;
            
            // Attack on spacebar
            if (e.key === ' ') {
                e.preventDefault();
                this.character.attack();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.character.keys[e.key] = false;
        });
        
        // Mouse click for attack
        this.canvas.addEventListener('click', (e) => {
            this.character.attack();
        });
        
        // UI button controls
        document.getElementById('toggleArms').addEventListener('click', () => {
            this.character.togglePart('arms');
        });
        
        document.getElementById('toggleWeapon').addEventListener('click', () => {
            this.character.togglePart('weapon');
        });
        
        document.getElementById('resetPosition').addEventListener('click', () => {
            this.character.x = 1000;
            this.character.y = 750;
        });
        
        // Upgrade button event listeners
        document.getElementById('upgradeLife').addEventListener('click', () => {
            this.character.upgradeMaxLife();
        });
        
        document.getElementById('upgradeDamage').addEventListener('click', () => {
            this.character.upgradeDamage();
        });
        
        // Quest control event listeners
        document.getElementById('startQuestBtn').addEventListener('click', () => {
            const startTime = this.questStartInputElement.value;
            if (startTime) {
                this.character.startQuest(startTime);
                this.updateQuestUI();
            }
        });
        
        document.getElementById('resetQuestBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset your fasting quest? This will clear all progress.')) {
                this.character.resetQuest();
                this.updateQuestUI();
            }
        });
        
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Keep canvas focused
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });
        
        // Test cursor loading
        this.testCursorLoading();
    }
    
    update(deltaTime) {
        this.character.update(deltaTime);
        this.world.updateCamera(this.character.x, this.character.y);
        this.updateUI();
        this.updateQuestUI();
    }
    
    updateQuestUI() {
        const stats = this.character.getStats();
        
        if (stats.isQuestActive) {
            this.questSetupElement.style.display = 'none';
            this.questActiveElement.style.display = 'block';
            this.fastingDurationElement.textContent = stats.fastingDuration;
        } else {
            this.questSetupElement.style.display = 'block';
            this.questActiveElement.style.display = 'none';
            
            // Set default start time to now
            const now = new Date();
            const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            this.questStartInputElement.value = localISOTime;
        }
    }
    
    updateUI() {
        const pos = this.character.getPosition();
        this.playerPosElement.textContent = `${pos.x}, ${pos.y}`;
        this.playerStateElement.textContent = this.character.getState();
        
        // Update character stats
        const stats = this.character.getStats();
        this.playerLifeElement.textContent = `${stats.currentLife}/${stats.maxLife}`;
        this.playerDamageElement.textContent = stats.damage;
        this.playerDisciplineElement.textContent = stats.discipline;
        this.disciplineRateElement.textContent = stats.disciplineRate.toFixed(1);
        
        // Update progression display
        this.currentRankElement.textContent = stats.currentBreakpoint.name;
        this.stageDescriptionElement.textContent = stats.currentBreakpoint.description;
        
        if (stats.nextBreakpoint && stats.isQuestActive) {
            this.nextRankElement.textContent = stats.nextBreakpoint.name;
            const timeToNext = stats.nextBreakpoint.minutes - stats.fastingMinutes;
            const hours = Math.floor(timeToNext / 60);
            const minutes = Math.floor(timeToNext % 60);
            
            if (hours > 0) {
                this.nextThresholdElement.textContent = `${hours}h ${minutes}m`;
            } else {
                this.nextThresholdElement.textContent = `${minutes}m`;
            }
            
            this.progressFillElement.style.width = `${Math.min(stats.progressToNext, 100)}%`;
        } else if (stats.nextBreakpoint) {
            this.nextRankElement.textContent = stats.nextBreakpoint.name;
            this.nextThresholdElement.textContent = "Start quest";
            this.progressFillElement.style.width = "0%";
        } else {
            this.nextRankElement.textContent = "MAX RANK";
            this.nextThresholdElement.textContent = "∞";
            this.progressFillElement.style.width = "100%";
        }
        
        // Update upgrade costs
        const costs = this.character.getUpgradeCosts();
        this.lifeCostElement.textContent = costs.life;
        this.damageCostElement.textContent = costs.damage;
        
        // Update button states based on affordability
        const upgradeLifeBtn = document.getElementById('upgradeLife');
        const upgradeDamageBtn = document.getElementById('upgradeDamage');
        
        upgradeLifeBtn.disabled = stats.discipline < costs.life;
        upgradeDamageBtn.disabled = stats.discipline < costs.damage;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for world rendering
        this.ctx.save();
        
        // Render world background
        this.world.renderBackground(this.ctx);
        
        // Render world props (background layer)
        this.world.renderProps(this.ctx);
        
        // Render character in world space
        this.renderCharacterInWorld();
        
        this.ctx.restore();
        
        // Draw UI overlay (screen space)
        this.drawOverlay();
    }
    
    renderCharacterInWorld() {
        // Convert character world position to screen position
        const screenPos = this.world.worldToScreen(this.character.x, this.character.y);
        
        // Temporarily modify character position for rendering
        const originalX = this.character.x;
        const originalY = this.character.y;
        
        this.character.x = screenPos.x;
        this.character.y = screenPos.y;
        
        // Render character
        this.character.render(this.ctx);
        
        // Restore original position
        this.character.x = originalX;
        this.character.y = originalY;
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawOverlay() {
        // Convert character world position to screen position for overlay
        const screenPos = this.world.worldToScreen(this.character.x, this.character.y);
        
        // Draw enhanced attack indicator with slash trail
        if (this.character.state === 'attacking') {
            const attackProgress = this.character.attackProgress;
            
            // Create a slash trail effect that follows the sword motion
            const slashAngle = (attackProgress - 0.5) * Math.PI; // -π/2 to +π/2
            const trailLength = 80;
            const trailStartX = screenPos.x + Math.cos(slashAngle - Math.PI/2) * trailLength * 0.7;
            const trailStartY = screenPos.y + Math.sin(slashAngle - Math.PI/2) * trailLength * 0.7;
            const trailEndX = screenPos.x + Math.cos(slashAngle + Math.PI/2) * trailLength * 0.7;
            const trailEndY = screenPos.y + Math.sin(slashAngle + Math.PI/2) * trailLength * 0.7;
            
            // Draw slash trail with gradient effect
            const gradient = this.ctx.createLinearGradient(trailStartX, trailStartY, trailEndX, trailEndY);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 170, 68, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 68, 68, 0.6)');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 6 * (1 - Math.abs(attackProgress - 0.5) * 2); // Thicker in middle of swing
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(trailStartX, trailStartY);
            this.ctx.lineTo(trailEndX, trailEndY);
            this.ctx.stroke();
            
            // Draw impact circle that grows during attack
            const impactRadius = 30 + (attackProgress * 40);
            this.ctx.strokeStyle = `rgba(255, 68, 68, ${0.8 - attackProgress * 0.6})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, impactRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw world info
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = '12px Courier New';
        this.ctx.fillText(`Camera: ${Math.round(this.world.camera.x)}, ${Math.round(this.world.camera.y)}`, 10, this.canvas.height - 20);
    }
    
    testCursorLoading() {
        // Test if cursor image can be loaded
        const testImg = new Image();
        testImg.onload = () => {
            console.log('✓ Cursor image loaded successfully');
            // Force cursor update
            this.canvas.style.cursor = "url('assets/sprites/cursor.png') 8 8, crosshair";
        };
        testImg.onerror = () => {
            console.error('✗ Failed to load cursor image');
            console.log('Falling back to crosshair cursor');
        };
        testImg.src = 'assets/sprites/cursor.png';
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    console.log('Starting ARPG Character Prototype...');
    new Game();
});
