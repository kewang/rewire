## ADDED Requirements

### Requirement: Vitest framework installation
The system SHALL have `vitest` installed as a devDependency.

#### Scenario: Vitest is available
- **WHEN** `npx vitest --version` is run
- **THEN** it SHALL output a valid version number without errors

### Requirement: Test npm script
The system SHALL have a `test` script in `package.json` that runs vitest.

#### Scenario: Run tests via npm
- **WHEN** `npm run test` is executed
- **THEN** vitest SHALL discover and run all `*.test.ts` files under `src/`

### Requirement: Vitest configuration
The system SHALL configure vitest in `vite.config.ts` with `environment: 'node'` for pure function testing.

#### Scenario: TypeScript test files work without extra config
- **WHEN** a `.test.ts` file imports from `src/engine/*.ts`
- **THEN** vitest SHALL resolve TypeScript imports and execute the test without errors

### Requirement: Test file convention
Test files SHALL be placed in `__tests__/` directories adjacent to the modules they test, with the naming pattern `<module>.test.ts`.

#### Scenario: Test discovery
- **WHEN** vitest runs
- **THEN** it SHALL find tests in `src/engine/__tests__/` and `src/types/__tests__/`
