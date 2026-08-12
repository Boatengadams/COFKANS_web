import StaffPortalEntry from '@/app/components/portal/StaffPortalEntry';

export default function ManagerWeb() {
  return <StaffPortalEntry allowedRoles={['manager']} />;
}
