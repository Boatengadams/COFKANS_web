import StaffPortalEntry from '@/app/components/portal/StaffPortalEntry';

export default function BranchDeskWeb() {
  return <StaffPortalEntry allowedRoles={['branch_desk']} />;
}
