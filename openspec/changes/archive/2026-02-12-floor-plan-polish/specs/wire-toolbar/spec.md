## MODIFIED Requirements

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
