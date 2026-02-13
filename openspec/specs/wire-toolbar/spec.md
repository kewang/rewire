## ADDED Requirements

### Requirement: WireToolbar renders as fixed bottom toolbar
The system SHALL render `WireToolbar` as a fixed bottom toolbar displaying wire cards horizontally and a power button on the right side. The toolbar SHALL replace the existing WireSelector and power button placement for floor plan levels.

#### Scenario: Toolbar displayed during wiring phase
- **WHEN** a floor plan level is active and planning is confirmed (or fixed-circuit level)
- **THEN** WireToolbar renders at the bottom with all available wire cards and power button

#### Scenario: Toolbar disabled during planning phase
- **WHEN** a FreeCircuitLevel with floorPlan is in planning phase (not yet confirmed)
- **THEN** WireToolbar wire cards are visually disabled (greyed out, no drag interaction)

### Requirement: WireToolbar displays wire cards horizontally
Each wire card SHALL show: wire gauge label, color indicator, cost per meter, and max current. Cards SHALL be arranged horizontally in a single row, scrollable on narrow viewports. Gauge label uses 0.875rem font, spec/cost text uses 0.8rem font.

#### Scenario: Wire cards display info
- **WHEN** WireToolbar is rendered
- **THEN** each wire card shows gauge (e.g. "2.0mm²") at 0.875rem, colored indicator matching wire color, cost per meter at 0.8rem, and max current rating

#### Scenario: Wire card drag interaction
- **WHEN** player initiates pointer drag on a wire card (or touch long-press)
- **THEN** drag interaction starts using the same Pointer Events logic as WireSelector (onDragStart/onDragMove/onDragEnd callbacks)

### Requirement: WireToolbar includes power button
The power button SHALL be positioned at the right end of the toolbar with min-height 40px, padding var(--space-sm) var(--space-lg), and font-size 0.875rem. It SHALL show "送電" (with ⚡ icon) when ready to power on, and "斷電" (with ⏹ icon) when powered. The button SHALL be disabled when preconditions are not met.

#### Scenario: Power button enabled
- **WHEN** all circuits are wired, all old house problems resolved, and routing complete (if applicable)
- **THEN** power button is enabled with "送電" label

#### Scenario: Power button disabled with tooltip
- **WHEN** preconditions for powering on are not met
- **THEN** power button is disabled and shows tooltip listing missing conditions

#### Scenario: Power button toggles power
- **WHEN** player clicks enabled power button
- **THEN** power state toggles (on/off) and simulation starts/stops accordingly

### Requirement: Mobile horizontal scroll
The WireToolbar card container SHALL support horizontal scrolling on narrow screens where all 6 cards cannot fit within the viewport width.

#### Scenario: Mobile viewport with 6 wire cards
- **WHEN** viewport width is ≤640px and WireToolbar displays 6 wire cards
- **THEN** the card container scrolls horizontally with hidden scrollbar, each card maintains minimum touch-friendly size (60px width)

### Requirement: Scroll affordance indicator
The WireToolbar SHALL show a visual cue that more cards are available when scrolled.

#### Scenario: Cards overflow to the right
- **WHEN** wire cards extend beyond the visible area
- **THEN** a subtle gradient fade appears on the right edge indicating more content is available
