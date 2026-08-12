import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import { Badge, Card, KpiCard, Button } from '../components/ui';
import { PortalLayout } from '../components/PortalLayout';
import { useAuth } from '../lib/auth';
import { colors, font, spacing, radius } from '../theme/tokens';
import { sendLocalNotification } from '../lib/native';

export default function MarketingScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) return <Redirect href="/" />;

  const handleSMSCampaign = () => {
    Alert.alert('New SMS Campaign', 'Opening Hubtel GSM SMS compose box.');
    sendLocalNotification(
      'SMS Broadcast Started composition 📢',
      'Broadcasting queue opened. Drafting campaign text.'
    );
  };

  const handleNewPromo = () => {
    Alert.alert('New Promo Code', 'Opening discount percentage code generator.');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'megaphone-outline' as const },
    { id: 'promos', label: 'Promotions', icon: 'pricetags-outline' as const },
  ];

  return (
    <PortalLayout
      title="Marketing Hub"
      subtitle="SMS broadcasting and promotional coupon configurations"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <View style={styles.kpiGrid}>
        <View style={styles.kpiWrapper}>
          <KpiCard label="SMS Recipients" value="1,240 Contacts" sub="Ghana opt-in base" icon="chatbubble-ellipses-outline" tone="primary" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Active Promos" value="4 Codes" sub="Live on storefront" icon="pricetag-outline" tone="success" />
        </View>
        <View style={styles.kpiWrapper}>
          <KpiCard label="Campaign CTR" value="18.2%" sub="+2.5% vs Q2 average" icon="analytics-outline" tone="info" />
        </View>
      </View>

      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Campaign Operations</Text>
            <Text style={styles.hint}>Configure broadcasting options or push new promotion campaigns to active users.</Text>
            <View style={styles.actionRow}>
              <Button label="New SMS Broadcast" icon="paper-plane-outline" style={{ flex: 1 }} onPress={handleSMSCampaign} />
              <Button label="Create Promo Code" icon="pricetag-outline" variant="outline" style={{ flex: 1 }} onPress={handleNewPromo} />
            </View>
          </Card>
        </View>
      )}

      {activeTab === 'promos' && (
        <View style={styles.tabContent}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Promo Code Status</Text>
            <View style={styles.promoRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.promoCode}>KASA15</Text>
                <Text style={styles.promoDetail}>15% Off lighting · Ends in 3 days</Text>
              </View>
              <Badge tone="success" label="Active" />
            </View>
            <View style={styles.promoRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.promoCode}>SOLAR20</Text>
                <Text style={styles.promoDetail}>20% Off solar accessories · Ended</Text>
              </View>
              <Badge tone="danger" label="Expired" />
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
  promoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  promoCode: {
    color: colors.foreground,
    fontWeight: '700',
    fontSize: font.sm,
  },
  promoDetail: {
    color: colors.muted,
    fontSize: font.xs,
  },
});
