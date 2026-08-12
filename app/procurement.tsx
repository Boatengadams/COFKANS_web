import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import { Badge, Card, KpiCard, Button } from '../components/ui';
import { PortalLayout } from '../components/PortalLayout';
import { useAuth } from '../lib/auth';
import { colors, font, spacing, radius } from '../theme/tokens';
import { sendLocalNotification } from '../lib/native';

export default function ProcurementScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) return <Redirect href="/" />;

  const handleCreatePO = () => {
    Alert.alert('New Purchase Order', 'Opening Purchase Order creation builder.');
    sendLocalNotification(
      'PO Initialized 📝',
      'A new Purchase Order builder session has started.'
    );
  };

  const handleSupplierReview = () => {
    Alert.alert('Suppliers Directory', 'Opening active contractor directory.');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'receipt-outline' as const },
    { id: 'pos', label: 'Open POs', icon: 'list-outline' as const },
  ];

  return (
    <PortalLayout
      title="Procurement Hub"
      subtitle="Supplier ordering and warehouse restocking pipeline"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <View style={styles.kpiGrid}>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Purchase Orders" value="7 Active" sub="Total GH₵ 89.4K" icon="receipt-outline" tone="primary" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Avg Lead Time" value="4.2 Days" sub="-0.5 days vs standard" icon="time-outline" tone="success" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Active Suppliers" value="12 Vendors" sub="Ghana imports & local" icon="business-outline" tone="info" />
        </View>
      </View>

      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Procurement Actions</Text>
            <Text style={styles.hint}>Reorder items with low stock or add new suppliers to the directory.</Text>
            <View style={styles.actionRow}>
              <Button label="Create PO" icon="add-outline" style={{ flex: 1 }} onPress={handleCreatePO} />
              <Button label="Manage Suppliers" icon="business-outline" variant="outline" style={{ flex: 1 }} onPress={handleSupplierReview} />
            </View>
          </Card>
        </View>
      )}

      {activeTab === 'pos' && (
        <View style={styles.tabContent}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Open Purchase Orders</Text>
            <View style={styles.poRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.poRef}>PO-2026-081</Text>
                <Text style={styles.poDetail}>Super-Lec Cables Ltd · 3 items</Text>
              </View>
              <Badge tone="info" label="Sent to Supplier" />
            </View>
            <View style={styles.poRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.poRef}>PO-2026-079</Text>
                <Text style={styles.poDetail}>Phases Lighting Ghana · 14 items</Text>
              </View>
              <Badge tone="success" label="Fully Received" />
            </View>
          </Card>
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
  hint: {
    fontSize: font.xs,
    color: colors.muted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  poRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  poRef: {
    color: colors.foreground,
    fontWeight: '700',
    fontSize: font.sm,
  },
  poDetail: {
    color: colors.muted,
    fontSize: font.xs,
  },
});
