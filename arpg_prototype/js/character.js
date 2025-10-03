class Character {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.speed = 3;
        
        // Character state
        this.state = 'idle'; // idle, walking, attacking
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.attackTimer = 0;
        
        // Movement
        this.velocity = { x: 0, y: 0 };
        this.keys = {};
        
        // Character parts
        this.parts = {
            torso: null,
            legs: null,
            arms: null,
            fists: null,
            weapon: null
        };
        
        this.partVisibility = {
            arms: true,
            weapon: false
        };
        
        // Arm configuration for multi-segment arms (horizontal extension like goal image)
        this.armConfig = {
            leftArm: {
                segments: [
                    { x: -25, y: -8, rotation: 1.57 },   // Upper arm pointing straight left (90 degrees)
                    { x: -45, y: -8, rotation: 1.57 },   // Middle arm continuing left
                    { x: -65, y: -8, rotation: 1.57 }    // Lower arm fully extended left
                ]
            },
            rightArm: {
                segments: [
                    { x: 25, y: -8, rotation: -1.57 },   // Upper arm pointing straight right (90 degrees)
                    { x: 45, y: -8, rotation: -1.57 },   // Middle arm continuing right
                    { x: 65, y: -8, rotation: -1.57 }    // Lower arm fully extended right
                ]
            }
        };
        
        // Animation offsets for different parts
        this.partOffsets = {
            torso: { x: 0, y: 0 },
            legs: { x: 0, y: 35 }  // Much lower legs to be fully visible below torso
        };
        
        this.loadSprites();
    }
    
    loadSprites() {
        const spritePaths = {
            torso: 'assets/sprites/character/herosprite_torso.png',
            legs: 'assets/sprites/character/herosprite_legs.png',
            arms: 'assets/sprites/character/herosprite_arm.png',
            fists: 'assets/sprites/character/herosprite_fist.png',
            weapon: 'assets/sprites/items/itemsprite_sword001.png'
        };
        
        let loadedCount = 0;
        const totalSprites = Object.keys(spritePaths).length;
        
        Object.keys(spritePaths).forEach(partName => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalSprites) {
                    console.log('All character sprites loaded!');
                }
            };
            img.onerror = () => {
                console.error(`Failed to load sprite: ${spritePaths[partName]}`);
            };
            img.src = spritePaths[partName];
            this.parts[partName] = img;
        });
    }
    
    update(deltaTime) {
        this.handleMovement();
        this.updateAnimation(deltaTime);
        this.updateAttack(deltaTime);
    }
    
    handleMovement() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        if (this.keys['w'] || this.keys['W']) this.velocity.y = -this.speed;
        if (this.keys['s'] || this.keys['S']) this.velocity.y = this.speed;
        if (this.keys['a'] || this.keys['A']) this.velocity.x = -this.speed;
        if (this.keys['d'] || this.keys['D']) this.velocity.x = this.speed;
        
        // Normalize diagonal movement
        if (this.velocity.x !== 0 && this.velocity.y !== 0) {
            this.velocity.x *= 0.707;
            this.velocity.y *= 0.707;
        }
        
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Update state
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            if (this.state !== 'attacking') {
                this.state = 'walking';
            }
        } else {
            if (this.state !== 'attacking') {
                this.state = 'idle';
            }
        }
        
        // Keep character within world bounds (will be set by game class)
        if (this.worldBounds) {
            const padding = 50;
            this.x = Math.max(padding, Math.min(this.worldBounds.width - padding, this.x));
            this.y = Math.max(padding, Math.min(this.worldBounds.height - padding, this.y));
        }
    }
    
    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
        
        // Simple animation timing
        if (this.animationTimer > 200) { // 200ms per frame
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }
    }
    
    updateAttack(deltaTime) {
        if (this.attackTimer > 0) {
            this.attackTimer -= deltaTime;
            if (this.attackTimer <= 0) {
                this.state = 'idle';
            }
        }
    }
    
    attack() {
        if (this.state !== 'attacking') {
            this.state = 'attacking';
            this.attackTimer = 300; // 300ms attack duration
            this.animationFrame = 0;
        }
    }
    
    // Removed mouse rotation - character faces forward
    
    togglePart(partName) {
        if (this.partVisibility.hasOwnProperty(partName)) {
            this.partVisibility[partName] = !this.partVisibility[partName];
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Move to character position (no rotation)
        ctx.translate(this.x, this.y);
        
        // Calculate animation offsets
        const walkOffset = this.state === 'walking' ? 
            Math.sin(this.animationFrame * Math.PI / 2) * 2 : 0;
        const attackOffset = this.state === 'attacking' ? 
            Math.sin(this.animationFrame * Math.PI) * 3 : 0;
        
        // Calculate leg rocking animation
        const legRockAngle = this.state === 'walking' ? 
            Math.sin(this.animationFrame * Math.PI / 1.5) * 0.15 : 0;
        
        // Render parts in order (back to front)
        this.renderLegs(ctx, legRockAngle);
        this.renderPart(ctx, 'torso', 0);
        
        if (this.partVisibility.arms) {
            this.renderArms(ctx, attackOffset);
        }
        
        ctx.restore();
        
        // Debug: Draw center point
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 1, this.y - 1, 2, 2);
    }
    
    renderLegs(ctx, rockAngle) {
        const legSprite = this.parts.legs;
        if (!legSprite || !legSprite.complete) return;
        
        ctx.save();
        
        // Position legs at bottom of torso
        const offset = this.partOffsets.legs;
        ctx.translate(offset.x, offset.y);
        
        // Apply rocking rotation around the center pivot point
        ctx.rotate(rockAngle);
        
        // Draw legs centered on their pivot point
        ctx.drawImage(legSprite, -legSprite.width/2, -legSprite.height/2);
        
        ctx.restore();
    }
    
    renderArms(ctx, attackOffset) {
        const armSprite = this.parts.arms;
        const fistSprite = this.parts.fists;
        const weaponSprite = this.parts.weapon;
        
        if (!armSprite || !armSprite.complete || !fistSprite || !fistSprite.complete) return;
        
        // Calculate sword swing animation
        const swingProgress = this.state === 'attacking' ? 
            (this.animationFrame / 4) : 0; // 0 to 1 over attack duration
        const swingAngle = this.state === 'attacking' ? 
            Math.sin(swingProgress * Math.PI) * 1.2 : 0; // Swing arc
        
        // Render both arms with multiple segments
        ['leftArm', 'rightArm'].forEach(armSide => {
            const armData = this.armConfig[armSide];
            let lastSegmentEnd = { x: 0, y: 0 };
            
            // Calculate arm swing for attack animation
            const isRightArm = armSide === 'rightArm';
            const armSwingOffset = isRightArm && this.state === 'attacking' ? swingAngle : 0;
            
            // Render arm segments
            armData.segments.forEach((segment, index) => {
                ctx.save();
                
                // Position for this segment with swing animation
                const segmentX = segment.x + (attackOffset * (isRightArm ? 1 : -1));
                const segmentY = segment.y + attackOffset * 0.5;
                
                ctx.translate(segmentX, segmentY);
                
                // Apply swing rotation to right arm during attack
                const segmentRotation = segment.rotation + (armSwingOffset * 0.3);
                ctx.rotate(segmentRotation);
                
                // Draw arm segment
                ctx.drawImage(armSprite, -armSprite.width/2, -armSprite.height/2);
                
                // Track the end position of the last segment for fist placement
                if (index === armData.segments.length - 1) {
                    lastSegmentEnd = {
                        x: segmentX + Math.cos(segmentRotation) * (armSprite.width * 0.5),
                        y: segmentY + Math.sin(segmentRotation) * (armSprite.width * 0.5)
                    };
                }
                
                ctx.restore();
            });
            
            // Render fist at the end of the arm chain
            ctx.save();
            ctx.translate(lastSegmentEnd.x, lastSegmentEnd.y);
            
            // Add fist rotation for swing
            const fistRotation = isRightArm ? armSwingOffset * 0.5 : 0;
            ctx.rotate(fistRotation);
            
            ctx.drawImage(fistSprite, -fistSprite.width/2, -fistSprite.height/2);
            
            // Render weapon attached to right fist with dramatic swing
            if (this.partVisibility.weapon && weaponSprite && weaponSprite.complete && isRightArm) {
                ctx.save();
                
                // Position weapon relative to fist
                const weaponOffsetX = fistSprite.width * 0.3;
                const weaponOffsetY = -fistSprite.height * 0.2;
                ctx.translate(weaponOffsetX, weaponOffsetY);
                
                // Dramatic sword swing rotation
                const weaponSwingRotation = this.state === 'attacking' ? 
                    0.2 + (swingAngle * 1.5) : 0.2;
                ctx.rotate(weaponSwingRotation);
                
                ctx.drawImage(weaponSprite, -weaponSprite.width/2, -weaponSprite.height/2);
                
                ctx.restore();
            }
            
            ctx.restore();
        });
    }
    
    renderPart(ctx, partName, animationOffset = 0) {
        const sprite = this.parts[partName];
        if (!sprite || !sprite.complete) return;
        
        const offset = this.partOffsets[partName];
        const x = offset.x;
        const y = offset.y + animationOffset;
        
        // Center the sprite
        const width = sprite.width;
        const height = sprite.height;
        
        ctx.drawImage(sprite, x - width/2, y - height/2, width, height);
    }
    
    getPosition() {
        return { x: Math.round(this.x), y: Math.round(this.y) };
    }
    
    getState() {
        return this.state;
    }
    
    setWorldBounds(bounds) {
        this.worldBounds = bounds;
    }
}
