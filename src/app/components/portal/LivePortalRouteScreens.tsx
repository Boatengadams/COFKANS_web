import { Redirect, useLocalSearchParams } from 'expo-router';
import { FirebaseAuthProvider } from '../../contexts/FirebaseAuthContext';
import { getBranchBySlug } from '../../../lib/branches';
import { LivePortalLogin } from './LivePortalLogin';
import { LivePortalShell } from './LivePortalShell';
import { LiveStaffGate } from './LiveStaffGate';
import { LiveBranchDashboard } from './LiveBranchDashboard';
import { LiveBranchSettings } from './LiveBranchSettings';
import { RiderDashboard } from './RiderDashboard';
import { FrontDeskDashboard } from './FrontDeskDashboard';
import { useStaffRole } from '../../hooks/useStaffRole';

type ParamSlug = string | string[] | undefined;
function slugOf(value: ParamSlug): string { return Array.isArray(value) ? value[0] ?? '' : value ?? ''; }

export function BranchPortalLoginRoute() {
  const slug = slugOf(useLocalSearchParams<{ slug?: ParamSlug }>().slug);
  const branch = getBranchBySlug(slug);
  if (!branch) return <Redirect href="/" />;
  return <FirebaseAuthProvider><LivePortalLogin portalTitle={`${branch.name} — Staff Login`} expectedRole="branch_manager" expectedBranchSlug={branch.slug} successPath={`/home/portal/branch/${branch.slug}`} /></FirebaseAuthProvider>;
}

export function BranchPortalRoute() {
  const slug = slugOf(useLocalSearchParams<{ slug?: ParamSlug }>().slug);
  const branch = getBranchBySlug(slug);
  if (!branch) return <Redirect href="/" />;
  return <FirebaseAuthProvider><LiveStaffGate role="branch_manager" branchSlug={branch.slug} loginPath={`/home/portal/branch/${branch.slug}/login`}><LivePortalShell title={branch.name} subtitle={`${branch.city} · ${branch.address}`}><LiveBranchDashboard branchSlug={branch.slug} /></LivePortalShell></LiveStaffGate></FirebaseAuthProvider>;
}

export function BranchSettingsRoute() {
  const slug = slugOf(useLocalSearchParams<{ slug?: ParamSlug }>().slug);
  const branch = getBranchBySlug(slug);
  if (!branch) return <Redirect href="/" />;
  return <FirebaseAuthProvider><LiveStaffGate role="branch_manager" branchSlug={branch.slug} loginPath={`/home/portal/branch/${branch.slug}/login`}><LivePortalShell title={`${branch.name} — Settings`} subtitle="Customer-facing contact & hours"><LiveBranchSettings branchSlug={branch.slug} /></LivePortalShell></LiveStaffGate></FirebaseAuthProvider>;
}

export function RiderPortalLoginRoute() { return <FirebaseAuthProvider><LivePortalLogin portalTitle="Rider & Driver Portal" expectedRole="rider" successPath="/home/portal/rider" /></FirebaseAuthProvider>; }

export function RiderPortalRoute() {
  return <FirebaseAuthProvider><LiveStaffGate role="rider" loginPath="/home/portal/rider/login"><LivePortalShell title="Rider & Driver Portal" subtitle="Pick up ready deliveries from your branch"><RiderPortalContent /></LivePortalShell></LiveStaffGate></FirebaseAuthProvider>;
}

function RiderPortalContent() {
  const { staff } = useStaffRole();
  if (!staff?.branchSlug) return <p className="text-zinc-400">No branch is assigned to this rider.</p>;
  return <RiderDashboard branchSlug={staff.branchSlug} riderUid={staff.uid} riderName={staff.displayName ?? staff.email} />;
}

export function HelpdeskLoginRoute() { return <FirebaseAuthProvider><LivePortalLogin portalTitle="Showroom Helpdesk" expectedRole="front_desk" successPath="/home/portal/helpdesk" /></FirebaseAuthProvider>; }
export function HelpdeskPortalRoute() { return <FirebaseAuthProvider><LiveStaffGate role="front_desk" loginPath="/home/portal/helpdesk/login"><LivePortalShell title="Showroom Helpdesk" subtitle="Customer support, enquiries, walk-ins"><FrontDeskDashboard /></LivePortalShell></LiveStaffGate></FirebaseAuthProvider>; }
