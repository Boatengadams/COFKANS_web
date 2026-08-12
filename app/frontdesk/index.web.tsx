import StaffPortalEntry from '@/app/components/portal/StaffPortalEntry';

export default function FrontDeskWeb() {
  return <StaffPortalEntry allowedRoles={['front_desk']} />;
}
