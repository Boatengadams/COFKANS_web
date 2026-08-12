import StaffPortalEntry from '@/app/components/portal/StaffPortalEntry';

export default function AccountantWeb() {
  return <StaffPortalEntry allowedRoles={['accountant']} />;
}
