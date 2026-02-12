## ADDED Requirements

### Requirement: Interactive elements have focus-visible states
All primary interactive elements (buttons, cards) SHALL display a visible outline when focused via keyboard navigation using `:focus-visible`.

#### Scenario: Level card keyboard focus
- **WHEN** `.level-card` receives keyboard focus
- **THEN** a 2px `--color-accent-amber` outline with 2px offset is displayed

#### Scenario: Random card keyboard focus
- **WHEN** `.random-card` receives keyboard focus
- **THEN** a 2px `--color-accent-amber` outline with 2px offset is displayed

#### Scenario: Retry button keyboard focus
- **WHEN** `.retry-button` receives keyboard focus
- **THEN** a 2px `--color-accent-green` outline with 2px offset is displayed

#### Scenario: Back button keyboard focus
- **WHEN** `.back-button` receives keyboard focus
- **THEN** a 2px `--color-accent-amber` outline with 2px offset is displayed

#### Scenario: Confirm planning button keyboard focus
- **WHEN** `.confirm-planning-btn` receives keyboard focus
- **THEN** a 2px `--color-accent-green` outline with 2px offset is displayed

#### Scenario: Sidebar confirm button keyboard focus
- **WHEN** `.sidebar-confirm-btn` receives keyboard focus
- **THEN** a 2px `--color-accent-green` outline with 2px offset is displayed

#### Scenario: Wire toolbar power button keyboard focus
- **WHEN** `.wire-toolbar__power` receives keyboard focus
- **THEN** a 2px `--color-accent-green` outline with 2px offset is displayed

#### Scenario: Floor plan power button keyboard focus
- **WHEN** `.fp-power-button` receives keyboard focus
- **THEN** a 2px `--color-accent-green` outline with 2px offset is displayed

### Requirement: Cards have active press states
Clickable card elements SHALL display a press feedback on `:active`.

#### Scenario: Level card active press
- **WHEN** `.level-card` is pressed
- **THEN** transform resets to `translateY(0)` (cancelling hover lift)

#### Scenario: Random card active press
- **WHEN** `.random-card` is pressed
- **THEN** transform resets to `translateY(0)`

#### Scenario: Retry button active press
- **WHEN** `.retry-button` is pressed
- **THEN** transform resets to `translateY(0)`

#### Scenario: Back button active press
- **WHEN** `.back-button` is pressed
- **THEN** transform resets to `translateY(0)`
