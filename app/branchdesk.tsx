import React, { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, TextInput, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import { Badge, Card, KpiCard, Button } from '../components/ui';
import { PortalLayout } from '../components/PortalLayout';
import { useAuth } from '../lib/auth';
import { listAlerts, raiseAlert, branchName } from '../lib/data';
import { colors, font, spacing, radius } from '../theme/tokens';
import { sendLocalNotification } from '../lib/native';

export default function BranchDeskScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('overview');
  const [alertsList, setAlertsList] = useState(listAlerts());

  // Input states for manual request
  const [reqSku, setReqSku] = useState('');
  const [reqName, setReqName] = useState('');
  const [reqQty, setReqQty] = useState('');

  if (!user) return <Redirect href="/" />;

  const isTablet = width >= 768;
  const cardWidth = isTablet ? '48%' : '100%';
  const myBranchSlug = user.branchSlug ?? 'kumasi-asuoyeboa';
  const myBranchName = branchName(myBranchSlug);

  const handleRequestStock = () => {
    if (!reqSku || !reqName || !reqQty) {
      Alert.alert('Incomplete Fields', 'Please specify SKU, Name, and Quantity.');
      return;
    }
    const qty = parseInt(reqQty);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    raiseAlert(myBranchSlug, reqSku, reqName, qty);
    setAlertsList(listAlerts());
    
    // Send local notification
    sendLocalNotification(
      'Stock Alert Raised 🚨',
      `Requested ${qty}x ${reqName} for ${myBranchName}`
    );

    // Reset inputs
    setReqSku('');
    setReqName('');
    setReqQty('');
    Alert.alert('Success', 'Stock alert dispatched to showroom.');
  };

  const handleSampleRequest = (sku: string, name: string, qty: number) => {
    raiseAlert(myBranchSlug, sku, name, qty);
    setAlertsList(listAlerts());
    sendLocalNotification(
      'Stock Alert Raised 🚨',
      `Requested ${qty}x ${name} for ${myBranchName}`
    );
    Alert.alert('Success', `Stock alert for ${qty}x ${name} dispatched.`);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'storefront-outline' as const },
    { id: 'pos', label: 'POS Checkout', icon: 'cart-outline' as const },
    { id: 'alerts', label: 'Stock Alerts', icon: 'alert-circle-outline' as const },
  ];

  return (
    <PortalLayout
      title={myBranchName}
      subtitle={`Branch Desk Portal · Staff: ${user.displayName}`}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <View style={styles.kpiGrid}>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Today's Sales" value="GH₵ 4,280" sub="12 transactions" icon="cash-outline" tone="success" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Active Alerts" value={alertsList.filter(a => a.status === 'open').length} sub="Pending transfers" icon="alert-circle-outline" tone="warning" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Duty Staff" value="3 Members" sub="Shift: Morning" icon="people-outline" tone="primary" />
        </View>
      </View>

      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Branch Operations</Text>
            <Text style={styles.hint}>Verify cashier registers, print shift reports, and adjust branch parameters.</Text>
            <View style={styles.actionRow}>
              <Button label="Audit Register" icon="clipboard-outline" style={{ flex: 1 }} onPress={() => {}} />
              <Button label="Print Shift Summary" icon="print-outline" variant="outline" style={{ flex: 1 }} onPress={() => {}} />
            </View>
          </Card>
        </View>
      )}

      {activeTab === 'pos' && (
        <View style={styles.tabContent}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Point of Sale (POS) Checkout</Text>
            <Text style={styles.hint}>Checkout walk-in customers at the branch register.</Text>
            <View style={{ gap: spacing.md, marginVertical: spacing.sm }}>
              <Button label="Scan Product Barcode" icon="camera-outline" onPress={() => {}} />
              <Button label="Search Product Catalog" icon="search-outline" variant="outline" onPress={() => {}} />
            </View>
          </Card>
        </View>
      )}

      {activeTab === 'alerts' && (
        <View style={styles.tabContent}>
          <View style={styles.layoutRow}>
            <Card style={[styles.cardItem, { width: cardWidth }]}>
              <Text style={styles.sectionTitle}>Raise Stock Alert</Text>
              
              <Text style={styles.label}>Product SKU</Text>
              <TextInput
                value={reqSku}
                onChangeText={setReqSku}
                placeholder="e.g. LED-A60-9W"
                placeholderTextColor={colors.muted}
                style={styles.input}
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Product Name</Text>
              <TextInput
                value={reqName}
                onChangeText={setReqName}
                placeholder="e.g. LED Bulb A60 9W"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />

              <Text style={styles.label}>Quantity Needed</Text>
              <TextInput
                value={reqQty}
                onChangeText={setReqQty}
                placeholder="e.g. 50"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                style={styles.input}
              />

              <Button label="Send Alert Request" icon="send-outline" onPress={handleRequestStock} />
              
              <View style={{ height: 1.5, backgroundColor: colors.border, marginVertical: spacing.xs }} />
              
              <Text style={[styles.label, { marginBottom: spacing.xs }]}>Quick Templates</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                <Button label="+25 LEDs" variant="outline" style={styles.miniBtn} onPress={() => handleSampleRequest('LED-A60-9W', 'LED Bulb A60 9W', 25)} />
                <Button label="+10 Cables" variant="outline" style={styles.miniBtn} onPress={() => handleSampleRequest('CBL-2.5-100', 'Cable 2.5mm² (100m)', 10)} />
              </View>
            </Card>

            <Card style={[styles.cardItem, { width: cardWidth }]}>
              <Text style={styles.sectionTitle}>Stock Transfer Status</Text>
              {alertsList.length === 0 ? (
                <Text style={styles.empty}>No alerts requested from this branch.</Text>
              ) : (
                alertsList.map((a) => (
                  <View key={a.id} style={styles.alertRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{a.name}</Text>
                      <Text style={styles.itemDetail}>SKU: {a.sku} · Qty: {a.requestedQty}</Text>
                    </View>
                    <Badge
                      tone={a.status === 'open' ? 'warning' : a.status === 'approved' ? 'success' : 'danger'}
                      label={a.status === 'open' ? 'Pending' : a.status === 'approved' ? 'Approved' : 'Declined'}
                    />
                  </View>
                ))
              )}
            </Card>
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
  layoutRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardItem: {
    gap: spacing.md,
  },
  label: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.muted,
  },
  input: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.foreground,
    padding: spacing.md,
    fontSize: font.sm,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  itemName: {
    color: colors.foreground,
    fontWeight: '600',
    fontSize: font.sm,
  },
  itemDetail: {
    color: colors.muted,
    fontSize: font.xs,
    marginTop: 2,
  },
  miniBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  empty: {
    color: colors.muted,
    fontSize: font.sm,
    fontStyle: 'italic',
  },
});
