class World {
    constructor(canvas) {
        this.canvas = canvas;
        this.camera = {
            x: 0,
            y: 0,
            smoothing: 0.1
        };
        
        // World dimensions (larger than canvas)
        this.worldWidth = 2000;
        this.worldHeight = 1500;
        
        // Background and props
        this.backgroundTile = null;
        this.tileSize = 64; // Assuming 64x64 tiles
        this.props = [];
        
        this.loadAssets();
        this.generateProps();
    }
    
    loadAssets() {
        // Load background tile
        this.backgroundTile = new Image();
        this.backgroundTile.onload = () => {
            console.log('Background tile loaded');
            // Update tile size based on actual image
            this.tileSize = Math.max(this.backgroundTile.width, this.backgroundTile.height);
        };
        this.backgroundTile.src = 'assets/sprites/tiling_grass001.png';
        
        // Load tree prop
        const treeImage = new Image();
        treeImage.onload = () => {
            console.log('Tree prop loaded');
        };
        treeImage.src = 'assets/sprites/prop_tree001.png';
        
        // Store reference for props
        this.treeSprite = treeImage;
    }
    
    generateProps() {
        // Generate some trees scattered around the world
        const numTrees = 15;
        for (let i = 0; i < numTrees; i++) {
            this.props.push({
                type: 'tree',
                x: Math.random() * this.worldWidth,
                y: Math.random() * this.worldHeight,
                sprite: this.treeSprite
            });
        }
    }
    
    updateCamera(targetX, targetY) {
        // Smooth camera following
        const targetCamX = targetX - this.canvas.width / 2;
        const targetCamY = targetY - this.canvas.height / 2;
        
        this.camera.x += (targetCamX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (targetCamY - this.camera.y) * this.camera.smoothing;
        
        // Keep camera within world bounds
        this.camera.x = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.worldHeight - this.canvas.height, this.camera.y));
    }
    
    renderBackground(ctx) {
        if (!this.backgroundTile || !this.backgroundTile.complete) return;
        
        // Calculate which tiles are visible
        const startTileX = Math.floor(this.camera.x / this.tileSize);
        const startTileY = Math.floor(this.camera.y / this.tileSize);
        const endTileX = Math.ceil((this.camera.x + this.canvas.width) / this.tileSize);
        const endTileY = Math.ceil((this.camera.y + this.canvas.height) / this.tileSize);
        
        // Render visible tiles
        for (let tileY = startTileY; tileY <= endTileY; tileY++) {
            for (let tileX = startTileX; tileX <= endTileX; tileX++) {
                const screenX = (tileX * this.tileSize) - this.camera.x;
                const screenY = (tileY * this.tileSize) - this.camera.y;
                
                ctx.drawImage(
                    this.backgroundTile,
                    screenX,
                    screenY,
                    this.tileSize,
                    this.tileSize
                );
            }
        }
    }
    
    renderProps(ctx) {
        this.props.forEach(prop => {
            if (!prop.sprite || !prop.sprite.complete) return;
            
            // Check if prop is visible on screen
            const screenX = prop.x - this.camera.x;
            const screenY = prop.y - this.camera.y;
            
            if (screenX > -prop.sprite.width && screenX < this.canvas.width &&
                screenY > -prop.sprite.height && screenY < this.canvas.height) {
                
                ctx.drawImage(
                    prop.sprite,
                    screenX - prop.sprite.width / 2,
                    screenY - prop.sprite.height / 2
                );
            }
        });
    }
    
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.camera.x,
            y: worldY - this.camera.y
        };
    }
    
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.camera.x,
            y: screenY + this.camera.y
        };
    }
    
    isInBounds(x, y) {
        return x >= 0 && x <= this.worldWidth && y >= 0 && y <= this.worldHeight;
    }
    
    getWorldBounds() {
        return {
            width: this.worldWidth,
            height: this.worldHeight
        };
    }
}
