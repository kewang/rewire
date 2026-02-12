## ADDED Requirements

### Requirement: All CSS variable references resolve to defined values
Every `var(--*)` reference in `src/App.css` SHALL resolve to a variable defined in `src/index.css`. No undefined variable references SHALL exist.

#### Scenario: Random card gradient uses defined color
- **WHEN** `.random-card::before` gradient is rendered
- **THEN** `var(--color-accent-red)` is used instead of undefined `var(--color-status-danger)`

#### Scenario: Random card completions text color
- **WHEN** `.random-card-completions` is rendered
- **THEN** `var(--color-accent-green)` is used instead of undefined `var(--color-status-safe)`

#### Scenario: ELCB checkbox accent color
- **WHEN** `.elcb-toggle input[type="checkbox"]` is rendered
- **THEN** `var(--color-accent-amber)` is used instead of undefined `var(--color-accent)`

#### Scenario: Active circuit tab uses defined accent
- **WHEN** `.circuit-tab.active` is rendered
- **THEN** border and text color use `var(--color-accent-amber)` instead of undefined `var(--color-accent)`

#### Scenario: Voltage-disabled card hover background
- **WHEN** `.card.voltage-disabled:hover` is rendered
- **THEN** `var(--color-bg-card)` is used instead of undefined `var(--color-surface-card)`

#### Scenario: Routing button uses defined variables
- **WHEN** `.routing-button` is rendered
- **THEN** border/color use `var(--color-accent-copper)` and border-radius uses `var(--radius-md)`

#### Scenario: Aesthetics score border uses defined variable
- **WHEN** `.aesthetics-score-line` is rendered
- **THEN** border uses `var(--color-border)` instead of undefined `var(--border)`

#### Scenario: Floor plan power button uses defined color
- **WHEN** `.fp-power-button` is rendered
- **THEN** border/color use `var(--color-accent-green)` instead of undefined `var(--color-success)`

### Requirement: Hardcoded colors use CSS variables
Color values for themed elements SHALL reference CSS variables instead of hardcoded hex values.

#### Scenario: Star achieved color
- **WHEN** `.star-achieved` is rendered
- **THEN** color is `var(--color-accent-green)` instead of `#22c55e`

#### Scenario: Aesthetics score colors
- **WHEN** `.aesthetics-score-value.score-green/yellow/red` is rendered
- **THEN** colors use `var(--color-accent-green/amber/red)` respectively

#### Scenario: Panel score colors
- **WHEN** `.panel-score-value.score-perfect/bad` is rendered
- **THEN** colors use `var(--color-accent-green/red)` respectively
