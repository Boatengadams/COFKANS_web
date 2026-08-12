import StaffPortalEntry from '@/app/components/portal/StaffPortalEntry';

export default function HRWeb() {
  return <StaffPortalEntry allowedRoles={['hr']} />;
}
