import StaffPortalEntry from '@/app/components/portal/StaffPortalEntry';
import ManagerPortal from '@/app/pages/ManagerPortal';

export default function ManagerWeb() {
  return (
    <StaffPortalEntry allowedRoles={['manager']}>
      <ManagerPortal />
    </StaffPortalEntry>
  );
}
