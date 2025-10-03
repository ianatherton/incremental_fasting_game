# ARPG Character Prototype

A modular character assembly system for an Action RPG, built with HTML5 Canvas and JavaScript.

## Features

### Character Assembly
- **Modular sprite system**: Character built from separate sprite pieces (torso, legs, arms, fists, weapon)
- **Dynamic part toggling**: Enable/disable character parts in real-time
- **Layered rendering**: Proper sprite layering for realistic character appearance

### Movement & Controls
- **WASD movement**: Smooth 8-directional movement
- **Mouse look**: Character rotates to face mouse cursor
- **Boundary detection**: Character stays within canvas bounds

### Combat System
- **Attack animations**: Spacebar triggers attack state with visual feedback
- **State management**: Idle, walking, and attacking states with smooth transitions
- **Weapon attachment**: Sword can be toggled on/off

### Animation System
- **Walking animation**: Subtle bobbing effect during movement
- **Attack animation**: Enhanced movement during attack state
- **Frame-based timing**: Consistent animation timing across different framerates

## Controls

| Input | Action |
|-------|--------|
| WASD | Move character |
| Mouse | Aim/look direction |
| Spacebar | Attack |
| Toggle Arms button | Show/hide arms and fists |
| Toggle Weapon button | Show/hide weapon |
| Reset Position button | Return to center |

## Technical Implementation

### Character Class
- Modular sprite loading and management
- State-based animation system
- Collision detection and boundary checking
- Rotation and positioning calculations

### Game Class
- Main game loop with delta time
- Input handling for keyboard and mouse
- Canvas rendering with layered graphics
- UI integration and real-time updates

## File Structure
```
arpg_prototype/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # Game styling
├── js/
│   ├── character.js       # Character assembly and logic
│   └── game.js           # Main game loop and input
└── assets/
    └── sprites/
        ├── character/     # Character part sprites
        └── items/         # Weapon and item sprites
```

## Running the Prototype

1. Open `index.html` in a web browser
2. Use WASD to move around
3. Move mouse to aim
4. Press spacebar to attack
5. Use UI buttons to toggle character parts

## Next Steps

- Add more weapon types and attachment points
- Implement different character classes/builds
- Add enemy sprites and combat mechanics
- Create inventory system for equipment
- Add sound effects and particle systems
