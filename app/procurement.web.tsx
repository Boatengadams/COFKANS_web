import StaffPortalEntry from '@/app/components/portal/StaffPortalEntry';

export default function ProcurementWeb() {
  return <StaffPortalEntry allowedRoles={['procurement']} />;
}
