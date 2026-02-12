### Requirement: Sidebar expand-collapse transition
The CircuitPlannerSidebar SHALL animate its width change with a CSS transition (0.25s ease) when toggling between expanded and collapsed states.

#### Scenario: Sidebar collapses with animation
- **WHEN** user clicks the collapse button on the sidebar
- **THEN** the sidebar width animates from 280px to 48px over 0.25s with ease timing, content hidden via overflow:hidden during transition

#### Scenario: Sidebar expands with animation
- **WHEN** user clicks the expand button on the collapsed sidebar
- **THEN** the sidebar width animates from 48px to 280px over 0.25s with ease timing

### Requirement: Popover entrance animation
The CircuitAssignmentPopover SHALL display an entrance animation when appearing.

#### Scenario: Popover opens with fade-slide
- **WHEN** a room is clicked and the popover appears
- **THEN** the popover fades in (opacity 0→1) and slides up (translateY 8px→0) over 0.15s ease-out

### Requirement: Power button state transition
The power button (WireToolbar and fp-power-button) SHALL have a visual transition when toggling between power-on and power-off states.

#### Scenario: Power on visual feedback
- **WHEN** user clicks the power button to energize
- **THEN** the button transitions to active state with a brief scale pulse (1.0→1.05→1.0, 0.2s) and color change
