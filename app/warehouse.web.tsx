import StaffPortalEntry from '@/app/components/portal/StaffPortalEntry';

export default function WarehouseWeb() {
  return <StaffPortalEntry allowedRoles={['warehouse']} />;
}
