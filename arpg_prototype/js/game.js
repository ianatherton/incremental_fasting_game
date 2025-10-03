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
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Keep canvas focused
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });
    }
    
    update(deltaTime) {
        this.character.update(deltaTime);
        this.world.updateCamera(this.character.x, this.character.y);
        this.updateUI();
    }
    
    updateUI() {
        const pos = this.character.getPosition();
        this.playerPosElement.textContent = `${pos.x}, ${pos.y}`;
        this.playerStateElement.textContent = this.character.getState();
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
        
        // Draw attack indicator
        if (this.character.state === 'attacking') {
            this.ctx.strokeStyle = '#ff4444';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, 50, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Draw sword trail effect
            this.ctx.strokeStyle = '#ffaa44';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, 60, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw world info
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = '12px Courier New';
        this.ctx.fillText(`Camera: ${Math.round(this.world.camera.x)}, ${Math.round(this.world.camera.y)}`, 10, this.canvas.height - 20);
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
