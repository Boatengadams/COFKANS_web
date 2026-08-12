import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Card, KpiCard, Button } from '../../components/ui';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../lib/auth';
import {
  ALERT_META,
  approveAlert,
  branchName,
  declineAlert,
  listAlerts,
  listTransfers,
  StockAlert,
  subscribe,
} from '../../lib/data';
import { colors, font, spacing, radius } from '../../theme/tokens';
import { sendLocalNotification } from '../../lib/native';

const SHOWROOM = 'kumasi-asuoyeboa';

export default function FrontDeskScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState<StockAlert[]>(listAlerts());
  const [dispatched, setDispatched] = useState(listTransfers().length);

  useEffect(() => {
    return subscribe(() => {
      setAlerts(listAlerts());
      setDispatched(listTransfers().length);
    });
  }, []);

  if (!user) return <Redirect href="/" />;

  const fromBranch = user.branchSlug ?? SHOWROOM;
  const openAlerts = alerts.filter((a) => a.status === 'open');
  const resolvedAlerts = alerts.filter((a) => a.status !== 'open');

  const handleApprove = (id: string, name: string) => {
    approveAlert(id, fromBranch);
    sendLocalNotification(
      'Stock Dispatched 🚚',
      `Approved and dispatched transfer for ${name}.`
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'speedometer-outline' as const },
    { id: 'alerts', label: 'Stock Alerts', icon: 'alert-circle-outline' as const },
    { id: 'transfers', label: 'Dispatches', icon: 'swap-horizontal-outline' as const },
  ];

  return (
    <PortalLayout
      title="Front Desk Portal"
      subtitle={`Showroom desk — ${branchName(fromBranch)}`}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiWrapper}>
              <KpiCard
                label="Open Alerts"
                value={openAlerts.length}
                icon="alert-circle"
                tone="warning"
              />
            </View>
            <View style={styles.kpiWrapper}>
              <KpiCard
                label="Transfers Out"
                value={dispatched}
                icon="swap-horizontal"
                tone="info"
              />
            </View>
            <View style={styles.kpiWrapper}>
              <KpiCard
                label="Resolved"
                value={resolvedAlerts.length}
                icon="checkmark-done"
                tone="success"
              />
            </View>
          </View>

          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Showroom Actions</Text>
            <Text style={styles.hint}>Scan barcodes or raise manual orders from customers.</Text>
            <View style={styles.actionRow}>
              <Button label="Barcode POS Scan" icon="camera-outline" style={{ flex: 1 }} onPress={() => {}} />
              <Button label="New Checkout" icon="cart-outline" variant="outline" style={{ flex: 1 }} onPress={() => {}} />
            </View>
          </Card>
        </View>
      )}

      {activeTab === 'alerts' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Stock Requests from Branches</Text>
          {openAlerts.length === 0 ? (
            <Text style={styles.empty}>No open requests from satellite branches. 🎉</Text>
          ) : (
            openAlerts.map((a) => (
              <Card key={a.id} style={{ gap: spacing.md }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.alertId}>{a.id}</Text>
                  <Badge tone="warning" label="Open Request" />
                </View>
                <View style={styles.route}>
                  <Ionicons name="storefront-outline" size={14} color={colors.muted} />
                  <Text style={styles.branch}>{branchName(a.branchSlug)}</Text>
                </View>
                <Text style={styles.itemName}>
                  Needs {a.requestedQty} × {a.name}
                </Text>
                <View style={styles.actions}>
                  <Button
                    label="Approve & Dispatch"
                    icon="send-outline"
                    style={{ flex: 1 }}
                    onPress={() => handleApprove(a.id, a.name)}
                  />
                  <Button
                    label="Decline"
                    variant="outline"
                    onPress={() => declineAlert(a.id)}
                  />
                </View>
              </Card>
            ))
          )}
        </View>
      )}

      {activeTab === 'transfers' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Recently Handled Requests</Text>
          {resolvedAlerts.length === 0 ? (
            <Text style={styles.empty}>No requests resolved today.</Text>
          ) : (
            resolvedAlerts.map((a) => (
              <Card key={a.id} style={styles.rowBetween}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.itemDetail}>
                    {a.requestedQty} × {a.name}
                  </Text>
                  <Text style={styles.hint}>Destination: {branchName(a.branchSlug)}</Text>
                </View>
                <Badge tone={ALERT_META[a.status].tone} label={ALERT_META[a.status].label} />
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
  hint: {
    fontSize: font.xs,
    color: colors.muted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertId: {
    color: colors.foreground,
    fontWeight: '800',
    fontSize: font.md,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  branch: {
    color: colors.muted,
    fontSize: font.sm,
    fontWeight: '600',
  },
  itemName: {
    color: colors.foreground,
    fontSize: font.sm,
    fontWeight: '600',
  },
  itemDetail: {
    color: colors.foreground,
    fontSize: font.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  empty: {
    color: colors.muted,
    fontSize: font.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
