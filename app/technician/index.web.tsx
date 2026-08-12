import StaffPortalEntry from '@/app/components/portal/StaffPortalEntry';

export default function TechnicianWeb() {
  return <StaffPortalEntry allowedRoles={['technician']} />;
}
