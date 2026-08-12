import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Card, KpiCard, Button } from '../../components/ui';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../lib/auth';
import {
  branchName,
  claimTransfer,
  deliverTransfer,
  listTransfers,
  pickUpTransfer,
  STATUS_META,
  subscribe,
  Transfer,
} from '../../lib/data';
import { colors, font, spacing, radius } from '../../theme/tokens';
import { sendLocalNotification, getCurrentLocation } from '../../lib/native';

export default function DriverScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  const [transfers, setTransfers] = useState<Transfer[]>(listTransfers());

  useEffect(() => {
    return subscribe(() => setTransfers(listTransfers()));
  }, []);

  if (!user) return <Redirect href="/" />;

  const available = transfers.filter((t) => t.status === 'pending');
  const mine = transfers.filter((t) => t.status === 'claimed' || t.status === 'in_transit');
  const deliveredToday = transfers.filter((t) => t.status === 'delivered');

  const handleClaim = (id: string) => {
    claimTransfer(id, user.uid);
    sendLocalNotification(
      'Run Claimed 📦',
      `You claimed transfer job ${id}. Ready for pickup.`
    );
  };

  const handlePickup = async (id: string) => {
    pickUpTransfer(id);
    const loc = await getCurrentLocation();
    sendLocalNotification(
      'In Transit 🚚',
      `Job ${id} is now on your vehicle. GPS location updated.`
    );
  };

  const handleDeliver = (id: string) => {
    deliverTransfer(id);
    sendLocalNotification(
      'Job Delivered ✅',
      `Successfully delivered transfer ${id} to branch.`
    );
  };

  const tabs = [
    { id: 'available', label: 'Available Runs', icon: 'search-outline' as const },
    { id: 'active', label: 'My Route', icon: 'car-outline' as const },
    { id: 'delivered', label: 'Delivered Today', icon: 'checkmark-done-outline' as const },
  ];

  return (
    <PortalLayout
      title="Driver Transfers"
      subtitle="Inter-branch courier manifest"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <View style={styles.kpiGrid}>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Available" value={available.length} icon="cube-outline" tone="warning" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="On my run" value={mine.length} icon="car-outline" tone="info" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Delivered" value={deliveredToday.length} icon="checkmark-done" tone="success" />
        </View>
      </View>

      {activeTab === 'available' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Available Transfers to Claim</Text>
          {available.length === 0 ? (
            <Text style={styles.empty}>No transfers waiting at showroom. 🏝️</Text>
          ) : (
            available.map((t) => (
              <Card key={t.id} style={{ gap: spacing.sm }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.transferId}>{t.id}</Text>
                  <Badge tone={STATUS_META[t.status].tone} label={STATUS_META[t.status].label} />
                </View>
                <View style={styles.route}>
                  <Text style={styles.branch}>{branchName(t.fromBranch)}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.muted} />
                  <Text style={styles.branch}>{branchName(t.toBranch)}</Text>
                </View>
                {t.items.map((it) => (
                  <Text key={it.sku} style={styles.item}>
                    • {it.quantity} × {it.name}
                  </Text>
                ))}
                <View style={{ marginTop: spacing.sm }}>
                  <Button
                    label="Claim Run"
                    icon="hand-left-outline"
                    onPress={() => handleClaim(t.id)}
                  />
                </View>
              </Card>
            ))
          )}
        </View>
      )}

      {activeTab === 'active' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>My Route (Active Runs)</Text>
          {mine.length === 0 ? (
            <Text style={styles.empty}>You have no active runs. Claim a job first.</Text>
          ) : (
            mine.map((t) => (
              <Card key={t.id} style={{ gap: spacing.sm }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.transferId}>{t.id}</Text>
                  <Badge tone={STATUS_META[t.status].tone} label={STATUS_META[t.status].label} />
                </View>
                <View style={styles.route}>
                  <Text style={styles.branch}>{branchName(t.fromBranch)}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.muted} />
                  <Text style={styles.branch}>{branchName(t.toBranch)}</Text>
                </View>
                {t.items.map((it) => (
                  <Text key={it.sku} style={styles.item}>
                    • {it.quantity} × {it.name}
                  </Text>
                ))}
                <View style={{ marginTop: spacing.sm }}>
                  {t.status === 'claimed' ? (
                    <Button
                      label="Mark Picked Up (In Transit)"
                      icon="arrow-up-circle-outline"
                      onPress={() => handlePickup(t.id)}
                    />
                  ) : (
                    <Button
                      label="Mark Delivered (Complete)"
                      icon="checkmark-circle-outline"
                      onPress={() => handleDeliver(t.id)}
                    />
                  )}
                </View>
              </Card>
            ))
          )}
        </View>
      )}

      {activeTab === 'delivered' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Delivered Runs Today</Text>
          {deliveredToday.length === 0 ? (
            <Text style={styles.empty}>No runs completed today.</Text>
          ) : (
            deliveredToday.map((t) => (
              <Card key={t.id} style={{ gap: spacing.sm }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.transferId}>{t.id}</Text>
                  <Badge tone="success" label="Delivered" />
                </View>
                <View style={styles.route}>
                  <Text style={styles.branch}>{branchName(t.fromBranch)}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.muted} />
                  <Text style={styles.branch}>{branchName(t.toBranch)}</Text>
                </View>
              </Card>
            ))
          )}
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
    width: '33.3%',
    padding: spacing.sm,
  },
  sectionTitle: {
    fontSize: font.md,
    fontWeight: '800',
    color: colors.foreground,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transferId: {
    color: colors.foreground,
    fontWeight: '800',
    fontSize: font.md,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  branch: {
    color: colors.muted,
    fontSize: font.sm,
    fontWeight: '600',
  },
  item: {
    color: colors.foreground,
    fontSize: font.sm,
  },
  empty: {
    color: colors.muted,
    fontSize: font.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
