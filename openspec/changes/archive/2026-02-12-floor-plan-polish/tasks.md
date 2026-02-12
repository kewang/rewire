## 1. Responsive Layout — fp-layout 響應式

- [x] 1.1 Add mobile (≤640px) @media rules for .fp-layout: vertical stack (sidebar strip top, FloorPlan center, WireToolbar bottom fixed)
- [x] 1.2 Add tablet (641-1024px) @media rules for .fp-layout: narrower sidebar 220px, FloorPlan fills remaining
- [x] 1.3 Ensure FloorPlanView SVG scales responsively within its container (width="100%" + viewBox)

## 2. Sidebar Polish — CircuitPlannerSidebar

- [x] 2.1 Add CSS transition (width 0.25s ease + overflow:hidden) for expand/collapse animation
- [x] 2.2 Mobile auto-collapse: default to collapsed on ≤640px viewport
- [x] 2.3 Mobile overlay mode: expanded sidebar as fixed overlay with semi-transparent backdrop + tap-to-close

## 3. WireToolbar Polish

- [x] 3.1 Mobile horizontal scroll: wire-toolbar-cards overflow-x:auto + hidden scrollbar + min-width per card
- [x] 3.2 Scroll affordance: right-edge gradient fade when cards overflow

## 4. Popover & Animation Polish

- [x] 4.1 CircuitAssignmentPopover entrance animation (opacity+translateY, 0.15s ease-out)
- [x] 4.2 Popover viewport clamping: safe 8px margins + flip-above when near bottom edge
- [x] 4.3 Power button state transition: scale pulse (1.0→1.05→1.0) on toggle

## 5. i18n Audit

- [x] 5.1 Grep all floor plan components for hardcoded strings, extract to i18n keys
- [x] 5.2 Add missing keys to all 6 locale files (zh-TW/en/ja/ko/fr/th)

## 6. Visual Micro-adjustments

- [x] 6.1 Distance label background pill for readability (dark semi-transparent rect behind text)
- [x] 6.2 Lint check and fix any warnings
