## ADDED Requirements

### Requirement: Per-component CSS files
Each React component SHALL have its own CSS file co-located in the same directory, imported via side-effect import.

#### Scenario: Component imports its own CSS
- **WHEN** a component's styles are extracted from App.css
- **THEN** the component file SHALL contain `import './ComponentName.css'`
- **AND** the CSS file SHALL contain only styles used by that component
- **AND** App.css SHALL no longer contain those styles
