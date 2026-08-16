# COFKANS ELECTRICALS - MANAGER PORTAL

## Complete Figma Design Specification

---

## 📋 PROJECT OVERVIEW

**Project Name:** COFKANS ELECTRICALS ERP  
**Module:** General Manager Portal  
**Design Language:** Premium Enterprise Dashboard (SAP, Oracle, Linear, Stripe inspired)  
**Target Users:** General Managers & Operations Executives  
**Platforms:** Web (Desktop/Tablet) & Native (iOS/Android)

---

## 🎨 DESIGN SYSTEM

### Color Palette

- **Primary:** Deep Forest Green (`#1B5E3F`)
- **Secondary:** Emerald (`#10B981`), Mint (`#6EE7B7`)
- **Accent:** Electric Blue (`#0EA5E9`), Amber (`#F59E0B`), Red (`#EF4444`), Purple (`#A855F7`)
- **Background:** Very Light Gray (`#F9FAFB`)
- **Cards:** Pure White (`#FFFFFF`)
- **Text:** Dark Gray (`#1F2937`), Muted Gray (`#6B7280`)

### Typography

- **Bold Headings:** Large, bold statistics (24-32px)
- **Medium Headings:** Page titles & section headers (18-20px)
- **Body Text:** Regular content (14-16px)
- **Labels & Descriptions:** Small muted text (12px)

### Spacing & Radius

- **Generous Whitespace:** 16-24px gaps between sections
- **Card Radius:** 18-24px
- **Soft Shadows:** `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`

### Animations

- Smooth transitions (0.3s ease)
- Animated counters for KPIs
- Loading skeletons
- Hover states on all interactive elements
- Micro-interactions (button scale, card lift)

---

## 🏗️ GLOBAL LAYOUT

### Sticky Sidebar (Persistent Navigation)

**Left Side | Always Visible**

- **Logo & Brand:** COFKANS ELECTRICALS (collapsible in mobile)
- **Navigation Menu:**
  - Dashboard
  - Branch Management
  - Inventory & Stock
  - Sales & Revenue
  - Employees
  - Reports
  - Settings
  - Help & Support
- **Collapse/Expand:** Arrow icon to minimize sidebar
- **Branch Selector:** Dropdown showing active branch (if multi-branch user)
- **AI Assistant Button:** Floating action at bottom of sidebar

### Top Navigation Bar (Fixed Header)

**Full Width | Above Content**

- **Left:** Breadcrumb navigation (Home > Dashboard > [Current Page])
- **Center:** Page title + subtitle
- **Right Section:**
  - Search Bar (Global search with CTRL+K shortcut hint)
  - Notifications Bell (with badge count)
  - Profile Dropdown
  - Theme Toggle (Light/Dark mode)

### Main Content Area

- **Full bleed grid layout** with generous padding
- **Responsive:** Desktop (1400px+), Tablet (768px-1399px), Mobile (< 768px)
- **Sticky breadcrumb** below top nav
- **Quick action buttons** for common tasks

### Mobile Responsiveness

- Sidebar → Hamburger menu drawer
- Stacked grid (1 column instead of 2-3)
- Bottom navigation for primary actions
- Full-screen modal dialogs

---

## 📄 PAGE SPECIFICATIONS

### PAGE 1: DASHBOARD (Main Landing)

**Route:** `/manager` or `/manager/dashboard`  
**Permission:** General Manager role only

#### Layout Sections

**1. Header Section**

- Page Title: "Executive Dashboard"
- Subtitle with date range selector (This Month / Last Month / Custom Range)
- Quick stats pill: "Last Updated: 2 mins ago" with refresh button

**2. KPI Cards Grid (Top Section)**
Display 4-6 key metrics in 2x2 grid on desktop, stacked on mobile:

| Card                  | Content                                                                               |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Today's Sales**     | Large number (e.g., "GH₵ 24,580"), Sub-text: "+12% vs yesterday", Sparkline chart     |
| **Monthly Revenue**   | Large number (e.g., "GH₵ 385,200"), Sub-text: "78% of target", Progress bar           |
| **Profit**            | Large number (e.g., "GH₵ 92,400"), Sub-text: "28% margin", Icon: trending up          |
| **Cash Flow**         | Large number (e.g., "GH₵ 156,800"), Sub-text: "vs GH₵ 142,000 last month", Comparison |
| **Inventory Value**   | Large number (e.g., "GH₵ 2.4M"), Sub-text: "5 items low stock", Alert badge           |
| **Pending Approvals** | Large number (e.g., "23"), Sub-text: "8 urgent", Red badge                            |

Each card should have:

- Icon (Lucide Icons)
- Value in large bold text (32px)
- Subtitle with % change or status
- Sparkline or mini chart (recharts)
- Hover state: slight lift + shadow increase

**3. Sales Trend Chart (Half Width)**

- **Type:** Line Chart (Recharts - Area variant)
- **Title:** "Sales Trend - Last 30 Days"
- **X-Axis:** Dates (Mon, Tue, Wed... or dates)
- **Y-Axis:** GH₵ amounts
- **Colors:** Emerald/Green gradient
- **Interactive:** Tooltip on hover, legend selector
- **Height:** 300px
- **Responsive:** Full width on tablet/mobile

**4. Revenue Breakdown by Category (Quarter Width)**

- **Type:** Donut Chart
- **Title:** "Revenue by Category"
- **Categories:** Lighting (35%), Power Tools (25%), Smart Home (20%), Cables (15%), Other (5%)
- **Legend:** Below chart, clickable to toggle visibility
- **Center Number:** Total revenue amount

**5. Branch Performance Comparison (Half Width)**

- **Type:** Bar Chart (Horizontal)
- **Title:** "Top Branches - Monthly Sales"
- **Branches:**
  - Head Office: GH₵ 145,000
  - Asuoyeboa: GH₵ 98,500
  - Adum: GH₵ 87,200
  - Abuakwa: GH₵ 54,300
- **Colors:** Gradient from Emerald to Mint
- **Ranking Badge:** #1, #2, #3 on bars

**6. Quick Actions Section (Full Width)**

- **Title:** "Quick Actions"
- **Buttons in a row (scrollable on mobile):**
  - - Create Purchase Order
  - ✓ Approve Transfer
  - 📊 View Reports
  - 👥 Manage Staff
  - 🏷️ Approve Discounts
  - ↩️ Approve Returns
  - 💰 Manage Expenses

**7. Alerts & Notifications (Full Width Card)**

- **Title:** "Global Alerts"
- **Alert Pills (clickable):**
  - 🟢 "5 branches active" → Green pill
  - 📦 "274 products catalogued" → Blue pill
  - ⚠️ "2 items out of stock" → Amber/Red pill
  - 📈 "Sales up 12% this week" → Green pill
  - 🔴 "Critical: Abuakwa branch offline" → Red pill

**8. Recent Activity Timeline (Full Width)**

- **Title:** "Recent Activity"
- **Timeline format** with: Timestamp | Action | User | Impact
- Example rows:
  - "10:45 AM | Purchase order created | John Mensah | PO-2024-0845"
  - "09:30 AM | Stock transfer approved | Sarah Boateng | 50 units transferred"
  - "08:15 AM | New customer registered | Front Desk - Head Office | Maria Owusu"
  - "Yesterday | Inventory count completed | Warehouse Team | 2,450 items"
- **Load more button** at bottom

---

### PAGE 2: BRANCH MANAGEMENT

**Route:** `/manager/branches`

#### Layout

**1. Header Section**

- Title: "Branch Network"
- Subtitle: "Manage & monitor all branches"
- Search bar (search by branch name, region)
- Filter dropdown: "Show: All / Active / Offline"

**2. Branch Statistics Summary**

- Cards showing: Total Branches | Active | Offline | Total Staff | Total Sales (this month)

**3. Branch Cards Grid (Full Width, Responsive)**

- **Grid:** 3 columns on desktop, 2 on tablet, 1 on mobile
- **Per Card:**
  - Branch name (large, bold)
  - Region badge (e.g., "Ashanti Region")
  - Status badge: Green "Active" or Red "Offline"
  - Mini stats:
    - 👥 Staff Count: "12 employees"
    - 📊 Today's Sales: "GH₵ 8,450"
    - 📦 Stock Value: "GH₵ 345,600"
  - Quick info: Last sync time, connection status
  - Action buttons: View Details | Edit | Reports
  - Hover effect: Card lifts, accent border appears

**4. Branch Details Modal (When clicking "View Details")**

- Modal title: "[Branch Name] Details"
- Tabs:
  - **Overview:** General info, address, contact, operating hours
  - **Staff:** List of employees, roles, status
  - **Inventory:** Current stock, low items, recent changes
  - **Sales:** Daily breakdown, top products
  - **Settings:** Permissions, delivery zones, pricing
- Full-width tables with sorting/filtering

**5. Add/Create Branch Button**

- Floating action button (FAB) or prominent button
- Opens a form modal with fields: Name, Region, Address, Contact, Opening Hours, etc.

---

### PAGE 3: INVENTORY & STOCK

**Route:** `/manager/inventory`

#### Layout

**1. Header Section**

- Title: "Inventory Management"
- Inventory health score (large gauge: 0-100%)
- Date range selector

**2. Inventory Health Summary Cards**

- Total Products
- Low Stock Items (with warning count)
- Dead Stock Items (items not sold in 90 days)
- Stock Forecast Alert Count
- Inventory Turnover Rate (%)

**3. Low Stock Alert Table**

- **Columns:** Product | SKU | Current Stock | Minimum Level | Branch | Reorder Date | Action
- **Sorting:** By priority (most urgent first)
- **Colors:** Row highlight in soft red for critical items
- **Action buttons:** Reorder | Create PO | View Details
- **Pagination:** 10 items per page with load more

**4. Fast-Moving vs Dead Stock Chart**

- **Type:** Horizontal bar chart or comparison
- **Left side:** Top 10 fast-moving products with quantity
- **Right side:** Top 10 dead stock items with last sale date
- **Interactive:** Click product to see details

**5. Inventory Forecast Chart**

- **Type:** Line chart showing predicted stock levels
- **X-Axis:** Next 60 days
- **Y-Axis:** Stock quantity
- **Color coding:** Green (optimal), Amber (warning), Red (critical)
- **Legend:** With checkboxes to toggle product categories

**6. Stock Transfer Requests (Pending)**

- Small card section showing pending transfers
- List of: From | To | Items | Status | Action
- Quick approve/reject buttons

---

### PAGE 4: SALES & REVENUE

**Route:** `/manager/sales`

#### Layout

**1. Header Section**

- Title: "Sales & Revenue Analytics"
- Performance comparison dropdown: "vs Last Month / vs Last Year / vs Target"
- Date range selector

**2. Key Metrics Cards (Top Section)**

- Total Revenue (period)
- Average Order Value
- Orders Count
- Conversion Rate (%)
- Customer Lifetime Value

**3. Revenue Trend Chart (Large, Full Width)**

- **Type:** Stacked area chart
- **X-Axis:** Dates (last 30 days)
- **Y-Axis:** Amount
- **Stacked by:** Different product categories (Lighting, Tools, Smart Home, Cables, etc.)
- **Interactive:** Toggle categories on/off
- **Legend:** Color-coded categories

**4. Top Products by Sales (Ranking)**

- **Type:** Horizontal bar chart
- **Show top 8 products** with quantities and revenue
- **Hover tooltip:** Full product name, SKU, margin %
- **Color:** Gradient from primary to accent

**5. Sales by Category (Donut)**

- Donut chart with categories and percentages
- Center: Total sales amount
- Clickable legend

**6. Branch Comparison - Sales Performance**

- **Type:** Bar chart (vertical or horizontal)
- **X-Axis/Categories:** Branch names
- **Y-Axis:** Revenue
- **Color by branch:** Different shades
- **Data labels:** On top of bars

**7. Sales Targets Dashboard**

- Card section showing:
  - Overall target completion (%)
  - Progress bar
  - Branches achieving/missing targets
  - Color: Green if above target, Amber if close, Red if below

**8. Orders Table**

- **Columns:** Order ID | Customer | Amount | Date | Status | Action
- **Filters:** Date range, status (pending, completed, cancelled), branch
- **Sorting:** By date, amount, status
- **Quick actions:** View Order | Print Invoice | Process Return

---

### PAGE 5: EMPLOYEES & STAFF MANAGEMENT

**Route:** `/manager/employees`

#### Layout

**1. Header Section**

- Title: "Employee Management"
- Total employees count
- Filter: By branch, department, status
- Add new employee button

**2. Staff Summary Cards**

- Total Staff
- Active Employees
- On Leave
- New Hires (this month)
- Department breakdown (donut or bar)

**3. Staff Directory Table**

- **Columns:** Name | Role | Department | Branch | Status | Join Date | Performance Score | Action
- **Status badge:** Active (green), On Leave (amber), Inactive (gray)
- **Sorting & filtering:** By department, branch, role
- **Inline actions:** View Profile | Edit | Promote | Suspend | Terminate
- **Search:** Search by name or ID

**4. Department Performance**

- **Type:** Horizontal bar chart showing average performance by department
- **Departments:** Front Desk, Warehouse, Drivers, Technicians, etc.
- **Color:** Gradient from primary

**5. Attendance Overview**

- **Type:** Calendar heatmap or summary
- **Show:** Days attended, absences, leaves
- **Filter:** By month, quarter
- **Employees with most absences:** Quick list

**6. New Hires Section**

- Cards showing recent new employees
- Per card: Photo | Name | Role | Department | Start Date | Manager
- Action: View Profile | Assign Training

**7. Performance Ratings**

- **Type:** Distribution chart (how many employees at each rating level)
- **Ratings:** 1-5 stars
- **Detailed list:** Top performers, needs improvement, average

---

### PAGE 6: REPORTS & ANALYTICS

**Route:** `/manager/reports`

#### Layout

**1. Header Section**

- Title: "Reports & Analytics"
- Report type selector (dropdown)
- Date range, branch filter
- Export buttons (PDF, Excel, CSV)

**2. Report Templates (Quick Access Cards)**

- Daily Sales Report
- Monthly Revenue Report
- Inventory Report
- Employee Performance Report
- Customer Acquisition Report
- Financial Summary
- Branch Comparison Report
- Stock Movement Report

Each card shows:

- Report name, description, last generated date
- Quick generate button
- Save report to favorites

**3. Custom Report Builder (Optional)**

- Section allowing users to create custom reports
- Drag-and-drop interface or form
- Select: Metrics, filters, date range, grouping
- Preview button
- Save & Schedule button

**4. Scheduled Reports**

- List of automated reports
- Each showing: Report name | Schedule | Last run | Next run | Download | Edit | Delete

**5. Report Archive**

- Sortable list of previously generated reports
- Columns: Name | Generated Date | Type | File Size | Download | Delete

---

### PAGE 7: APPROVALS QUEUE

**Route:** `/manager/approvals`

#### Layout

**1. Header Section**

- Title: "Approvals Queue"
- Approval count badge (showing pending count)
- Filter: By type, date, status

**2. Approval Summary Cards**

- Pending Approvals (count)
- Approved (today)
- Rejected (today)
- Awaiting Your Review (high priority)

**3. Pending Approvals Kanban/List**

- **Type:** Kanban board or grouped list
- **Columns/Groups:** Purchase Orders | Discounts | Returns | Transfers | Expenses
- **Per Item:**
  - Item ID/details
  - Requested by
  - Amount (if applicable)
  - Request date
  - Actions: Approve with optional note | Reject with reason | Request Info

**4. Individual Approval Modal (When clicking item)**

- Full details of the request
- Related documents (PDF, images, etc.)
- Comments/notes section
- Approval history (if previously reviewed)
- Approve/Reject/Request Info buttons

**5. Approved/Rejected History**

- Tabs showing recently approved vs rejected items
- Details: Item | Approval date | Approved by (for items you approved) | Notes

---

### PAGE 8: SETTINGS & CONFIGURATION

**Route:** `/manager/settings`

#### Layout

**1. Header Section**

- Title: "Settings & Configuration"
- Tabs: General | Notifications | Security | Data & Integrations | Help

**2. General Tab**

- Language & Localization
- Timezone selection
- Date/time format
- Currency preferences
- Default branch (if multi-branch)
- Business details (name, logo, address)

**3. Notifications Tab**

- Toggle for email notifications
- Toggle for in-app notifications
- Alert preferences:
  - Low stock alerts
  - Order notifications
  - Approval notifications
  - Employee alerts
  - System alerts
- Notification frequency: Real-time, Daily Digest, Weekly
- Quiet hours setting

**4. Security Tab**

- Change password (with current password required)
- Two-factor authentication (enable/disable)
- Active sessions list (view and log out)
- Login history
- API keys (if developer access)
- Backup codes (for 2FA)

**5. Data & Integrations Tab**

- Connected integrations (Flutterwave, SMS provider, etc.)
- Backup & restore options
- Data export (all user data)
- Account activity log

**6. Help Tab**

- Keyboard shortcuts guide
- FAQ section
- Contact support form
- Documentation links
- Version info & changelog

---

### PAGE 9: DASHBOARD CUSTOMIZATION

**Route:** `/manager/dashboard-builder` (or in settings modal)

#### Layout

**1. Header Section**

- Title: "Customize Dashboard"
- Save & Cancel buttons
- Reset to default button

**2. Widgets Library**

- Grid of available widgets (cards)
- Each widget: Thumbnail | Name | Description | Add button
- Categories: KPIs, Charts, Tables, Alerts

**3. Current Dashboard Preview**

- Drag-and-drop area showing currently selected widgets
- Each widget has: Remove | Edit | Move up/down (or drag)
- Preview checkbox to see live preview
- Responsive preview (show desktop/tablet/mobile)

**4. Widget Configuration**

- When editing a widget: Color scheme, date range, metrics to show, refresh rate

---

### PAGE 10: NOTIFICATIONS CENTER

**Route:** Pop-over/Modal from top navigation

#### Layout

**1. Header**

- Title: "Notifications"
- Mark all as read button
- Settings icon

**2. Notification List**

- **Per notification:**
  - Icon (contextual: success, warning, error, info)
  - Title & message
  - Timestamp ("2 mins ago")
  - Status badge: Unread (dot indicator)
  - Action button or dismiss

**3. Notification Categories/Tabs**

- All | Urgent | System | Approvals | Inventory | Sales

**4. Clear notifications**

- Clear all button
- Clear by category

---

### PAGE 11: PROFILE & ACCOUNT

**Route:** Modal/Drawer from top navigation

#### Layout

**1. Header**

- Profile photo (large, 80px)
- User name
- Role badge ("General Manager")
- Branch (if applicable)

**2. Quick Info**

- Email
- Phone
- Department
- Manager name (if applicable)
- Join date

**3. Action Buttons**

- Edit Profile
- Change Password
- Notification Settings
- Logout

**4. Activity Summary**

- Last login
- Sessions count
- Recent activity (last 5 actions)

---

### PAGE 12: AI ASSISTANT / INSIGHTS

**Route:** Modal/Sidebar or floating panel

#### Layout (Floating AI Chat Panel)

**1. Header**

- "AI Assistant" title
- Minimize/expand button
- Close button

**2. Chat Interface**

- Message history (scrollable)
- User messages (right-aligned, blue background)
- AI responses (left-aligned, gray background)

**3. Input Area**

- Text input field
- "Ask anything..." placeholder
- Send button (or enter to send)
- Mic icon (voice input)
- Attachment icon (upload files)

**4. Quick Suggestions**

- "Generate sales report"
- "Forecast inventory for Q4"
- "Show customer insights"
- "Analyze branch performance"
- "Predict purchase needs"

**5. AI Capabilities Summary**

- AI Sales Forecast
- AI Inventory Prediction
- AI Customer Insights
- AI Demand Forecast
- AI Product Recommendations
- Smart Search
- Report generation

---

## 🔌 COMPONENT LIBRARY REQUIREMENTS

Ensure all components use:

- **Lucide Icons** (for consistency)
- **Radix UI** primitives (for accessibility)
- **Recharts** (for all data visualizations)
- **TailwindCSS** (for styling)
- **Framer Motion** (for animations)

### Key Components Needed:

- KPI Card / Stat Card
- Chart wrapper (with title, legend, toolbar)
- Data table (with sorting, filtering, pagination)
- Modal / Dialog
- Drawer
- Dropdown / Select
- Notification / Toast
- Badge / Pill
- Button (multiple variants)
- Input fields (text, email, phone, date)
- Checkbox / Radio
- Toggle Switch
- Progress bar / Ring
- Skeleton loader
- Empty state
- Error state
- Loading spinner
- Breadcrumb
- Tabs
- Accordion
- Card container
- Section divider

---

## 📱 MOBILE CONSIDERATIONS

**Breakpoints:**

- Desktop: 1400px+
- Tablet: 768px - 1399px
- Mobile: < 768px

**Mobile Specific Pages:**

- Hamburger sidebar (drawer)
- Bottom navigation bar (for quick access)
- Full-screen modals (not side drawers)
- Single column layouts
- Stacked cards
- Simplified tables → Card list
- Touch-friendly button sizes (min 44px)
- Larger spacing/padding

---

## 🎯 INTERACTION PATTERNS

**Hover States:**

- All cards: Shadow increase, slight scale (1.02)
- Buttons: Background color shift, cursor pointer
- Links: Underline appears, color change
- Icons: Rotation or scale

**Loading States:**

- Skeleton loaders for content areas
- Animated spinner for full-page loads
- Pulse animation for updating data

**Success/Error States:**

- Green toast for successful actions
- Red toast for errors
- Checkmark animation for confirmations

**Empty States:**

- Illustration + "No data available" message
- CTA button to create content (if applicable)

---

## 📊 DATA VISUALIZATION GUIDELINES

**Charts Used:**

- Line Charts: Trends over time
- Area Charts: Revenue/sales accumulation
- Bar Charts: Comparisons between categories
- Horizontal Bar Charts: Rankings
- Donut/Pie Charts: Composition
- Gauge Charts: Performance indicators
- Heatmaps: Dense data
- Sparklines: Mini inline trends

**Color Usage in Charts:**

- Primary series: Emerald/Green
- Secondary series: Electric Blue
- Accent series: Amber, Purple
- Alerts: Red for critical

**Interactivity:**

- Hover tooltips showing detailed data
- Click to drill down or filter
- Legend clickable to toggle series
- Zoom/pan for large datasets

---

## 🔐 Security & Accessibility

**Accessibility:**

- WCAG 2.1 AA compliant
- Color contrast ratios ≥ 4.5:1
- Keyboard navigation (Tab, Enter, Esc)
- ARIA labels on all interactive elements
- Focus indicators visible
- Alt text for images
- Semantic HTML

**Security Indicators:**

- Lock icon for secure sections
- Session timeout warnings
- Sensitive data redaction (e.g., partial card numbers)

---

## 📐 GRID & SPACING SYSTEM

**8px Base Unit Grid**

- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- 2XL: 48px

**Container Widths:**

- Mobile: 100% - 16px padding
- Tablet: max-width 960px
- Desktop: max-width 1400px

---

## 🎬 ANIMATION SPECIFICATIONS

**Page Transitions:**

- Fade in: 300ms
- Slide in from left (drawer): 250ms

**Micro-interactions:**

- Button hover: 150ms ease
- Loading spinner: continuous rotation (2s cycle)
- Counter animations: 1s ease-out
- Tooltip fade: 200ms

**Accessibility:**

- Respect `prefers-reduced-motion`
- Don't auto-play animations
- Pause animations on user request

---

## 📸 MOCKUP PRIORITY

**High Priority (Create First):**

1. Dashboard (Main Landing)
2. Branch Management
3. Sales & Revenue
4. Approvals Queue

**Medium Priority:** 5. Inventory & Stock 6. Employees 7. Reports

**Lower Priority (Can be simplified initially):** 8. Settings 9. Notifications 10. AI Assistant 11. Dashboard Customization 12. Profile

---

## ✅ DESIGN HANDOFF CHECKLIST

Before sending to development:

- [ ] All pages created in Figma
- [ ] Component library established
- [ ] Color tokens documented
- [ ] Typography scale defined
- [ ] Spacing system clear
- [ ] Animation specs documented
- [ ] Responsive breakpoints shown (desktop/tablet/mobile)
- [ ] Dark mode variants (if required)
- [ ] Icon set (Lucide) integrated
- [ ] Hover/active/disabled states shown
- [ ] Loading/error/empty states shown
- [ ] Accessibility annotations added
- [ ] Design system/guidelines document
- [ ] Interactive prototype (optional)

---

## 🚀 NEXT STEPS

1. **Create Figma file** with this specification
2. **Build component library** in Figma
3. **Design all pages** following this spec
4. **Create interactive prototype** for key flows
5. **Export design tokens** (colors, typography, spacing)
6. **Share with development team**
7. **Iterate based on feedback**

---

**Document Version:** 1.0  
**Last Updated:** August 2024  
**Status:** Ready for Figma Design
