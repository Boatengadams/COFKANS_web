/**
 * Multi-Branch Module — nested route table.
 *
 * A self-contained `<Routes>` fragment for the whole module, mounted under
 * `/branches/*`. It is UI-agnostic: the caller supplies a `renderSegment`
 * render-prop that returns the screen for a given (branchId, segment). This
 * keeps routing functional now while the actual screens are built later.
 *
 * Route map:
 *   /branches                     → BranchRedirect (auto → user's branch)
 *   /branches/:branchId           → redirect to the role's landing segment
 *   /branches/:branchId/:segment  → guarded segment screen
 *
 * Mounting (additive — does not change existing routes), e.g. in AppRouter:
 *   <Route path="/branches/*" element={
 *     <BranchModuleRoutes renderSegment={(branchId, segment) => <YourScreen .../>} />
 *   } />
 */
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { BranchProvider } from '../context/BranchContext';
import { BranchRedirect } from './BranchRedirect';
import { BranchRouteGuard } from './BranchRouteGuard';
import { useCurrentBranchUser } from './useCurrentBranchUser';
import { branchLandingPath, type BranchSegment, BRANCH_SEGMENTS } from './paths';

/** Render-prop: given a branch + segment, return the screen to show. */
export type RenderBranchSegment = (branchId: string, segment: BranchSegment) => ReactNode;

/** Redirects `/branches/:branchId` to the current role's landing segment. */
function BranchIndexRedirect() {
  const { branchId: urlBranchId } = useParams();
  const { role, branchId } = useCurrentBranchUser();
  const target = urlBranchId ?? branchId;
  return <Navigate to={branchLandingPath(target, role ?? 'manager')} replace />;
}

/** Validates the :segment param and delegates to the render-prop. */
function SegmentScreen({ render }: { render: RenderBranchSegment }) {
  const { branchId, segment } = useParams();
  const seg = (segment ?? '') as BranchSegment;
  if (!branchId || !BRANCH_SEGMENTS.includes(seg)) {
    return <Navigate to={branchLandingPath(branchId ?? '', 'manager')} replace />;
  }
  return <>{render(branchId, seg)}</>;
}

export function BranchModuleRoutes({
  renderSegment,
  fallback = '/login',
}: {
  renderSegment: RenderBranchSegment;
  fallback?: string;
}) {
  return (
    <BranchProvider>
      <Routes>
        <Route index element={<BranchRedirect fallback={fallback} />} />
        <Route path=":branchId" element={<BranchIndexRedirect />} />
        <Route
          path=":branchId/:segment"
          element={
            <BranchRouteGuard fallback={fallback}>
              <SegmentScreen render={renderSegment} />
            </BranchRouteGuard>
          }
        />
        {/* Anything else under /branches → auto-redirect */}
        <Route path="*" element={<BranchRedirect fallback={fallback} />} />
      </Routes>
    </BranchProvider>
  );
}

export default BranchModuleRoutes;
