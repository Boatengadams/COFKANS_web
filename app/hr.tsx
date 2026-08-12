import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import { Badge, Card, KpiCard, Button } from '../components/ui';
import { PortalLayout } from '../components/PortalLayout';
import { useAuth } from '../lib/auth';
import { colors, font, spacing, radius } from '../theme/tokens';
import { sendLocalNotification } from '../lib/native';

export default function HRScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) return <Redirect href="/" />;

  const handlePublishRoster = () => {
    Alert.alert('Roster Published', 'Weekly shift planner dispatched to staff.');
    sendLocalNotification(
      'Roster Published 📅',
      'Weekly shift roster has been sent out to all departments.'
    );
  };

  const handleApproveLeave = () => {
    Alert.alert('Leave Approved', 'Annual leave request approved for Ama Owusu.');
    sendLocalNotification(
      'Leave Approved ✈️',
      'Leave approved for Ama Owusu (5 Days).'
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'people-outline' as const },
    { id: 'leave', label: 'Leave Requests', icon: 'calendar-outline' as const },
  ];

  return (
    <PortalLayout
      title="Human Resources"
      subtitle="Staff directory, attendance registry, and shift planner"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <View style={styles.kpiGrid}>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Total Staff" value="11 Members" sub="Active contracts" icon="people-outline" tone="primary" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Attendance Today" value="96%" sub="1 absent · 1 leave" icon="calendar-outline" tone="success" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Leave Requests" value="1 Pending" sub="Ama Owusu · 5 days" icon="time-outline" tone="warning" />
        </View>
      </View>

      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>HR Operations</Text>
            <Text style={styles.hint}>Generate staffing performance reviews and distribute shift templates.</Text>
            <View style={styles.actionRow}>
              <Button label="Publish Weekly Roster" icon="calendar-outline" style={{ flex: 1 }} onPress={handlePublishRoster} />
              <Button label="Approve Leave Requests" icon="checkmark-done" variant="outline" style={{ flex: 1 }} onPress={handleApproveLeave} />
            </View>
          </Card>
        </View>
      )}

      {activeTab === 'leave' && (
        <View style={styles.tabContent}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Leave Pipeline</Text>
            <View style={styles.leaveRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.employeeName}>Ama Owusu</Text>
                <Text style={styles.leaveDetail}>Front Desk · Annual Leave (5 Days)</Text>
              </View>
              <Badge tone="warning" label="Pending Approval" />
            </View>
            <View style={styles.leaveRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.employeeName}>Kofi Adjei</Text>
                <Text style={styles.leaveDetail}>Branch Desk · Sick Leave (2 Days)</Text>
              </View>
              <Badge tone="success" label="Approved & Active" />
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
  leaveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  employeeName: {
    color: colors.foreground,
    fontWeight: '700',
    fontSize: font.sm,
  },
  leaveDetail: {
    color: colors.muted,
    fontSize: font.xs,
  },
});
