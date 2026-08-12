import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Redirect } from 'expo-router';
import { Badge, Card, KpiCard, Button } from '../../components/ui';
import { PortalLayout } from '../../components/PortalLayout';
import { useAuth } from '../../lib/auth';
import { branchName, raiseAlert } from '../../lib/data';
import { colors, font, spacing, radius } from '../../theme/tokens';
import { sendLocalNotification } from '../../lib/native';

type JobStage = 'scheduled' | 'in_progress' | 'done';
interface Job {
  id: string;
  customer: string;
  task: string;
  stage: JobStage;
}
const STAGE_META: Record<JobStage, { label: string; tone: 'warning' | 'info' | 'success'; next?: JobStage; action?: string }> = {
  scheduled: { label: 'Scheduled', tone: 'warning', next: 'in_progress', action: 'Start Job' },
  in_progress: { label: 'In Progress', tone: 'info', next: 'done', action: 'Mark Complete' },
  done: { label: 'Completed', tone: 'success' },
};

const SEED_JOBS: Job[] = [
  { id: 'JOB-88', customer: 'Mensah Residence', task: 'Ceiling fan + light install', stage: 'scheduled' },
  { id: 'JOB-87', customer: 'Adom Plaza', task: 'Floodlight replacement (x4)', stage: 'in_progress' },
  { id: 'JOB-85', customer: 'Kofi Villa', task: 'Consumer unit upgrade', stage: 'done' },
];

interface Part {
  sku: string;
  name: string;
  level: 'low' | 'out';
  suggested: number;
}
const PARTS: Part[] = [
  { sku: 'DL-6W-RND', name: 'Downlight 6W Round', level: 'low', suggested: 20 },
  { sku: 'CB-32A', name: 'Circuit Breaker 32A', level: 'out', suggested: 10 },
];

export default function TechnicianScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState<Job[]>(SEED_JOBS);
  const [requested, setRequested] = useState<Record<string, boolean>>({});

  if (!user) return <Redirect href="/" />;
  const branch = user.branchSlug ?? 'kumasi-abuakwa';

  const advance = (id: string, task: string, nextStage: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id && STAGE_META[j.stage].next ? { ...j, stage: STAGE_META[j.stage].next! } : j))
    );
    sendLocalNotification(
      'Job Status Updated 🛠️',
      `Job ${id} (${task}) moved to ${nextStage.replace('_', ' ')}.`
    );
  };

  const request = (p: Part) => {
    raiseAlert(branch, p.sku, p.name, p.suggested);
    setRequested((r) => ({ ...r, [p.sku]: true }));
    sendLocalNotification(
      'Part Requested 🚨',
      `Requested ${p.suggested}x ${p.name} from showroom.`
    );
  };

  const active = jobs.filter((j) => j.stage !== 'done');
  const done = jobs.filter((j) => j.stage === 'done');

  const tabs = [
    { id: 'jobs', label: 'My Jobs', icon: 'construct-outline' as const },
    { id: 'parts', label: 'Request Parts', icon: 'cube-outline' as const },
  ];

  return (
    <PortalLayout
      title="Technician Portal"
      subtitle={`Service Desk — ${branchName(branch)}`}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <View style={styles.kpiGrid}>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Active Jobs" value={active.length} icon="construct" tone="info" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Completed" value={done.length} icon="checkmark-done" tone="success" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Parts Needed" value={PARTS.length} icon="cube" tone="warning" />
        </View>
      </View>

      {activeTab === 'jobs' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Assigned Service Orders</Text>
          {jobs.map((j) => {
            const meta = STAGE_META[j.stage];
            return (
              <Card key={j.id} style={{ gap: spacing.sm }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.jobId}>{j.id}</Text>
                  <Badge tone={meta.tone} label={meta.label} />
                </View>
                <Text style={styles.jobCustomer}>{j.customer}</Text>
                <Text style={styles.item}>{j.task}</Text>
                {meta.action && (
                  <View style={{ marginTop: spacing.xs }}>
                    <Button
                      label={meta.action}
                      icon="play-forward-outline"
                      onPress={() => advance(j.id, j.task, meta.next!)}
                    />
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      )}

      {activeTab === 'parts' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Request Shortages or Outages</Text>
          {PARTS.map((p) => (
            <Card key={p.sku} style={styles.rowBetween}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.item}>{p.name}</Text>
                <Badge
                  tone={p.level === 'out' ? 'danger' : 'warning'}
                  label={p.level === 'out' ? 'Out of Stock' : 'Low Stock'}
                />
              </View>
              <Button
                label={requested[p.sku] ? 'Requested' : 'Request'}
                icon={requested[p.sku] ? 'checkmark' : 'add'}
                variant={requested[p.sku] ? 'ghost' : 'outline'}
                disabled={requested[p.sku]}
                onPress={() => request(p)}
              />
            </Card>
          ))}
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
    gap: spacing.md,
  },
  jobId: {
    color: colors.foreground,
    fontWeight: '800',
    fontSize: font.md,
  },
  jobCustomer: {
    color: colors.foreground,
    fontWeight: '700',
    fontSize: font.sm,
  },
  item: {
    color: colors.foreground,
    fontSize: font.sm,
  },
});
