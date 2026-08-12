import StaffPortalEntry from '@/app/components/portal/StaffPortalEntry';

export default function MarketingWeb() {
  return <StaffPortalEntry allowedRoles={['marketing']} />;
}
