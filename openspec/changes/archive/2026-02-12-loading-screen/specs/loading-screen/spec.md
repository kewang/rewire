## ADDED Requirements

### Requirement: Loading screen displays immediately on page load
The system SHALL render a loading screen inside `<div id="root">` using inline HTML and CSS in `index.html`. The loading screen MUST be visible before any JavaScript bundle is parsed or executed.

#### Scenario: First visit with empty cache
- **WHEN** a user navigates to the game URL for the first time (no cached assets)
- **THEN** the loading screen is displayed within the browser's first contentful paint, showing the game title and a loading animation

#### Scenario: Slow network connection
- **WHEN** the JS bundle takes more than 1 second to download
- **THEN** the user sees the loading screen with an animated indicator throughout the wait

### Requirement: Loading screen matches game visual theme
The loading screen SHALL use the game's dark theme colors: background `#0a0c0f`, text `#e8ecf0`, accent colors consistent with the existing CSS variable theme. The game title "Rewire" SHALL be displayed using a style consistent with the Orbitron display font (with fallback to system fonts).

#### Scenario: Visual consistency
- **WHEN** the loading screen is displayed
- **THEN** the background color is `#0a0c0f`, text is light-colored, and the overall aesthetic matches the game's industrial dark theme

### Requirement: Loading screen auto-removed on React mount
The loading screen content inside `<div id="root">` SHALL be automatically replaced when React calls `createRoot(root).render(...)`. No manual DOM cleanup code is required.

#### Scenario: React mount replaces loading screen
- **WHEN** the React application finishes mounting
- **THEN** the loading screen content is replaced by the game UI without any visible layout shift or flash

#### Scenario: Fast load (cached assets)
- **WHEN** assets are already cached and React mounts within 300ms
- **THEN** the loading screen is either not visible or appears only briefly, without causing a jarring flash

### Requirement: Loading animation is CSS-only
The loading animation SHALL use pure CSS `@keyframes` animations with no JavaScript dependency. The animation SHALL evoke an electrical/circuit theme consistent with the game's identity.

#### Scenario: Animation runs without JS
- **WHEN** the HTML is parsed but JS bundle has not yet loaded
- **THEN** the loading animation is running smoothly using CSS-only rendering

### Requirement: Loading screen size budget
The total inline HTML and CSS for the loading screen SHALL be less than 5 KB (uncompressed), to fit within the initial TCP congestion window and not delay first contentful paint.

#### Scenario: Size verification
- **WHEN** measuring the loading screen markup and styles in index.html
- **THEN** the total added content is less than 5 KB
