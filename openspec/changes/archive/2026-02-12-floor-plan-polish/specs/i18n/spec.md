## MODIFIED Requirements

### Requirement: Floor plan components i18n completeness
All user-visible text strings in floor plan components (FloorPlanView, CircuitPlannerSidebar, WireToolbar, CircuitAssignmentPopover, RoutingStrategyPicker) SHALL use i18n translation keys. No hardcoded Chinese or English strings SHALL remain in these components.

#### Scenario: Switch to non-default language
- **WHEN** user switches language to English (or any of the 6 supported languages)
- **THEN** all text in floor plan mode components displays in the selected language with no untranslated fallbacks

#### Scenario: New i18n keys present in all 6 locales
- **WHEN** a new i18n key is added for floor plan polish
- **THEN** the key has translations in all 6 locale files (zh-TW, en, ja, ko, fr, th)
