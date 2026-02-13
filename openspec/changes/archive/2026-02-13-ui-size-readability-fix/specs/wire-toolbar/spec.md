## MODIFIED Requirements

### Requirement: WireToolbar displays wire cards horizontally
Each wire card SHALL show: wire gauge label at **0.875rem** (was 0.8rem), color indicator, cost per meter at **0.8rem** (was 0.72rem), and max current at **0.8rem** (was 0.72rem). Cards SHALL be arranged horizontally in a single row, scrollable on narrow viewports.

#### Scenario: Wire card text sizes
- **WHEN** WireToolbar is rendered
- **THEN** `.wire-toolbar__gauge` has font-size 0.875rem, `.wire-toolbar__spec` and `.wire-toolbar__cost` have font-size 0.8rem

### Requirement: WireToolbar includes power button
The power button SHALL have **min-height 40px**, **padding 8px 16px**, and **font-size 0.875rem** for adequate touch target and readability.

#### Scenario: Power button touch target
- **WHEN** WireToolbar renders the power button
- **THEN** the button has min-height ≥ 40px and padding ≥ 8px 16px
