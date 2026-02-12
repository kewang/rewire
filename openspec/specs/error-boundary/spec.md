## ADDED Requirements

### Requirement: Error Boundary catches render errors
The system SHALL include a React Error Boundary component that catches JavaScript errors during rendering, in lifecycle methods, and in constructors of the component tree below it. When an error is caught, the Error Boundary SHALL prevent the entire React tree from unmounting.

#### Scenario: Component throws during render
- **WHEN** any component within the Error Boundary tree throws an error during rendering
- **THEN** the Error Boundary catches the error and displays a fallback UI instead of a white screen

#### Scenario: Error is logged to console
- **WHEN** an error is caught by the Error Boundary
- **THEN** the full error message and component stack trace are logged via `console.error`

### Requirement: Game-level Error Boundary with recovery
The system SHALL wrap the GameBoard component with an Error Boundary that displays a fallback UI containing an error message and a "back to level select" button. Clicking the button SHALL reset the Error Boundary state and navigate back to the level selection screen.

#### Scenario: Game error recovery
- **WHEN** GameBoard throws a render error
- **THEN** the user sees an error message and a "back to level select" button
- **WHEN** the user clicks the "back to level select" button
- **THEN** the error state is cleared and the level selection screen is displayed

### Requirement: App-level Error Boundary as last resort
The system SHALL wrap the entire App with a top-level Error Boundary that displays a fallback UI containing an error message and a "reload" button. This serves as a last-resort safety net when the game-level boundary itself fails.

#### Scenario: App-level fallback
- **WHEN** an error occurs outside the GameBoard Error Boundary (e.g., in LevelSelect)
- **THEN** the user sees a top-level error message and a "reload page" button
- **WHEN** the user clicks "reload page"
- **THEN** the page is reloaded via `window.location.reload()`

### Requirement: Error messages support i18n
Error fallback UI text SHALL be translated into all six supported languages (zh-TW, en, ja, ko, fr, th). If i18n is not available (initialization failure), the fallback SHALL display hardcoded English text as a default.

#### Scenario: Error message in user's language
- **WHEN** the user's language is set to Japanese and an error occurs
- **THEN** the error message and button text are displayed in Japanese

#### Scenario: i18n unavailable fallback
- **WHEN** i18n initialization itself has failed and an error occurs
- **THEN** the error message is displayed in English as a hardcoded default

### Requirement: Fallback UI matches game theme
The error fallback UI SHALL use the game's dark theme (background `#0a0c0f`, text `#e8ecf0`) and be visually consistent with the game's industrial aesthetic. The fallback SHALL NOT appear as a generic browser error page.

#### Scenario: Visual consistency
- **WHEN** an error fallback is displayed
- **THEN** the background, text colors, and typography match the game's existing dark theme
