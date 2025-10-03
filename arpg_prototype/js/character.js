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
        this.disciplineGenerationRate = 1; // discipline per second
        this.lastDisciplineUpdate = Date.now();
        
        // Fasting quest system
        this.questStartTime = this.loadQuestStartTime(); // Load from localStorage or null
        this.isQuestActive = this.questStartTime !== null;
        
        // Time-based breakpoint system (in minutes)
        this.fastingBreakpoints = [
            { minutes: 0, rate: 1.0, name: "Beginning", description: "Starting your journey" },
            { minutes: 60, rate: 1.5, name: "Focused", description: "1 hour of discipline" },
            { minutes: 240, rate: 2.5, name: "Determined", description: "4 hours of commitment" },
            { minutes: 480, rate: 4.0, name: "Resilient", description: "8 hours of strength" },
            { minutes: 720, rate: 6.5, name: "Dedicated", description: "12 hours of perseverance" },
            { minutes: 1440, rate: 10.0, name: "Steadfast", description: "1 day of discipline" },
            { minutes: 2880, rate: 16.0, name: "Unwavering", description: "2 days of commitment" },
            { minutes: 4320, rate: 25.0, name: "Transcendent", description: "3 days of mastery" },
            { minutes: 7200, rate: 40.0, name: "Enlightened", description: "5 days of pure discipline" }
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
        
        // Update discipline rate based on current fasting time
        if (this.isQuestActive) {
            this.updateDisciplineRate();
        }
    }
    
    loadQuestStartTime() {
        const stored = localStorage.getItem('fastingQuestStartTime');
        return stored ? new Date(stored) : null;
    }
    
    startQuest(startDateTime) {
        this.questStartTime = new Date(startDateTime);
        this.isQuestActive = true;
        localStorage.setItem('fastingQuestStartTime', this.questStartTime.toISOString());
        this.updateDisciplineRate();
    }
    
    resetQuest() {
        this.questStartTime = null;
        this.isQuestActive = false;
        this.disciplineGenerationRate = 1.0;
        localStorage.removeItem('fastingQuestStartTime');
    }
    
    getFastingDurationMinutes() {
        if (!this.isQuestActive || !this.questStartTime) return 0;
        return Math.max(0, (Date.now() - this.questStartTime.getTime()) / (1000 * 60));
    }
    
    formatFastingDuration() {
        const totalMinutes = this.getFastingDurationMinutes();
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const minutes = Math.floor(totalMinutes % 60);
        
        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
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
        if (!this.isQuestActive) {
            return; // No discipline generation if quest isn't active
        }
        
        const now = Date.now();
        const timeDiff = (now - this.lastDisciplineUpdate) / 1000; // Convert to seconds
        
        if (timeDiff >= 1) { // Update every second
            // Update generation rate based on fasting time
            this.updateDisciplineRate();
            
            const disciplineGained = this.disciplineGenerationRate * Math.floor(timeDiff);
            this.discipline += disciplineGained;
            this.lastDisciplineUpdate = now;
        }
    }
    
    updateDisciplineRate() {
        if (!this.isQuestActive) {
            this.disciplineGenerationRate = 1.0;
            return;
        }
        
        const fastingMinutes = this.getFastingDurationMinutes();
        
        // Find the highest breakpoint we've reached based on fasting time
        let currentBreakpoint = this.fastingBreakpoints[0];
        for (const breakpoint of this.fastingBreakpoints) {
            if (fastingMinutes >= breakpoint.minutes) {
                currentBreakpoint = breakpoint;
            } else {
                break;
            }
        }
        this.disciplineGenerationRate = currentBreakpoint.rate;
    }
    
    getCurrentBreakpoint() {
        if (!this.isQuestActive) {
            return { minutes: 0, rate: 1.0, name: "Not Started", description: "Quest not active" };
        }
        
        const fastingMinutes = this.getFastingDurationMinutes();
        let currentBreakpoint = this.fastingBreakpoints[0];
        for (const breakpoint of this.fastingBreakpoints) {
            if (fastingMinutes >= breakpoint.minutes) {
                currentBreakpoint = breakpoint;
            } else {
                break;
            }
        }
        return currentBreakpoint;
    }
    
    getNextBreakpoint() {
        if (!this.isQuestActive) {
            return this.fastingBreakpoints[0];
        }
        
        const fastingMinutes = this.getFastingDurationMinutes();
        for (const breakpoint of this.fastingBreakpoints) {
            if (fastingMinutes < breakpoint.minutes) {
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
        const fastingMinutes = this.getFastingDurationMinutes();
        
        let progressToNext = 100;
        if (nextBreakpoint && this.isQuestActive) {
            const currentMinutes = fastingMinutes - currentBreakpoint.minutes;
            const totalMinutesNeeded = nextBreakpoint.minutes - currentBreakpoint.minutes;
            progressToNext = (currentMinutes / totalMinutesNeeded) * 100;
        }
        
        return {
            maxLife: this.maxLife,
            currentLife: this.currentLife,
            damage: this.damage,
            discipline: Math.floor(this.discipline),
            disciplineRate: this.disciplineGenerationRate,
            isQuestActive: this.isQuestActive,
            questStartTime: this.questStartTime,
            fastingDuration: this.formatFastingDuration(),
            fastingMinutes: Math.floor(fastingMinutes),
            currentBreakpoint: currentBreakpoint,
            nextBreakpoint: nextBreakpoint,
            progressToNext: Math.min(progressToNext, 100)
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
            
        // Calculate torso bounce animation (vertical bounce while moving)
        const torsoBounce = this.isMoving ? 
            Math.sin(this.walkAnimationFrame * Math.PI / 2) * 3 : 0; // Gentle up/down bounce
        
        // Render parts in order (back to front)
        this.renderLegs(ctx, legRockAngle);
        this.renderPart(ctx, 'torso', torsoBounce);
        
        if (this.partVisibility.arms) {
            this.renderArms(ctx, attackOffset, torsoBounce);
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
    
    renderArms(ctx, attackOffset, torsoBounce = 0) {
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
                
                // Position for this segment with enhanced swing animation and torso bounce
                const segmentX = segment.x + (attackOffset * (isRightArm ? 1 : -1)) + (isRightArm ? shoulderOffset : 0);
                const segmentY = segment.y + attackOffset * 0.5 + (isRightArm ? shoulderOffset * 0.3 : 0) + torsoBounce;
                
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
