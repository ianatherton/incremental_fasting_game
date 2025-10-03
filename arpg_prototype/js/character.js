class Character {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.speed = 3;
        
        // Character stats
        this.maxLife = 100;
        this.currentLife = this.maxLife;
        this.damage = 10;
        this.discipline = 0;
        this.totalDisciplineEarned = 0; // Track total discipline earned for breakpoints
        this.disciplineGenerationRate = 1; // discipline per second
        this.lastDisciplineUpdate = Date.now();
        
        // Breakpoint system for natural progression
        this.disciplineBreakpoints = [
            { threshold: 0, rate: 1.0, name: "Novice" },
            { threshold: 100, rate: 1.5, name: "Apprentice" },
            { threshold: 500, rate: 2.5, name: "Practitioner" },
            { threshold: 1500, rate: 4.0, name: "Adept" },
            { threshold: 4000, rate: 6.5, name: "Expert" },
            { threshold: 10000, rate: 10.0, name: "Master" },
            { threshold: 25000, rate: 16.0, name: "Grandmaster" },
            { threshold: 60000, rate: 25.0, name: "Sage" },
            { threshold: 150000, rate: 40.0, name: "Enlightened" }
        ];
        
        // Character state
        this.state = 'idle'; // idle, walking, attacking
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.attackTimer = 0;
        this.attackProgress = 0; // 0 to 1 for smooth attack animation
        
        // Separate walking animation system
        this.walkAnimationFrame = 0;
        this.walkAnimationTimer = 0;
        this.isMoving = false;
        
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
            legs: { x: 0, y: 65 }  // Much lower legs to be fully visible below torso
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
        this.updateDiscipline();
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
        
        // Track movement independently of state
        this.isMoving = (this.velocity.x !== 0 || this.velocity.y !== 0);
        
        // Update state (but walking animation runs independently)
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
        // Main animation timer (for general animations)
        this.animationTimer += deltaTime;
        if (this.animationTimer > 200) { // 200ms per frame
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }
        
        // Separate faster walking animation (always runs when moving)
        if (this.isMoving) {
            this.walkAnimationTimer += deltaTime;
            if (this.walkAnimationTimer > 120) { // 120ms per frame = faster walking animation
                this.walkAnimationFrame = (this.walkAnimationFrame + 1) % 8; // 8 frames for smoother cycle
                this.walkAnimationTimer = 0;
            }
        } else {
            // Reset walking animation when not moving
            this.walkAnimationFrame = 0;
            this.walkAnimationTimer = 0;
        }
    }
    
    updateAttack(deltaTime) {
        if (this.attackTimer > 0) {
            this.attackTimer -= deltaTime;
            // Calculate smooth attack progress (0 to 1)
            this.attackProgress = 1 - (this.attackTimer / 1500);
            
            if (this.attackTimer <= 0) {
                this.state = 'idle';
                this.attackProgress = 0;
            }
        }
    }
    
    attack() {
        if (this.state !== 'attacking') {
            this.state = 'attacking';
            this.attackTimer = 1500; // 1.5 second attack duration for smooth animation
            this.attackProgress = 0;
            this.animationFrame = 0;
        }
    }
    
    updateDiscipline() {
        const now = Date.now();
        const timeDiff = (now - this.lastDisciplineUpdate) / 1000; // Convert to seconds
        
        if (timeDiff >= 1) { // Update every second
            // Update generation rate based on breakpoints
            this.updateDisciplineRate();
            
            const disciplineGained = this.disciplineGenerationRate * Math.floor(timeDiff);
            this.discipline += disciplineGained;
            this.totalDisciplineEarned += disciplineGained;
            this.lastDisciplineUpdate = now;
        }
    }
    
    updateDisciplineRate() {
        // Find the highest breakpoint we've reached
        let currentBreakpoint = this.disciplineBreakpoints[0];
        for (const breakpoint of this.disciplineBreakpoints) {
            if (this.totalDisciplineEarned >= breakpoint.threshold) {
                currentBreakpoint = breakpoint;
            } else {
                break;
            }
        }
        this.disciplineGenerationRate = currentBreakpoint.rate;
    }
    
    getCurrentBreakpoint() {
        let currentBreakpoint = this.disciplineBreakpoints[0];
        for (const breakpoint of this.disciplineBreakpoints) {
            if (this.totalDisciplineEarned >= breakpoint.threshold) {
                currentBreakpoint = breakpoint;
            } else {
                break;
            }
        }
        return currentBreakpoint;
    }
    
    getNextBreakpoint() {
        for (const breakpoint of this.disciplineBreakpoints) {
            if (this.totalDisciplineEarned < breakpoint.threshold) {
                return breakpoint;
            }
        }
        return null; // Max level reached
    }
    
    // Stat upgrade methods
    upgradeMaxLife() {
        const cost = this.getLifeUpgradeCost();
        if (this.discipline >= cost) {
            this.discipline -= cost;
            this.maxLife += 20;
            this.currentLife = this.maxLife; // Full heal on upgrade
            return true;
        }
        return false;
    }
    
    upgradeDamage() {
        const cost = this.getDamageUpgradeCost();
        if (this.discipline >= cost) {
            this.discipline -= cost;
            this.damage += 5;
            return true;
        }
        return false;
    }
    
    
    // Cost calculation methods (exponential scaling)
    getLifeUpgradeCost() {
        const baseLife = 100;
        const currentUpgrades = (this.maxLife - baseLife) / 20;
        return Math.floor(10 * Math.pow(1.5, currentUpgrades));
    }
    
    getDamageUpgradeCost() {
        const baseDamage = 10;
        const currentUpgrades = (this.damage - baseDamage) / 5;
        return Math.floor(15 * Math.pow(1.6, currentUpgrades));
    }
    
    
    // Getter methods for UI
    getStats() {
        const currentBreakpoint = this.getCurrentBreakpoint();
        const nextBreakpoint = this.getNextBreakpoint();
        
        return {
            maxLife: this.maxLife,
            currentLife: this.currentLife,
            damage: this.damage,
            discipline: Math.floor(this.discipline),
            totalDisciplineEarned: Math.floor(this.totalDisciplineEarned),
            disciplineRate: this.disciplineGenerationRate,
            currentBreakpoint: currentBreakpoint,
            nextBreakpoint: nextBreakpoint,
            progressToNext: nextBreakpoint ? 
                ((this.totalDisciplineEarned - currentBreakpoint.threshold) / 
                 (nextBreakpoint.threshold - currentBreakpoint.threshold)) * 100 : 100
        };
    }
    
    getUpgradeCosts() {
        return {
            life: this.getLifeUpgradeCost(),
            damage: this.getDamageUpgradeCost()
        };
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
        
        // Scale character to half size
        ctx.scale(0.5, 0.5);
        
        // Calculate animation offsets
        const walkOffset = this.isMoving ? 
            Math.sin(this.walkAnimationFrame * Math.PI / 4) * 2 : 0; // Uses separate walk animation
        const attackOffset = this.state === 'attacking' ? 
            Math.sin(this.animationFrame * Math.PI) * 3 : 0;
        
        // Calculate leg rocking animation (always based on movement, not state)
        const legRockAngle = this.isMoving ? 
            Math.sin(this.walkAnimationFrame * Math.PI / 3) * 0.2 : 0; // Faster and more pronounced
        
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
        
        // Calculate smooth sword swing animation
        const swingProgress = this.state === 'attacking' ? this.attackProgress : 0;
        
        // Create a smooth slash motion: starts slow, accelerates, then decelerates
        // Using easeInOutQuart for dramatic effect
        const easeProgress = swingProgress < 0.5 
            ? 8 * swingProgress * swingProgress * swingProgress * swingProgress
            : 1 - 8 * (1 - swingProgress) * (1 - swingProgress) * (1 - swingProgress) * (1 - swingProgress);
            
        // Create a wide slash arc from -90 degrees to +90 degrees
        const swingAngle = this.state === 'attacking' ? 
            (easeProgress - 0.5) * Math.PI : 0; // -π/2 to +π/2 radians
        
        // Render both arms with multiple segments
        ['leftArm', 'rightArm'].forEach(armSide => {
            const armData = this.armConfig[armSide];
            let lastSegmentEnd = { x: 0, y: 0 };
            
            // Calculate arm swing for attack animation with enhanced motion
            const isRightArm = armSide === 'rightArm';
            const armSwingOffset = isRightArm && this.state === 'attacking' ? swingAngle * 0.8 : 0;
            
            // Add shoulder movement for more natural motion
            const shoulderOffset = isRightArm && this.state === 'attacking' ? 
                Math.sin(swingProgress * Math.PI) * 8 : 0;
            
            // Render arm segments
            armData.segments.forEach((segment, index) => {
                ctx.save();
                
                // Position for this segment with enhanced swing animation
                const segmentX = segment.x + (attackOffset * (isRightArm ? 1 : -1)) + (isRightArm ? shoulderOffset : 0);
                const segmentY = segment.y + attackOffset * 0.5 + (isRightArm ? shoulderOffset * 0.3 : 0);
                
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
            
            // Add fist rotation for swing with wrist snap effect
            const wristSnapProgress = this.state === 'attacking' && swingProgress > 0.6 ? 
                (swingProgress - 0.6) / 0.4 : 0; // Wrist snap in final 40% of swing
            const fistRotation = isRightArm ? 
                (armSwingOffset * 0.5) + (wristSnapProgress * 0.8) : 0;
            ctx.rotate(fistRotation);
            
            ctx.drawImage(fistSprite, -fistSprite.width/2, -fistSprite.height/2);
            
            // Render weapon attached to right fist (inherits fist rotation)
            if (this.partVisibility.weapon && weaponSprite && weaponSprite.complete && isRightArm) {
                // Position weapon relative to fist (weapon inherits all fist transformations)
                const weaponOffsetX = fistSprite.width * 0.3;
                const weaponOffsetY = -fistSprite.height * 0.2;
                ctx.translate(weaponOffsetX, weaponOffsetY);
                
                // Only add a small base rotation - weapon inherits all swing motion from fist
                const baseWeaponRotation = 0.2; // Base sword angle relative to fist
                ctx.rotate(baseWeaponRotation);
                
                ctx.drawImage(weaponSprite, -weaponSprite.width/2, -weaponSprite.height/2);
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
