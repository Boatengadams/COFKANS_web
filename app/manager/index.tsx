import React, { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, ScrollView } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Badge, Card, KpiCard, Button } from '../../components/ui';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../lib/auth';
import { BRANCHES } from '../../lib/data';
import { colors, font, spacing, radius } from '../../theme/tokens';

export default function ManagerScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) return <Redirect href="/" />;

  const activeBranches = BRANCHES.filter((b) => b.isActive);
  const offlineBranches = BRANCHES.filter((b) => !b.isActive);
  
  const isTablet = width >= 768;
  const gridColumns = isTablet ? 2 : 1;
  const cardWidth = isTablet ? '48%' : '100%';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'analytics-outline' as const },
    { id: 'branches', label: 'Branch Network', icon: 'business-outline' as const },
    { id: 'quickaccess', label: 'Role Switcher', icon: 'people-outline' as const },
  ];

  return (
    <PortalLayout
      title="Manager Console"
      subtitle={`Welcome back, ${user.displayName.split(' ')[0]} 👋`}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiWrapper}>
              <KpiCard
                label="Active Branches"
                value={activeBranches.length}
                sub={`of ${BRANCHES.length}`}
                icon="business"
                tone="primary"
              />
            </View>
            <View style={styles.kpiWrapper}>
              <KpiCard
                label="Products Catalogue"
                value="274"
                sub="Across branches"
                icon="cube"
                tone="success"
              />
            </View>
            <View style={styles.kpiWrapper}>
              <KpiCard
                label="Delivery Fee"
                value="GH₵ 50"
                sub="Flat standard rate"
                icon="car"
                tone="info"
              />
            </View>
            <View style={styles.kpiWrapper}>
              <KpiCard
                label="Active Regions"
                value="2"
                sub="Ashanti & Greater Accra"
                icon="location"
                tone="warning"
              />
            </View>
          </View>

          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Global Alerts</Text>
            <View style={styles.pills}>
              <Badge tone="success" icon="checkmark-circle" label={`${activeBranches.length} branches active`} />
              <Badge tone="info" icon="trending-up" label="274 products catalogued" />
              {offlineBranches.length > 0 && (
                <Badge tone="warning" icon="warning" label={`${offlineBranches.length} branch offline`} />
              )}
            </View>
          </Card>
        </View>
      )}

      {activeTab === 'branches' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>All Branches ({BRANCHES.length})</Text>
          <View style={styles.branchGrid}>
            {BRANCHES.map((b) => (
              <Card key={b.slug} style={[styles.branchCard, { width: cardWidth }]}>
                <View style={styles.branchIcon}>
                  <Text style={styles.branchInitial}>{b.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.branchName}>{b.name}</Text>
                  <Text style={styles.branchRegion}>{b.region} Region</Text>
                </View>
                <Badge
                  tone={b.isActive ? 'success' : 'warning'}
                  label={b.isActive ? 'Active' : 'Offline'}
                />
              </Card>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'quickaccess' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Quick Switch to Role Portals</Text>
          <Text style={styles.hint}>Easily verify layout and features of other employee roles.</Text>
          <View style={styles.roleGrid}>
            <Button
              label="Front Desk (Showroom)"
              icon="storefront-outline"
              variant="outline"
              style={styles.roleBtn}
              onPress={() => router.push('/frontdesk')}
            />
            <Button
              label="Branch Desk"
              icon="business-outline"
              variant="outline"
              style={styles.roleBtn}
              onPress={() => router.push('/branchdesk')}
            />
            <Button
              label="Driver (Transfers)"
              icon="car-outline"
              variant="outline"
              style={styles.roleBtn}
              onPress={() => router.push('/driver')}
            />
            <Button
              label="Technician"
              icon="construct-outline"
              variant="outline"
              style={styles.roleBtn}
              onPress={() => router.push('/technician')}
            />
            <Button
              label="Warehouse Center"
              icon="cube-outline"
              variant="outline"
              style={styles.roleBtn}
              onPress={() => router.push('/warehouse')}
            />
            <Button
              label="Finance & Accounts"
              icon="cash-outline"
              variant="outline"
              style={styles.roleBtn}
              onPress={() => router.push('/accountant')}
            />
            <Button
              label="Human Resources"
              icon="people-outline"
              variant="outline"
              style={styles.roleBtn}
              onPress={() => router.push('/hr')}
            />
            <Button
              label="Procurement Hub"
              icon="receipt-outline"
              variant="outline"
              style={styles.roleBtn}
              onPress={() => router.push('/procurement')}
            />
            <Button
              label="Marketing Hub"
              icon="megaphone-outline"
              variant="outline"
              style={styles.roleBtn}
              onPress={() => router.push('/marketing')}
            />
            <Button
              label="Developer Console"
              icon="bug-outline"
              variant="outline"
              style={styles.roleBtn}
              onPress={() => router.push('/developer')}
            />
          </View>
        </View>
      )}
    </PortalLayout>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    gap: spacing.lg,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  kpiWrapper: {
    width: '50%',
    padding: spacing.sm,
  },
  sectionTitle: {
    fontSize: font.md,
    fontWeight: '800',
    color: colors.foreground,
  },
  hint: {
    fontSize: font.xs,
    color: colors.muted,
    marginTop: 2,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  branchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 260,
  },
  branchIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchInitial: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: font.md,
  },
  branchName: {
    color: colors.foreground,
    fontWeight: '700',
    fontSize: font.sm,
  },
  branchRegion: {
    color: colors.muted,
    fontSize: font.xs,
    marginTop: 2,
  },
  roleGrid: {
    gap: spacing.sm,
  },
  roleBtn: {
    justifyContent: 'flex-start',
    paddingVertical: spacing.md,
  },
});
