# Fast Hero - Design Document

## Game Concept
Fast Hero is a real-time action RPG roguelite where your character's abilities, stats, and progression are directly tied to real-world fasting. The longer you maintain your fasting routine, the stronger your character becomes. This is a "monklike" game where power comes from real-world discipline (fasting), not just in-game skill. Items and equipment are lost upon death in dungeons, but your fasting-derived stats provide the core progression.

## Art Style

### Visual Direction
- **Perspective**: 2D with 4-directional sprites (potentially AI-generated from initial designs)
- **Art Style**: Stylized and slightly exaggerated proportions similar to "Don't Starve" and "Vampire Survivors"
- **Color Palette**: 
  - Monochrome-friendly design (colors enhance but aren't required for gameplay)
  - Vibrant, high-contrast colors for characters and important elements
  - Muted, desaturated backgrounds to enhance readability
  - Discipline-based aura effects (size/color/sparkles) that scale with fasting progress

### Modular Sprite System
- **Base Sprites**: 4-directional character/monster sprites (potentially AI-generated)
- **Modular Components**:
  - Separate arm sprites with tagged attachment points
  - Weapon/shield sprites with tagged grip points
  - Equipment layers (armor, accessories)
- **Animation System**:
  - Universal animations applied to all actors (walk, attack, idle)
  - Procedural animation effects (tilting, warping for movement)
  - Attachment point system automatically positions arms and weapons
- **Technical Pipeline**:
  - Engine combines: base sprite + arm sprite + held item sprite
  - Tagged attachment points ensure proper positioning
  - Modular system allows easy content creation

### Environment Art
- **Backgrounds**: 
  - Parallax scrolling for depth
  - Simple geometric shapes with hand-painted textures
  - Clear visual hierarchy between foreground and background elements
- **Effects**:
  - Particle effects for abilities and status effects
  - Screen shake and hit pauses for impactful combat
  - Visual indicators for fasting-related buffs/debuffs

### Animation Style
- **Character Animation**:
  - Limited but expressive frame animations (2-3 keyframes per action)
  - Squash and stretch for dynamic movement
  - Anticipation and follow-through for weighty actions
- **UI/UX**:
  - Clean, minimalist HUD that doesn't obscure gameplay
  - Fasting timer as a prominent but non-intrusive element
  - Visual feedback for health, energy, and other resources

### Technical Considerations
- Sprite sheets for efficient rendering
- Texture atlases to minimize draw calls
- Support for dynamic lighting and shadows (optional)
- Optimized for mobile performance

## Core Gameplay Loop
1. **Fast in Real Life** → **Accumulate Fasting Stats** → **Use Stats to Buy ARPG Power** → **Explore Dungeons & Gather Materials** → **Return to Home Base** → **Upgrade Facilities & Equipment with Materials** → **Venture into Harder Dungeons**

## Game Genre
**Monklike ARPG Roguelite**: A hybrid of incremental/idle mechanics (fasting progression) and real-time action RPG dungeon crawling. Power comes from real-world discipline, not just in-game actions.

## Character Progression

### Primary Fasting Stats (Reset on Fast-Break)

#### 1. **Discipline (Damage/Strength)**
- **Accumulation Rate Structure**:
  - **Hours 0-6**: Base rate 0.3 per hour (initial willpower test)
  - **Hours 6-12**: Steady rate 0.7 per hour (building discipline)
  - **Hours 12-18**: Enhanced rate 1.2 per hour (strong willpower zone)
  - **Hours 18-24**: Premium rate 2.0 per hour (mastery demonstration)
  - **Hours 24+**: Elite rate 3.0 per hour (legendary self-control)
- **Streak Multipliers**: +10% per consecutive day (max 200%)
- **Use**: Buy base damage, critical hit chance, special attack power, weapon mastery
- **Visual**: Geometric shields that stack and strengthen, aura size/color/sparkles scale with discipline breakpoints
- **Psychology**: Represents self-control and achievement in combat prowess

#### 2. **Vitality (Health/Life Force)**
- **Accumulation Rate**: 1 Vitality per hour of fasting (consistent throughout)
- **Use**: Buy base health, damage reduction, health regeneration rate, stamina pool
- **Visual**: Glowing orb that fills and pulses with accumulated energy
- **Psychology**: Represents life force and energy being restored through fasting
- **Reset**: Full reset on fast-break

#### 3. **Clarity (Mana/Energy/Mental Focus)**
- **Accumulation Rate Structure**:
  - **Hours 0-6**: No Clarity generation (body adjusting)
  - **Hours 6-12**: Base rate 0.5 per hour (early mental clarity)
  - **Hours 12-18**: Enhanced rate 1.5 per hour (peak focus zone)
  - **Hours 18-24**: Premium rate 3.0 per hour (deep mental state)
  - **Hours 24+**: Elite rate 5.0 per hour (transcendent clarity)
- **Use**: Buy energy pool size, regeneration rate, ability cooldown reduction, spell power
- **Visual**: Crystalline fragments that form complex patterns
- **Psychology**: Represents the mental sharpness and cognitive benefits of fasting
- **Reset**: Full reset on fast-break

#### 4. **Renewal (Healing/Recovery/Cellular Repair)** - *Persistent Stat*
- **Accumulation Rate Structure** (Autophagy Phases):
  - **Hours 0-12**: No Renewal generation (autophagy not active)
  - **Hours 12-18**: Initial rate 0.2 per hour (autophagy begins)
  - **Hours 18-24**: Accelerated rate 0.8 per hour (peak autophagy)
  - **Hours 24-30**: Enhanced rate 1.5 per hour (deep cellular repair)
  - **Hours 30+**: Maximum rate 2.5 per hour (optimal regeneration)
- **Use**: Buy passive regeneration, potion effectiveness, debuff resistance, anti-aging buffs
- **Visual**: DNA helix animations with repair particles
- **Psychology**: Represents cellular regeneration and anti-aging benefits
- **Special**: Does NOT reset on fast-break (represents long-term autophagy/cell repair)

### Secondary Stats & Currencies

#### 5. **Focus (In-Game Engagement)**
- **Source**: Streaks for checking in, questing, beating dungeons, educational module completion
- **Use**: Home base upgrades and facility improvements, unlock advanced training
- **Persistence**: Only stat that doesn't reset and measures in-game engagement
- **Bonus Sources**: Daily login (+1.0), dungeon completion (+2.0), educational engagement (+1.0 per module)

#### 6. **Materials (Dungeon Exploration)**
- **Source**: Exploring dungeons, defeating enemies, environmental harvesting
- **Types**: Common Ore, Rare Crystals, Ancient Relics, Corrupted Essence, Pure Elements
- **Use**: Trade for items/equipment at home base facilities, facility upgrades
- **Loss**: Lost upon death in dungeon (roguelite mechanic)
- **Storage**: Limited inventory encourages strategic dungeon runs

#### 7. **Kcal-Burned** (Real Metabolic Currency)
- **Source**: Real-time calculation based on BMR + activity level during fasting ONLY
- **Rate**: Continuous accumulation using established metabolic formulas
- **Display Format**: "Kcal-Burned: X.XX" with 2 decimal precision for micro-progress visibility
- **Update Frequency**: Every 10 seconds for smooth incremental satisfaction
- **Use**: Special metabolic upgrades, unlock advanced fasting insights, bonus stat multipliers
- **Visual**: Flame animations that intensify with activity level
- **Integrity**: No artificial bonuses - reflects true metabolic data only

#### 8. **Willpower Tokens** (Craving Resistance)
- **Source**: Logging and resisting cravings during fasting periods
- **Rate**: Each logged craving = 1 token + bonus Discipline points
- **Use**: Unlock advanced craving management techniques, special mental resistance abilities
- **Psychology**: Transforms negative experiences (cravings) into positive progression
- **Integration**: Triggers encouraging responses from in-game mentor characters

## Game Currencies

### 1. Time Crystals (Earned during fasting)
- **Source**: Passive generation while fasting
- **Use**: Unlock new abilities, upgrade equipment, purchase special items
- **Rate**: Increases the longer you maintain your fast

### 2. Willpower Shards (Earned during eating windows)
- **Source**: Completing quests during eating windows
- **Use**: Craft temporary buffs, repair equipment, purchase consumables

### 3. Metabolic Orbs (Rare, earned from achievements)
- **Source**: Reaching fasting milestones, completing special challenges
- **Use**: Unlock special abilities, legendary equipment, and permanent upgrades

## Home Base System
A customizable base with light customization options:
- **Name**: Custom base name
- **Emblem**: Custom base emblem/symbol
- **Buildings**: Up to 10 different facility types

### Home Base Facilities

#### **Core Facilities**
1. **Bazaar** - Trade materials for basic items and consumables
   - *Unlocks*: Equipment, potions, basic supplies
   - *Upgrades*: Better exchange rates, rare item availability, bulk trading

2. **Alchemy Labs** - Craft potions and temporary buffs
   - *Unlocks*: Health potions, energy elixirs, stat boosters
   - *Upgrades*: Advanced formulas, longer duration effects, batch brewing

3. **Forge** - Create and upgrade weapons and armor
   - *Unlocks*: Basic weapons, armor crafting, equipment repair
   - *Upgrades*: Legendary weapons, enchantments, modular equipment system

4. **Training Grounds** - Convert fasting stats into ARPG character stats
   - *Unlocks*: Stat conversion, basic combat techniques
   - *Upgrades*: Advanced training regimens, combat specializations, sparring partners

#### **Knowledge & Spiritual Facilities**
5. **Library** - Research new abilities and unlock skill trees
   - *Unlocks*: Skill trees, ability research, combat techniques
   - *Upgrades*: Advanced abilities, forbidden knowledge, ancient texts
   - *Educational Modules*: Micro-learning about fasting science, nutrition, meditation

6. **Meditation Garden** - Passive bonuses and stat multipliers
   - *Unlocks*: Passive stat regeneration, meditation techniques
   - *Upgrades*: Enhanced multipliers, advanced meditation states, zen gardens
   - *Features*: Virtual pet companions, ambient soundscapes, guided meditations

7. **Wisdom Hall** - Educational micro-learning center
   - *Modules*: Autophagy science, ketosis benefits, circadian rhythms, metabolic flexibility
   - *Rewards*: Focus points, Wisdom Tokens, stat bonuses for completed modules
   - *Format*: 2-3 minute interactive lessons with visual animations

#### **Utility & Storage Facilities**
8. **Armory** - Store and organize equipment
   - *Unlocks*: Equipment storage, loadout presets
   - *Upgrades*: Expanded storage, equipment comparison, auto-sorting

9. **Workshop** - Craft utility items and dungeon tools
   - *Unlocks*: Torches, lockpicks, exploration gear
   - *Upgrades*: Advanced tools, trap detection devices, mapping equipment

10. **Portal Chamber** - Access to different dungeon types and difficulties
    - *Unlocks*: Basic dungeons, difficulty selection
    - *Upgrades*: Elite dungeons, boss rushes, challenge modes

#### **Advanced Facilities** (Unlocked through Metabolic Cycles)
11. **Shrine of Renewal** - Spend Focus points for permanent base upgrades
    - *Unlocks*: Permanent stat bonuses, facility efficiency improvements
    - *Upgrades*: Legendary blessings, divine interventions

12. **Observatory** - Track celestial cycles and optimize fasting timing
    - *Features*: Circadian rhythm optimization, lunar cycle bonuses
    - *Benefits*: Enhanced stat accumulation during optimal times

## Dungeon System
- **Real-time combat** in procedurally generated dungeons
- **Materials** gathered from exploration and enemy defeats
- **Equipment loss** upon death (roguelite mechanic)
- **Scaling difficulty** based on accumulated fasting stats
- **Return to base** to spend materials and upgrade facilities

## Character Progression
**No Class System**: All characters progress through the same fasting-based stat system. Specialization comes through:
- **Equipment choices** (weapons, armor types)
- **Facility upgrades** (which stats to prioritize)
- **Skill tree selections** (unlocked through Library research)
- **Play style adaptation** (based on individual fasting patterns)

## Achievement & Trophy System

### Trophy Collection Interface
A dedicated "Trophy Hall" in your monastery where you can browse earned trophies, each featuring:
- **Unique Animal Mascot**: Procedurally generated cute animal faces (fox, owl, bear, rabbit, etc.)
- **Achievement Details**: Exact value that earned the trophy and timestamp
- **Trophy Material**: Bronze, Silver, Gold, Platinum based on difficulty
- **Commemorative Inscription**: Personal message describing the spiritual accomplishment

### Achievement Categories

#### **Fasting Duration Achievements**
- **Bronze Bunny** (First 12-hour fast): "Like rabbits who survive winter by slowing metabolism"
- **Silver Squirrel** (First 16-hour fast): "Squirrels fast between cached food sources, relying on stored energy"
- **Golden Owl** (First 24-hour fast): "Owls hunt successfully after 24+ hour fasts, focus sharpened by hunger"
- **Platinum Phoenix** (First 48-hour fast): "Like the mythical phoenix, you've emerged renewed through fasting regeneration"

#### **Combat & Dungeon Achievements**
- **Warrior Wolf** (Defeat 100 enemies while fasting): "Wolves hunt in packs during lean times"
- **Guardian Grizzly** (Complete 10 dungeons in single fast): "Bears emerge from hibernation stronger"
- **Shadow Panther** (Stealth kill 50 enemies): "Panthers hunt silently when food is scarce"
- **Dragon Slayer** (Defeat final boss): "Ancient dragons fast for centuries between meals"

#### **Streak & Consistency Achievements**
- **Consistency Koala** (7-day streak): "Koalas fast naturally during eucalyptus shortages"
- **Persistence Panda** (30-day streak): "Giant pandas show remarkable persistence through 30+ day food scarcities"
- **Dedication Dragon** (100-day streak): "Like Komodo dragons who survive 100+ days without food"

### Prestige System (Metabolic Cycles)
- **Rebirth Mechanics**: After reaching 72+ hour fasts, enter new "Metabolic Cycle"
- **Permanent Bonuses**: Each cycle grants +10% to all stat accumulation rates
- **Spiritual Evolution**: Unlock new abilities, advanced meditation techniques, legendary equipment
- **Visual Progression**: Character aura becomes more elaborate and powerful with each cycle
- **Monastery Upgrades**: Each cycle unlocks new facility types and customization options

## Technical Implementation

### Data Storage
- Local storage for game progress
- Cloud sync for cross-device play
- Fasting timer integration with health apps (Apple Health, Google Fit)

### Platform Support
- **Browser-based** for cross-platform compatibility
- **Click/tap controls** for both desktop and mobile
- **Always-online progression** (fasting continues even when device is off)
- **Lightweight JavaScript** implementation for performance

## Monetization (Optional)
- Cosmetic items only
- No pay-to-win mechanics
- Support for one-time purchases to remove ads
- Optional subscription for cloud sync and extra storage

## Development Roadmap

### Phase 1: Core Mechanics
- Basic character movement and combat
- Fasting timer integration
- Simple progression system

### Phase 2: Content Expansion
- Additional character classes
- More enemy types and environments
- Expanded quest system

### Phase 3: Polish & Community
- Multiplayer features
- Leaderboards and social sharing
- Community challenges and events

## Technical Considerations
- Battery-efficient background tracking
- Privacy-focused health data handling
- Offline functionality with cloud sync
- Cross-platform save compatibility

## Narrative Framework
### World Lore
**The Craving Consumed World**: Craving has consumed the world and its inhabitants. The monks live quietly and distributed in the sole locations free from toxic consumption.

**The Monk Order**: Represents reason - the most fundamental tool of conscious beings - in its war against craving, the consuming force that emboldens every detrimental emotion.

**Player Role**: As a monk, your discipline and focus slowly heal the world, starting with yourself. Your fasting practice directly translates to power in the spiritual/metaphysical realm where the battle against craving takes place.

### Thematic Elements
- **Monasteries** as safe havens (home bases)
- **Corrupted lands** as dungeons to cleanse
- **Craving manifestations** as enemies to defeat
- **Discipline auras** as visual representation of spiritual power
- **Renewal** as the long-term healing of both self and world

## Scientific Foundation & Educational Integration

### The Four Metabolic States (Reflected in Game Mechanics)

#### 1. **Fed State (0-4 hours)** - *Preparation Phase*
- **Real Biology**: Glucose from food intake, active fat storage, high insulin
- **Game Mechanics**: No stat accumulation, preparation time for fasting journey
- **Visual**: Character appears well-fed, normal aura, basic combat abilities

#### 2. **Post-Absorptive State (4-18 hours)** - *Early Fasting Phase*
- **Real Biology**: Liver glycogen reserves, glucagon secretion increases, improved insulin sensitivity
- **Game Mechanics**: Vitality and Discipline begin accumulating, basic stat bonuses
- **Visual**: Character becomes more focused, slight aura enhancement

#### 3. **Fasted State (12-36 hours)** - *Metabolic Switch Phase*
- **Real Biology**: Fat mobilization increases, ketone production begins, enhanced lipolysis
- **Game Mechanics**: Clarity generation starts, significant combat bonuses, enhanced abilities
- **Visual**: Strong aura effects, improved combat animations, mental clarity indicators

#### 4. **Deep Ketosis State (24+ hours)** - *Transcendent Phase*
- **Real Biology**: Peak autophagy, cellular repair, brain runs on ketones (30-40% energy needs)
- **Game Mechanics**: Renewal generation begins, maximum stat accumulation, legendary abilities unlock
- **Visual**: Powerful aura effects, transcendent animations, cellular repair visual effects

### Educational Micro-Learning Modules

#### **Module Categories** (Unlocked through Wisdom Hall)
1. **Autophagy & Cellular Repair**
   - *Content*: How fasting triggers cellular self-cleaning and regeneration
   - *Game Connection*: Explains Renewal stat accumulation and anti-aging buffs
   - *Visual*: Animated cellular processes, DNA repair sequences

2. **Ketosis & Brain Function**
   - *Content*: How ketones provide superior brain fuel and mental clarity
   - *Game Connection*: Explains Clarity stat benefits and cognitive enhancements
   - *Visual*: Brain energy pathways, neuron firing patterns

3. **Metabolic Flexibility**
   - *Content*: Body's ability to switch between glucose and fat as fuel sources
   - *Game Connection*: Explains stat progression phases and metabolic bonuses
   - *Visual*: Metabolic pathway diagrams, energy source transitions

4. **Circadian Rhythms & Timing**
   - *Content*: How meal timing affects metabolism and hormone cycles
   - *Game Connection*: Explains Observatory facility and optimal fasting windows
   - *Visual*: Circadian clock animations, hormone level graphs

5. **Hormonal Optimization**
   - *Content*: Growth hormone, insulin sensitivity, norepinephrine during fasting
   - *Game Connection*: Explains stat multipliers and bonus effects
   - *Visual*: Hormone level animations, cellular response mechanisms

### Real-World Health Integration

#### **Kcal-Burned Accuracy**
- **BMR Calculation**: Uses Mifflin-St Jeor equation for baseline metabolic rate
- **Activity Multipliers**: Sedentary (1.2), Light (1.375), Moderate (1.55), Active (1.725), Very Active (1.9)
- **Real-Time Updates**: Every 10 seconds for smooth progression feedback
- **Educational Value**: Teaches users about actual metabolic processes

#### **Hydration Tracking**
- **Water Intake Logging**: Cups or liters with conversion
- **Bonus Integration**: Hydration affects stat accumulation rates
- **Health Education**: Importance of electrolyte balance during fasting

#### **Craving Management**
- **Psychological Framework**: Transforms negative experiences into positive progression
- **Mindfulness Integration**: Logging cravings with reflection notes
- **Educational Content**: Understanding hunger vs. craving, psychological triggers
