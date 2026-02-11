## ADDED Requirements

### Requirement: README contains project introduction
README.md SHALL include a project title ("Rewire — 配電盤燒線模擬器") and a one-line description explaining the game concept.

#### Scenario: Visitor reads project title
- **WHEN** a visitor opens the repository root
- **THEN** they see the project name and understand it is an electrical panel wiring simulator game

### Requirement: README contains playable link
README.md SHALL include a prominent link to the live game at the GitHub Pages deployment URL.

#### Scenario: Visitor finds play link
- **WHEN** a visitor reads the README
- **THEN** they find a clearly visible link to https://kewang.github.io/rewire/ within the first few lines

### Requirement: README contains feature highlights
README.md SHALL list the key game features including: multi-circuit wiring, phase balancing, ELCB protection, crimp mini-game, old house repair mode, cable routing, random old house challenges, and 6-language i18n support.

#### Scenario: Visitor understands game depth
- **WHEN** a visitor reads the features section
- **THEN** they see a bulleted list of major gameplay features

### Requirement: README contains tech stack
README.md SHALL list the core technologies: React, TypeScript, Vite, react-i18next, SVG visualization, and Web Audio API.

#### Scenario: Developer identifies tech stack
- **WHEN** a developer reads the tech stack section
- **THEN** they see the frameworks and libraries used

### Requirement: README contains local development instructions
README.md SHALL provide step-by-step instructions to clone, install dependencies, and start the dev server (npm run dev), along with build (npm run build) and lint (npm run lint) commands.

#### Scenario: Developer runs project locally
- **WHEN** a developer follows the development instructions
- **THEN** they can successfully clone the repo, install dependencies, and start the dev server

### Requirement: README contains project structure overview
README.md SHALL include a brief directory tree showing top-level folders (src/components, src/engine, src/data, src/types, src/locales, docs, openspec) with one-line descriptions.

#### Scenario: Developer navigates codebase
- **WHEN** a developer reads the project structure section
- **THEN** they understand the purpose of each top-level directory

### Requirement: README contains deployment information
README.md SHALL mention that the project deploys to GitHub Pages automatically on push to master via GitHub Actions.

#### Scenario: Developer understands deployment
- **WHEN** a developer reads the deployment section
- **THEN** they know the deployment target and trigger mechanism

### Requirement: README contains license information
README.md SHALL include a License section. The specific license type SHALL be confirmed with the project owner.

#### Scenario: Visitor checks license
- **WHEN** a visitor looks for license information
- **THEN** they find a License section in the README
