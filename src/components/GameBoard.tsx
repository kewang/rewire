import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './GameBoard.css';
import type { Wire, Level, CircuitId, CircuitConfig } from '../types/game';
import { DEFAULT_WIRES, DEFAULT_WIRE_LENGTH, ELCB_COST, NFB_COSTS } from '../data/constants';
import { LEVELS } from '../data/levels';
import { isFixedCircuitLevel, isFreeCircuitLevel } from '../types/helpers';
import { createInitialMultiState } from '../engine/simulation';
import WireSelector from './WireSelector';
import AppliancePanel from './AppliancePanel';
import StatusDisplay from './StatusDisplay';
import ResultPanel from './ResultPanel';
import LevelSelect from './LevelSelect';
import CircuitDiagram from './CircuitDiagram';
import CrimpMiniGame from './CrimpMiniGame';
import PanelInteriorView from './PanelInteriorView';
import FloorPlanPreview from './FloorPlanPreview';
import FloorPlanView from './FloorPlanView';
import RoutingStrategyPicker from './RoutingStrategyPicker';
import CircuitPlanner from './CircuitPlanner';
import CircuitPlannerSidebar from './CircuitPlannerSidebar';
import WireToolbar from './WireToolbar';
import CircuitAssignmentPopover from './CircuitAssignmentPopover';
import { tLevelName, tLevelDesc, tRoomName } from '../i18nHelpers';
import VolumeControl from './VolumeControl';
import { usePlannerState } from '../hooks/usePlannerState';
import { useCircuitState, createInitialWiring } from '../hooks/useCircuitState';
import { useOldHouseLogic } from '../hooks/useOldHouseLogic';
import { useFloorPlanInteraction } from '../hooks/useFloorPlanInteraction';
import { useSimulationLoop } from '../hooks/useSimulationLoop';
import { useRoutingOverlay } from '../hooks/useRoutingOverlay';
import { useRef } from 'react';

export default function GameBoard() {
  const { t } = useTranslation();
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [resolvedConfigs, setResolvedConfigs] = useState<CircuitConfig[]>([]);

  const isFreeLevel = currentLevel != null && isFreeCircuitLevel(currentLevel);
  const currentFloorPlan = currentLevel?.floorPlan;
  const circuitConfigs = resolvedConfigs;
  const circuitIdsFromConfigs = useMemo(() => circuitConfigs.map(c => c.id), [circuitConfigs]);

  // Shared refs to break circular dependencies between hooks
  const initiateFloorPlanWiringRef = useRef<(circuitId: CircuitId, wire: Wire) => void>(() => {});
  const floorPlanHighlightedRoomRef = useRef<string | null>(null);
  const circuitRouteDistancesRef = useRef<Record<CircuitId, number>>({});

  // === Hook: Planner State (includes roomToCircuitMap) ===
  const planner = usePlannerState({ currentLevel, currentFloorPlan });

  // === Hook: Circuit State (includes circuits derivation) ===
  const circuitState = useCircuitState({
    currentLevel,
    circuitConfigs,
    circuitBreakers: {}, // Will be overridden after oldHouse hook; initial empty is safe since oldHouse.circuitBreakers isn't available yet
    initiateFloorPlanWiringRef,
    floorPlanHighlightedRoomRef,
    currentFloorPlan,
    roomToCircuitMap: planner.roomToCircuitMap,
  });

  // === Hook: Old House Logic ===
  const oldHouse = useOldHouseLogic({
    currentLevel,
    circuitWires: circuitState.circuitWires,
    circuitCrimps: circuitState.circuitCrimps,
    circuitElcb: circuitState.circuitElcb,
    wiring: circuitState.wiring,
    setCircuitWires: circuitState.setCircuitWires,
    setCircuitCrimps: circuitState.setCircuitCrimps,
    setCircuitAppliances: circuitState.setCircuitAppliances,
    setWiring: circuitState.setWiring,
    setCircuitElcb: circuitState.setCircuitElcb,
  });

  // Re-derive circuits with actual circuitBreakers from oldHouse
  // (useCircuitState gets empty circuitBreakers initially; this useMemo ensures correct derivation)
  const circuits = useMemo(() =>
    circuitConfigs.map(config => ({
      id: config.id,
      label: tRoomName(t, config.label),
      voltage: config.voltage,
      breaker: oldHouse.circuitBreakers[config.id] ?? config.breaker,
      wire: circuitState.circuitWires[config.id] ?? DEFAULT_WIRES[0],
      appliances: circuitState.circuitAppliances[config.id] ?? [],
      contactResistance: circuitState.circuitCrimps[config.id]?.contactResistance,
    })),
    [circuitConfigs, circuitState.circuitWires, circuitState.circuitAppliances, circuitState.circuitCrimps, oldHouse.circuitBreakers, t]
  );
  const circuitsRef = useRef(circuits);
  useEffect(() => { circuitsRef.current = circuits; }, [circuits]);

  // Derived: canPowerOn
  const allAppliances = useMemo(() =>
    circuitIdsFromConfigs.flatMap(id => circuitState.circuitAppliances[id] ?? []),
    [circuitIdsFromConfigs, circuitState.circuitAppliances]
  );
  const allWired = circuitIdsFromConfigs.length > 0 && circuitIdsFromConfigs.every(id => circuitState.wiring.circuits[id]?.isWired);
  const wetAreaMissingElcb = circuitConfigs.some(c => c.wetArea && !circuitState.circuitElcb[c.id]);
  const crimpMissing = currentLevel?.requiresCrimp === true && !circuitIdsFromConfigs.every(id => circuitState.circuitCrimps[id]);
  const problemsRemaining = oldHouse.problemCircuits.size > 0;

  // === Hook: Routing Overlay ===
  const routing = useRoutingOverlay({
    circuitConfigs,
    circuitPhases: circuitState.circuitPhases,
    requiresRouting: currentLevel?.requiresRouting === true,
  });

  const routingMissing = currentLevel?.requiresRouting === true && !routing.routingCompleted;
  const canPowerOn = allAppliances.length > 0 && allWired && !wetAreaMissingElcb && !crimpMissing && !problemsRemaining && !routingMissing;
  const routingReady = currentLevel?.requiresRouting === true && allWired && !crimpMissing && !problemsRemaining;

  // === Hook: Simulation Loop ===
  const sim = useSimulationLoop({
    circuitsRef,
    circuitPhasesRef: circuitState.circuitPhasesRef,
    circuitElcbRef: circuitState.circuitElcbRef,
    currentLevel,
    resolvedConfigs,
    preWiredCircuitIdsRef: oldHouse.preWiredCircuitIdsRef,
    circuitWiresRef: circuitState.circuitWiresRef,
    circuitRouteDistancesRef,
    circuitCrimpsRef: circuitState.circuitCrimpsRef,
    aestheticsScoreRef: routing.aestheticsScoreRef,
    canPowerOn,
    circuitIds: circuitIdsFromConfigs,
    allAppliances,
  });

  // === Hook: Floor Plan Interaction ===
  const floorPlanInteraction = useFloorPlanInteraction({
    currentLevel,
    circuitIds: circuitIdsFromConfigs,
    circuitWires: circuitState.circuitWires,
    wiring: circuitState.wiring,
    multiState: sim.multiState,
    roomToCircuitMap: planner.roomToCircuitMap,
    currentFloorPlan,
    isPowered: sim.isPowered,
    problemCircuits: oldHouse.problemCircuits,
    setCircuitWires: circuitState.setCircuitWires,
    setCircuitCrimps: circuitState.setCircuitCrimps,
    setWiring: circuitState.setWiring,
    setPendingCrimpCircuitId: circuitState.setPendingCrimpCircuitId,
    setPendingCrimpWire: circuitState.setPendingCrimpWire,
    requiresCrimp: currentLevel?.requiresCrimp === true,
    circuitRouteDistancesRef,
    floorPlanHighlightedRoomRef,
  });

  // Wire initiateFloorPlanWiring ref
  useEffect(() => {
    initiateFloorPlanWiringRef.current = floorPlanInteraction.initiateFloorPlanWiring;
  }, [floorPlanInteraction.initiateFloorPlanWiring]);

  // Total cost
  const totalCost = useMemo(() => circuitIdsFromConfigs.reduce((sum, id) => {
    const elcbCost = circuitState.circuitElcb[id] ? ELCB_COST : 0;
    if (oldHouse.preWiredCircuitIds.has(id)) return sum + elcbCost;
    const wire = circuitState.circuitWires[id] ?? DEFAULT_WIRES[0];
    const wireLength = floorPlanInteraction.circuitRouteDistances[id] ?? DEFAULT_WIRE_LENGTH;
    const config = circuitConfigs.find(c => c.id === id);
    const nfbCost = isFreeLevel && config ? (NFB_COSTS[config.breaker.ratedCurrent] ?? 0) : 0;
    return sum + wire.costPerMeter * wireLength + elcbCost + nfbCost;
  }, 0), [circuitIdsFromConfigs, circuitState.circuitWires, circuitState.circuitElcb, oldHouse.preWiredCircuitIds, circuitConfigs, isFreeLevel, floorPlanInteraction.circuitRouteDistances]);

  // Translated level name/description
  const currentLevelIndex = currentLevel ? LEVELS.indexOf(currentLevel) : -1;
  const isRandomLevel = currentLevel && isFixedCircuitLevel(currentLevel) && currentLevel.randomDifficulty != null;
  const DIFFICULTY_NAMES: Record<number, string> = { 1: t('random.beginner'), 2: t('random.intermediate'), 3: t('random.advanced') };
  const translatedLevelName = currentLevel
    ? (isRandomLevel && isFixedCircuitLevel(currentLevel)
      ? t('random.levelName', { difficulty: DIFFICULTY_NAMES[currentLevel.randomDifficulty!] })
      : currentLevelIndex >= 0 ? tLevelName(t, currentLevelIndex) : currentLevel.name)
    : '';
  const translatedLevelDesc = currentLevel
    ? (currentLevelIndex >= 0 ? tLevelDesc(t, currentLevelIndex) : currentLevel.description)
    : '';

  const hasAnyElcbOption = circuitConfigs.some(c => c.elcbAvailable);
  const isOldHouse = currentLevel != null && isFixedCircuitLevel(currentLevel) && !!currentLevel.oldHouse;
  const oldHouseProblems = isOldHouse && isFixedCircuitLevel(currentLevel!) ? currentLevel!.oldHouse?.problems : undefined;

  // Confirm planning wrapper
  const handleConfirmPlanning = useCallback(() => {
    const result = planner.handleConfirmPlanning();
    if (!result) return;
    setResolvedConfigs(result.resolvedConfigs);
    circuitState.setCircuitWires(result.circuitWires);
    circuitState.setCircuitAppliances(result.circuitAppliances);
    circuitState.setCircuitCrimps({});
    circuitState.setWiring(result.wiring);
    circuitState.setCircuitPhases(result.circuitPhases);
    circuitState.setCircuitElcb(result.circuitElcb);
    sim.setMultiState(createInitialMultiState(result.circuitIds));
    sim.setResult('none');
    sim.setResolvedLeakageEvents(result.resolvedLeakageEvents);
    routing.reset(result.circuitIds);
  }, [planner, circuitState, sim, routing]);

  // === Level management ===
  const handleSelectLevel = useCallback((level: Level) => {
    setCurrentLevel(level);

    if (isFreeCircuitLevel(level)) {
      planner.reset(level);
      setResolvedConfigs([]);
      circuitState.reset([], level);
      sim.reset([]);
      oldHouse.reset();
      floorPlanInteraction.reset();
      routing.reset([]);
      return;
    }

    // Fixed circuit level
    planner.reset(level);
    const ids = level.circuitConfigs.map(c => c.id);
    setResolvedConfigs([...level.circuitConfigs]);

    if (level.oldHouse) {
      oldHouse.initOldHouse(level);
      const phases: Record<CircuitId, 'R' | 'T'> = {};
      for (const config of level.circuitConfigs) {
        if (config.phase) phases[config.id] = config.phase;
      }
      circuitState.setCircuitPhases(phases);
    } else {
      circuitState.reset(ids, level);
      oldHouse.reset();
    }

    sim.reset(ids);
    floorPlanInteraction.reset();
    routing.reset(ids, level.initialLanes);
  }, [planner, circuitState, sim, oldHouse, floorPlanInteraction, routing]);

  const handleRetry = useCallback(() => {
    sim.reset(circuitIdsFromConfigs);
    circuitState.setPendingCrimpCircuitId(null);
    circuitState.setPendingCrimpWire(null);
    floorPlanInteraction.reset();
    const initialLanes = currentLevel && isFixedCircuitLevel(currentLevel) ? currentLevel.initialLanes : undefined;
    routing.reset(circuitIdsFromConfigs, initialLanes);

    if (currentLevel && isFreeCircuitLevel(currentLevel)) {
      planner.reset(currentLevel);
      setResolvedConfigs([]);
      circuitState.reset([], currentLevel);
      oldHouse.reset();
    } else if (currentLevel && isFixedCircuitLevel(currentLevel) && currentLevel.oldHouse) {
      oldHouse.initOldHouse(currentLevel);
      const phases: Record<CircuitId, 'R' | 'T'> = {};
      for (const config of currentLevel.circuitConfigs) {
        if (config.phase) phases[config.id] = config.phase;
      }
      circuitState.setCircuitPhases(phases);
    } else {
      circuitState.setWiring(createInitialWiring(circuitIdsFromConfigs));
      circuitState.setCircuitCrimps({});
    }
  }, [circuitIdsFromConfigs, currentLevel, planner, circuitState, sim, oldHouse, floorPlanInteraction, routing]);

  const handleBackToLevels = useCallback(() => {
    sim.reset([]);
    circuitState.reset([], null);
    oldHouse.reset();
    floorPlanInteraction.reset();
    planner.reset(null);
    setResolvedConfigs([]);
    routing.reset([]);
    setCurrentLevel(null);
  }, [sim, circuitState, oldHouse, floorPlanInteraction, planner, routing]);

  // Level select screen
  if (!currentLevel) {
    return (
      <>
        <LevelSelect levels={LEVELS} onSelect={handleSelectLevel} />
        <FloorPlanPreview />
      </>
    );
  }

  // Planning phase for free circuit levels
  if (planner.gamePhase === 'planning' && isFreeCircuitLevel(currentLevel)) {
    if (currentFloorPlan) {
      return (
        <div className="game-board fp-layout planning-phase">
          <header className="game-header">
            <div className="header-top">
              <button className="back-button" onClick={handleBackToLevels}>← {t('nav.back')}</button>
              <h1>{translatedLevelName}</h1>
              <span className="level-goal">{t('game.powerTimeBudget', { time: currentLevel.survivalTime, budget: currentLevel.budget })}</span>
              <VolumeControl />
            </div>
          </header>

          <div className="fp-main">
            <CircuitPlannerSidebar
              level={currentLevel}
              circuits={planner.plannerCircuits}
              totalCost={planner.plannerTotalCost}
              canConfirm={planner.plannerCanConfirm}
              confirmTooltip={planner.plannerConfirmTooltip}
              collapsed={floorPlanInteraction.sidebarCollapsed}
              onToggleCollapse={() => floorPlanInteraction.setSidebarCollapsed(prev => !prev)}
              selectedCircuitId={planner.selectedPlannerCircuitId}
              onSelectCircuit={planner.setSelectedPlannerCircuitId}
              onAddCircuit={planner.handleAddPlannerCircuit}
              onDeleteCircuit={planner.handleDeletePlannerCircuit}
              onChangeVoltage={planner.handleChangePlannerVoltage}
              onChangeBreaker={planner.handleChangePlannerBreaker}
              onSelectWire={planner.handleSelectPlannerWire}
              onAssignAppliance={planner.handleAssignAppliance}
              onUnassignAppliance={planner.handleUnassignPlannerAppliance}
              onChangePhase={planner.handleChangePlannerPhase}
              onChangeElcb={planner.handleChangePlannerElcb}
              onConfirm={handleConfirmPlanning}
            />

            <div className="fp-center">
              <FloorPlanView
                floorPlan={currentFloorPlan}
                circuitAssignments={floorPlanInteraction.floorPlanCircuitAssignments}
                onRoomClick={planner.handleFloorPlanRoomClick}
                applianceCounts={floorPlanInteraction.floorPlanApplianceCounts}
                applianceDetails={floorPlanInteraction.floorPlanApplianceDetails}
              />
            </div>
          </div>

          <WireToolbar
            wires={DEFAULT_WIRES}
            wiring={circuitState.wiring}
            disabled={true}
            onDragStart={circuitState.handleDragStart}
            onDragMove={circuitState.handleDragMove}
            onDragEnd={circuitState.handleDragEnd}
            isPowered={false}
            canPowerOn={false}
            onPowerToggle={sim.handlePowerToggle}
          />

          {planner.roomPopover && (
            <CircuitAssignmentPopover
              roomId={planner.roomPopover.roomId}
              roomName={tRoomName(t, planner.roomPopover.roomName)}
              position={planner.roomPopover.pos}
              circuits={planner.plannerCircuits}
              currentCircuitId={planner.roomPopover.currentCircuitId}
              onAssignToCircuit={(cid) => planner.handleAssignRoomToCircuit(planner.roomPopover!.roomId, cid)}
              onUnassign={() => planner.handleUnassignRoom(planner.roomPopover!.roomId)}
              onAddCircuit={() => planner.handleAddCircuitAndAssignRoom(planner.roomPopover!.roomId)}
              onClose={() => planner.setRoomPopover(null)}
              canAddCircuit={planner.plannerCircuits.length < currentLevel.panel.maxSlots}
            />
          )}
        </div>
      );
    }

    // Non-floor-plan planning
    return (
      <div className="game-board planning-phase">
        <header className="game-header">
          <div className="header-top">
            <button className="back-button" onClick={handleBackToLevels}>← {t('nav.back')}</button>
            <h1>{translatedLevelName}</h1>
            <span className="level-goal">{t('game.powerTimeBudget', { time: currentLevel.survivalTime, budget: currentLevel.budget })}</span>
            <VolumeControl />
          </div>
          <p className="level-description">{translatedLevelDesc}</p>
        </header>

        <CircuitPlanner
          level={currentLevel}
          circuits={planner.plannerCircuits}
          totalCost={planner.plannerTotalCost}
          canConfirm={planner.plannerCanConfirm}
          confirmTooltip={planner.plannerConfirmTooltip}
          selectedCircuitId={planner.selectedPlannerCircuitId}
          onSelectCircuit={planner.setSelectedPlannerCircuitId}
          onAddCircuit={planner.handleAddPlannerCircuit}
          onDeleteCircuit={planner.handleDeletePlannerCircuit}
          onChangeVoltage={planner.handleChangePlannerVoltage}
          onChangeBreaker={planner.handleChangePlannerBreaker}
          onSelectWire={planner.handleSelectPlannerWire}
          onAssignAppliance={planner.handleAssignAppliance}
          onUnassignAppliance={planner.handleUnassignPlannerAppliance}
          onChangePhase={planner.handleChangePlannerPhase}
          onChangeElcb={planner.handleChangePlannerElcb}
          onConfirm={handleConfirmPlanning}
        />
      </div>
    );
  }

  // Shared power tooltip
  const powerTooltipText = !sim.isPowered && !canPowerOn
    ? (problemsRemaining ? t('oldHouse.problemsRemaining') : wetAreaMissingElcb ? t('oldHouse.wetAreaMissingElcb') : !allWired ? t('oldHouse.allWiresNeeded') : crimpMissing ? t('oldHouse.crimpNeeded') : routingMissing ? t('oldHouse.routingNeeded') : t('oldHouse.appliancesNeeded'))
    : undefined;

  // Result panel (inline content — placed inside fp-center for floor plan layout)
  const resultPanel = (
    <ResultPanel
      result={sim.result}
      circuits={circuits}
      multiState={sim.multiState}
      cost={totalCost}
      budget={currentLevel.budget}
      onRetry={handleRetry}
      onBackToLevels={handleBackToLevels}
      starResult={sim.starResult}
      aestheticsScore={routing.finalAestheticsScore}
      oldHouseSnapshot={oldHouse.oldHouseSnapshot}
      circuitConfigs={circuitConfigs}
      currentWires={circuitState.circuitWires}
      currentBreakers={oldHouse.circuitBreakers}
      currentElcb={circuitState.circuitElcb}
    />
  );

  // Modal overlays (position: fixed, don't affect flex layout)
  const modalOverlays = (
    <>
      {routing.showRoutingOverlay && (
        <PanelInteriorView
          circuitConfigs={circuitConfigs}
          circuitWires={circuitState.circuitWires}
          phases={circuitState.circuitPhases}
          lanes={routing.circuitLanes}
          onLanesChange={routing.handleLanesChange}
          onClose={routing.handleRoutingDone}
          cableTies={routing.cableTies}
          onToggleCableTie={routing.handleToggleCableTie}
          aestheticsScore={routing.currentAestheticsScore}
        />
      )}

      {floorPlanInteraction.pendingRoutingCircuit && floorPlanInteraction.candidateRoutes.length > 0 && (
        <RoutingStrategyPicker
          candidates={floorPlanInteraction.candidateRoutes}
          wire={floorPlanInteraction.pendingRoutingCircuit.wire}
          onSelect={floorPlanInteraction.handleSelectRoutingStrategy}
          onCancel={floorPlanInteraction.handleCancelRoutingStrategy}
        />
      )}

      {circuitState.pendingCrimpCircuitId && circuitState.pendingCrimpWire && (
        <CrimpMiniGame
          wire={circuitState.pendingCrimpWire}
          circuitLabel={circuitConfigs.find(c => c.id === circuitState.pendingCrimpCircuitId)?.label ?? circuitState.pendingCrimpCircuitId}
          onComplete={circuitState.handleCrimpComplete}
        />
      )}
    </>
  );

  // Active phase — Floor plan layout
  if (currentFloorPlan) {
    return (
      <div className={`game-board fp-layout${circuitConfigs.length > 1 ? ' multi-circuit' : ''}`}>
        <header className="game-header">
          <div className="header-top">
            <button className="back-button" onClick={handleBackToLevels}>← {t('nav.back')}</button>
            <h1>{translatedLevelName}</h1>
            <span className="level-goal">{t('game.powerTime', { time: currentLevel.survivalTime })}</span>
            <VolumeControl />
          </div>
          <StatusDisplay
            circuits={circuits}
            multiState={sim.multiState}
            cost={totalCost}
            budget={currentLevel.budget}
            survivalTime={currentLevel.survivalTime}
            phases={Object.keys(circuitState.circuitPhases).length > 0 ? circuitState.circuitPhases : undefined}
            mainBreakerRating={isFreeLevel && isFreeCircuitLevel(currentLevel) ? currentLevel.panel.mainBreakerRating : undefined}
          />
        </header>

        <div className="fp-main">
          <div className="sidebar-collapsed" onClick={() => floorPlanInteraction.setSidebarCollapsed(prev => !prev)} title={t('sidebar.expand')}>
            <span className="sidebar-collapsed__icon">&#9776;</span>
            <span className="sidebar-collapsed__count">{circuitConfigs.length}</span>
            <span className="sidebar-collapsed__cost">${totalCost}</span>
          </div>

          <div className="fp-center">
            <FloorPlanView
              floorPlan={currentFloorPlan}
              circuitAssignments={floorPlanInteraction.floorPlanCircuitAssignments}
              candidatePaths={floorPlanInteraction.floorPlanCandidatePaths}
              connectedPaths={floorPlanInteraction.floorPlanConnectedPaths}
              onPanelClick={() => routing.setShowRoutingOverlay(true)}
              onRoomHover={circuitState.wiring.isDragging ? floorPlanInteraction.handleFloorPlanRoomHover : undefined}
              highlightedRoomId={floorPlanInteraction.floorPlanHighlightedRoom}
              dragActive={circuitState.wiring.isDragging}
              simulationState={floorPlanInteraction.floorPlanSimulationState}
              problemRooms={floorPlanInteraction.floorPlanProblemRooms}
              roomCircuitMap={floorPlanInteraction.floorPlanRoomCircuitMap}
              applianceCounts={floorPlanInteraction.floorPlanApplianceCounts}
              applianceDetails={floorPlanInteraction.floorPlanApplianceDetails}
            />
            {routingReady && !sim.isPowered && (
              <button className="routing-button" onClick={() => routing.setShowRoutingOverlay(true)}>
                {routing.routingCompleted ? t('game.rerouting') : t('game.routing')}
              </button>
            )}
            {resultPanel}
          </div>
        </div>

        <WireToolbar
          wires={DEFAULT_WIRES}
          wiring={circuitState.wiring}
          disabled={sim.isPowered}
          onDragStart={circuitState.handleDragStart}
          onDragMove={circuitState.handleDragMove}
          onDragEnd={circuitState.handleDragEnd}
          isPowered={sim.isPowered}
          canPowerOn={canPowerOn}
          onPowerToggle={sim.handlePowerToggle}
          powerTooltip={powerTooltipText}
        />

        {modalOverlays}
      </div>
    );
  }

  // Active phase — Legacy three-column layout
  return (
    <div className={`game-board${circuitConfigs.length > 1 ? ' multi-circuit' : ''}${circuitConfigs.length >= 4 ? ' many-circuits' : ''}`}>
      <header className="game-header">
        <div className="header-top">
          <button className="back-button" onClick={handleBackToLevels}>← {t('nav.back')}</button>
          <h1>{translatedLevelName}</h1>
          <span className="level-goal">{t('game.powerTime', { time: currentLevel.survivalTime })}</span>
          <VolumeControl />
        </div>
        <StatusDisplay
          circuits={circuits}
          multiState={sim.multiState}
          cost={totalCost}
          budget={currentLevel.budget}
          survivalTime={currentLevel.survivalTime}
          phases={Object.keys(circuitState.circuitPhases).length > 0 ? circuitState.circuitPhases : undefined}
          mainBreakerRating={isFreeLevel && isFreeCircuitLevel(currentLevel) ? currentLevel.panel.mainBreakerRating : undefined}
        />
      </header>

      <main className="game-main">
        <section className="panel-left">
          <WireSelector
            wires={DEFAULT_WIRES}
            wiring={circuitState.wiring}
            disabled={sim.isPowered}
            onDragStart={circuitState.handleDragStart}
            onDragMove={circuitState.handleDragMove}
            onDragEnd={circuitState.handleDragEnd}
          />
        </section>

        <section className="panel-center">
          <CircuitDiagram
            circuits={circuits}
            multiState={sim.multiState}
            isPowered={sim.isPowered}
            wiring={circuitState.wiring}
            onPowerToggle={sim.handlePowerToggle}
            leverDisabled={!canPowerOn && !sim.isPowered}
            leverTooltip={powerTooltipText}
            onTargetCircuitChange={circuitState.handleTargetCircuitChange}
            phases={Object.keys(circuitState.circuitPhases).length > 0 ? circuitState.circuitPhases : undefined}
            phaseMode={currentLevel?.phaseMode}
            onTogglePhase={circuitState.handleTogglePhase}
            circuitCrimps={Object.keys(circuitState.circuitCrimps).length > 0 ? circuitState.circuitCrimps : undefined}
            problemCircuits={oldHouse.problemCircuits}
            preWiredCircuitIds={oldHouse.preWiredCircuitIds}
            onUnwire={oldHouse.handleUnwire}
            isOldHouse={isOldHouse}
            oldHouseProblems={oldHouseProblems}
            onChangeBreaker={isOldHouse ? oldHouse.handleChangeBreaker : undefined}
            circuitWires={isOldHouse ? circuitState.circuitWires : undefined}
          />
          {routingReady && !sim.isPowered && (
            <button className="routing-button" onClick={() => routing.setShowRoutingOverlay(true)}>
              {routing.routingCompleted ? t('game.rerouting') : t('game.routing')}
            </button>
          )}
        </section>

        <section className="panel-right">
          <AppliancePanel
            circuitConfigs={circuitConfigs}
            circuitAppliances={circuitState.circuitAppliances}
            onAdd={circuitState.handleAddAppliance}
            onRemove={circuitState.handleRemoveAppliance}
            disabled={sim.isPowered}
            isPowered={sim.isPowered}
          />
          {hasAnyElcbOption && (
            <div className="elcb-panel">
              <h3 className="elcb-panel-title">{t('elcb.title', { cost: ELCB_COST })}</h3>
              {circuitConfigs.filter(c => c.elcbAvailable).map(config => (
                <label key={config.id} className="elcb-toggle">
                  <input
                    type="checkbox"
                    checked={!!circuitState.circuitElcb[config.id]}
                    onChange={() => circuitState.handleToggleElcb(config.id)}
                    disabled={sim.isPowered}
                  />
                  <span className="elcb-label">{tRoomName(t, config.label)}</span>
                </label>
              ))}
            </div>
          )}
        </section>
      </main>

      {resultPanel}
      {modalOverlays}
    </div>
  );
}
