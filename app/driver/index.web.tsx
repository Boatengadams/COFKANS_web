import StaffPortalEntry from '@/app/components/portal/StaffPortalEntry';

export default function DriverWeb() {
  return <StaffPortalEntry allowedRoles={['driver']} />;
}
