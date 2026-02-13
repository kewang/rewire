## ADDED Requirements

### Requirement: GameBoard and VolumeControl CSS extraction
GameBoard and VolumeControl styles SHALL be in their own co-located CSS files.

#### Scenario: CSS files created and imported
- **WHEN** the extraction is complete
- **THEN** `GameBoard.css` and `VolumeControl.css` exist in `src/components/`
- **AND** each component imports its own CSS
- **AND** App.css no longer contains those styles
