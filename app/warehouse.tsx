import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import { Badge, Card, KpiCard, Button } from '../components/ui';
import { PortalLayout } from '../components/PortalLayout';
import { useAuth } from '../lib/auth';
import { listTransfers, branchName } from '../lib/data';
import { colors, font, spacing, radius } from '../theme/tokens';
import { sendLocalNotification } from '../lib/native';

export default function WarehouseScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('overview');
  const [transfers, setTransfers] = useState(listTransfers());

  if (!user) return <Redirect href="/" />;

  const isTablet = width >= 768;
  const cardWidth = isTablet ? '48%' : '100%';

  const handleStockCount = () => {
    Alert.alert('Stock Audit', 'Initialised full barcode audit workflow.');
    sendLocalNotification(
      'Audit Started 📋',
      'Local warehouse stock audit has been initialized.'
    );
  };

  const handleReceiveStock = () => {
    Alert.alert('Receive Shipment', 'Opening supplier shipment receiving form.');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'cube-outline' as const },
    { id: 'transfers', label: 'Outgoing Transfers', icon: 'swap-horizontal-outline' as const },
  ];

  return (
    <PortalLayout
      title="Warehouse Center"
      subtitle="Stock management and transfer sorting hub"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <View style={styles.kpiGrid}>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Items to Pick" value="18" sub="4 active transfers" icon="cube-outline" tone="primary" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Low Stock" value="5 Items" sub="Under threshold" icon="warning-outline" tone="warning" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Received Today" value="2 POs" sub="From suppliers" icon="checkmark-circle-outline" tone="success" />
        </View>
      </View>

      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Warehouse Tasks</Text>
            <Text style={styles.hint}>Manage incoming inventory count sheet and perform periodic stock takes.</Text>
            <View style={styles.actionRow}>
              <Button label="Audit Stock Count" icon="clipboard-outline" style={{ flex: 1 }} onPress={handleStockCount} />
              <Button label="Receive Supplier PO" icon="download-outline" variant="outline" style={{ flex: 1 }} onPress={handleReceiveStock} />
            </View>
          </Card>
        </View>
      )}

      {activeTab === 'transfers' && (
        <View style={styles.tabContent}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Outgoing Branch Transfers</Text>
            {transfers.filter(t => t.status === 'pending' || t.status === 'claimed').length === 0 ? (
              <Text style={styles.empty}>No active transfers to pick.</Text>
            ) : (
              transfers.filter(t => t.status === 'pending' || t.status === 'claimed').map((t) => (
                <View key={t.id} style={styles.transferRow}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.transferTitle}>{t.id} · To {branchName(t.toBranch)}</Text>
                    {t.items.map((it) => (
                      <Text key={it.sku} style={styles.transferItem}>• {it.quantity}x {it.name}</Text>
                    ))}
                  </View>
                  <Badge
                    tone={t.status === 'pending' ? 'warning' : 'info'}
                    label={t.status === 'pending' ? 'Pending' : 'Claimed'}
                  />
                </View>
              ))
            )}
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
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  transferTitle: {
    color: colors.foreground,
    fontWeight: '700',
    fontSize: font.sm,
  },
  transferItem: {
    color: colors.muted,
    fontSize: font.xs,
    marginLeft: 6,
  },
  empty: {
    color: colors.muted,
    fontSize: font.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
