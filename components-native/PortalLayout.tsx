import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  useWindowDimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, font, spacing, radius } from '../theme/tokens';
import { useAuth } from '../lib/auth';

interface TabItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface PortalLayoutProps {
  title: string;
  subtitle?: string;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
}

export function PortalLayout({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  children,
}: PortalLayoutProps) {
  const { width } = useWindowDimensions();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const isTablet = width >= 768;

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  // Render sidebar for tablet
  const renderSidebar = () => {
    return (
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <View style={styles.logoCircle}>
            <Ionicons name="flash" size={20} color={colors.primaryText} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.sidebarTitle} numberOfLines={1}>Cofkans Electricals</Text>
            <Text style={styles.sidebarSubtitle} numberOfLines={1}>{title}</Text>
          </View>
        </View>

        <ScrollView style={styles.sidebarNav}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Pressable
                key={tab.id}
                onPress={() => onTabChange(tab.id)}
                style={[
                  styles.navItem,
                  isActive && styles.navItemActive,
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={20}
                  color={isActive ? colors.primary : colors.muted}
                />
                {isActive && <View style={styles.activeMarker} />}
                <Text
                  style={[
                    styles.navLabel,
                    isActive && styles.navLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sidebarFooter}>
          {user && (
            <View style={styles.userProfile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.userName} numberOfLines={1}>{user.displayName}</Text>
                <Text style={styles.userRole} numberOfLines={1}>
                  {user.role.replace('_', ' ')}
                </Text>
              </View>
            </View>
          )}
          <Pressable onPress={handleSignOut} style={styles.signOutBtn}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // Render bottom nav bar for mobile phone
  const renderMobileTabs = () => {
    return (
      <View style={styles.mobileTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mobileTabsScroll}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Pressable
                key={tab.id}
                onPress={() => onTabChange(tab.id)}
                style={[
                  styles.mobileTab,
                  isActive && styles.mobileTabActive,
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={16}
                  color={isActive ? colors.primaryText : colors.muted}
                />
                <Text
                  style={[
                    styles.mobileTabLabel,
                    isActive && styles.mobileTabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {isTablet ? (
          // Tablet Mode: Split-Screen Sidebar + Content
          <View style={styles.tabletLayout}>
            {renderSidebar()}
            <View style={styles.mainContentContainer}>
              <View style={styles.contentHeader}>
                <View>
                  <Text style={styles.titleText}>{title}</Text>
                  {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
                </View>
                {user && (
                  <View style={styles.badgeWrap}>
                    <Text style={styles.badgeText}>{user.role.toUpperCase().replace('_', ' ')}</Text>
                  </View>
                )}
              </View>
              <ScrollView
                style={styles.mainScroll}
                contentContainerStyle={styles.mainContent}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            </View>
          </View>
        ) : (
          // Mobile Phone Mode: Tabs + Content
          <View style={styles.mobileLayout}>
            <View style={styles.mobileHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                <View style={styles.logoCircleSmall}>
                  <Ionicons name="flash" size={14} color={colors.primaryText} />
                </View>
                <View>
                  <Text style={styles.mobileTitleText} numberOfLines={1}>{title}</Text>
                  {subtitle && <Text style={styles.mobileSubtitleText}>{subtitle}</Text>}
                </View>
              </View>
              <Pressable onPress={handleSignOut} style={styles.mobileSignOut}>
                <Ionicons name="log-out-outline" size={20} color={colors.muted} />
              </Pressable>
            </View>

            {renderMobileTabs()}

            <ScrollView
              style={styles.mainScroll}
              contentContainerStyle={styles.mainContentMobile}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  tabletLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileLayout: {
    flex: 1,
  },
  sidebar: {
    width: 250,
    backgroundColor: colors.card,
    borderRightWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircleSmall: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  sidebarTitle: {
    fontSize: font.md,
    fontWeight: '800',
    color: colors.foreground,
  },
  sidebarSubtitle: {
    fontSize: font.xs,
    color: colors.muted,
  },
  sidebarNav: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    marginVertical: 2,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  navItemActive: {
    backgroundColor: colors.cardAlt,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.md - 3,
  },
  activeMarker: {
    position: 'absolute',
    right: spacing.sm,
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  navLabel: {
    fontSize: font.sm,
    fontWeight: '600',
    color: colors.muted,
  },
  navLabelActive: {
    color: colors.foreground,
    fontWeight: '700',
  },
  sidebarFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: font.sm,
  },
  userName: {
    color: colors.foreground,
    fontSize: font.sm,
    fontWeight: '700',
  },
  userRole: {
    color: colors.muted,
    fontSize: font.xs,
    textTransform: 'capitalize',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  signOutText: {
    color: colors.danger,
    fontSize: font.sm,
    fontWeight: '600',
  },
  mainContentContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  titleText: {
    fontSize: font.xl,
    fontWeight: '800',
    color: colors.foreground,
  },
  subtitleText: {
    fontSize: font.sm,
    color: colors.muted,
    marginTop: 2,
  },
  badgeWrap: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mainScroll: {
    flex: 1,
  },
  mainContent: {
    padding: spacing.xl,
    paddingTop: 0,
    gap: spacing.xl,
  },
  mainContentMobile: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  mobileTitleText: {
    fontSize: font.md,
    fontWeight: '800',
    color: colors.foreground,
  },
  mobileSubtitleText: {
    fontSize: 11,
    color: colors.muted,
  },
  mobileSignOut: {
    padding: 4,
  },
  mobileTabsContainer: {
    backgroundColor: colors.card,
    elevation: 2,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  mobileTabsScroll: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  mobileTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mobileTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mobileTabLabel: {
    fontSize: font.xs,
    fontWeight: '600',
    color: colors.muted,
  },
  mobileTabLabelActive: {
    color: colors.primaryText,
    fontWeight: '700',
  },
});
