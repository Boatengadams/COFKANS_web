import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import { Badge, Card, KpiCard, Button } from '../components/ui';
import { PortalLayout } from '../components/PortalLayout';
import { useAuth } from '../lib/auth';
import { colors, font, spacing, radius } from '../theme/tokens';
import { sendLocalNotification } from '../lib/native';

export default function AccountantScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) return <Redirect href="/" />;

  const handleApprovePayroll = () => {
    Alert.alert('Payroll Approved', 'Salary transfers dispatched for July 2026.');
    sendLocalNotification(
      'Payroll Processed 💳',
      'Salary transfers have been approved and dispatched to bank portal.'
    );
  };

  const handleAuditLogs = () => {
    Alert.alert('Financial Audit', 'Opening general ledger export tool.');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'cash-outline' as const },
    { id: 'expenses', label: 'Expenses log', icon: 'receipt-outline' as const },
  ];

  return (
    <PortalLayout
      title="Finance & Accounts"
      subtitle="Ledger bookkeeping and staff payroll auditing"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <View style={styles.kpiGrid}>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Monthly Revenue" value="GH₵ 142.5K" sub="+12.4% vs last month" icon="trending-up-outline" tone="success" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Pending Invoices" value="9 Invoices" sub="Total GH₵ 24,000" icon="receipt-outline" tone="warning" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Vault Cash" value="GH₵ 45.6K" sub="Petty & branch registry" icon="cash-outline" tone="primary" />
        </View>
      </View>

      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Accounting Actions</Text>
            <Text style={styles.hint}>Reconcile branch register payouts or approve monthly salary transfers.</Text>
            <View style={styles.actionRow}>
              <Button label="Audit General Ledger" icon="document-text-outline" style={{ flex: 1 }} onPress={handleAuditLogs} />
              <Button label="Process Staff Payroll" icon="card-outline" variant="outline" style={{ flex: 1 }} onPress={handleApprovePayroll} />
            </View>
          </Card>
        </View>
      )}

      {activeTab === 'expenses' && (
        <View style={styles.tabContent}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Recent Expenses & Receipts</Text>
            <View style={styles.expenseRow}>
              <View>
                <Text style={styles.expenseTitle}>Generator Fuel Reimbursement</Text>
                <Text style={styles.expenseDate}>Kumasi Showroom · Yaw Boateng</Text>
              </View>
              <Text style={styles.expenseValue}>GH₵ 350</Text>
            </View>
            <View style={styles.expenseRow}>
              <View>
                <Text style={styles.expenseTitle}>Branch Stationery Supply</Text>
                <Text style={styles.expenseDate}>HQ Office · Ama Owusu</Text>
              </View>
              <Text style={styles.expenseValue}>GH₵ 120</Text>
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
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  expenseTitle: {
    color: colors.foreground,
    fontWeight: '700',
    fontSize: font.sm,
  },
  expenseDate: {
    color: colors.muted,
    fontSize: font.xs,
    marginTop: 2,
  },
  expenseValue: {
    color: colors.success,
    fontWeight: '700',
    fontSize: font.sm,
  },
});
