import { DEMO_MODE } from '../demo-mode';
import { findRelevantFaq, SYSTEM_PROMPT } from './knowledge';
import type { KbSubmission, ChatUserRole } from './types';

export interface AskResult {
  text: string;
  confidence: number;
  source: 'faq' | 'kb' | 'gemini' | 'fallback';
  kbId?: string;
}

export interface AskContext {
  name?: string;
  role?: ChatUserRole;
  isGuest?: boolean;
  route?: string;
  routeLabel?: string;
  product?: { name: string; category?: string; subcategory?: string; price?: number; sku?: string };
}

export interface SuggestedQuestion {
  id: string;
  label: string;
  prompt: string;
}

function firstName(name?: string): string | undefined {
  if (!name) return undefined;
  const f = name.trim().split(' ')[0];
  return f && f.toLowerCase() !== 'guest' ? f : undefined;
}

function personalize(text: string, ctx: AskContext): string {
  const f = firstName(ctx.name);
  if (!f || ctx.isGuest) return text;
  // 30% chance to drop name in mid-reply, plus always allow simple prepend for short responses.
  if (text.length < 120) return `${f}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  if (Math.random() < 0.35) return text.replace(/^([A-Z])/, m => `${f} — ${m.toLowerCase()}`);
  return text;
}

export const CONCIERGE_NAME = 'Vanessa';

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const ACKS = ['Great question', 'Happy to help', 'Of course', 'Absolutely', 'Good thinking', 'Love that'];

const SALES_CLOSERS = [
  'Want me to pull a couple of options for you?',
  'Shall I narrow it down to the best fit for your space?',
  'Would you like a quick recommendation?',
  'Want me to check live stock for your area?',
  'Should I line up a free consultation for you?',
  'Want me to put together a quick quote?',
];

const FRUSTRATION = /\b(angry|upset|annoyed|frustrat|terrible|awful|worst|disappointed|unacceptable|ridiculous|fed up|complain|complaint|scam|cheat|refund now|never again|poor service|bad service|waiting (for )?(days|weeks|hours)|still not|broken again)\b/i;
const THANKS = /\b(thank|thanks|thx|appreciate|cheers|well done|nice one|you('?| a)re (great|helpful|the best))\b/i;

function endsWithQuestion(t: string): boolean { return /\?\s*$/.test(t.trim()); }

function humanize(text: string, opts: { ack?: boolean; close?: boolean } = {}): string {
  let out = text;
  if (opts.ack && Math.random() < 0.5) out = `${pick(ACKS)} — ${out.charAt(0).toLowerCase()}${out.slice(1)}`;
  if (opts.close && !endsWithQuestion(out)) out = `${out} ${pick(SALES_CLOSERS)}`;
  return out;
}

function rolePrefix(role?: ChatUserRole): string | null {
  switch (role) {
    case 'driver': return 'Driver tip';
    case 'technician': return 'Tech note';
    case 'support_agent': return 'Agent assist';
    case 'admin': return 'Admin';
    default: return null;
  }
}

function scoreKb(query: string, kb: KbSubmission): number {
  const q = query.toLowerCase();
  let score = 0;
  for (const tag of kb.tags) if (tag && q.includes(tag.toLowerCase())) score += 3;
  const words = kb.question.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  for (const w of words) if (q.includes(w)) score += 1;
  return score;
}

export function findRelevantKb(query: string, kb: KbSubmission[]): { entry: KbSubmission; score: number } | null {
  let best: { entry: KbSubmission; score: number } | null = null;
  for (const entry of kb) {
    if (entry.status !== 'approved') continue;
    const score = scoreKb(query, entry);
    if (!best || score > best.score) best = { entry, score };
  }
  return best && best.score > 0 ? best : null;
}

export async function ask(question: string, kb: KbSubmission[] = [], ctx: AskContext = {}): Promise<AskResult> {
  if (DEMO_MODE) return mockAnswer(question, kb, ctx);

  // Real wiring (commented until @google/generative-ai is added & key provided):
  // const { GoogleGenerativeAI } = await import('@google/generative-ai');
  // const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
  // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  // const res = await model.generateContent([SYSTEM_PROMPT, question].join('\n\n'));
  // return { text: res.response.text(), confidence: 0.85, source: 'gemini' };
  return mockAnswer(question, kb, ctx);
}

async function mockAnswer(question: string, kb: KbSubmission[] = [], ctx: AskContext = {}): Promise<AskResult> {
  await new Promise(r => setTimeout(r, 600 + Math.random() * 600));

  // Front-desk skill: if the customer is upset, lead with genuine empathy,
  // take ownership, and offer a human teammate — before anything else.
  if (FRUSTRATION.test(question)) {
    const f = firstName(ctx.name);
    const who = f && !ctx.isGuest ? `${f}, ` : '';
    return {
      text: `${who}I'm really sorry — that's not the experience we want for you, and I want to make it right. If you can share your order number or what happened, I'll get straight on it. I can also connect you with one of our human teammates right now if you'd prefer.`,
      confidence: 0.6,
      source: 'fallback',
    };
  }

  // Warm human touch for gratitude.
  if (THANKS.test(question) && question.trim().length < 60) {
    const f = firstName(ctx.name);
    return {
      text: `You're most welcome${f && !ctx.isGuest ? `, ${f}` : ''}! 😊 Is there anything else I can help you with — products, an order, or booking an install?`,
      confidence: 0.7,
      source: 'fallback',
    };
  }

  // Time-aware, human greeting with the concierge's name.
  if (/^\s*(hi|hello|hey|yo|hiya|good\s*(morning|afternoon|evening)|how are you|how('?| a)re you|are you there|anyone there)\b/i.test(question) && question.trim().length < 40) {
    const f = firstName(ctx.name);
    const named = f && !ctx.isGuest ? `${timeGreeting()}, ${f}!` : `${timeGreeting()}!`;
    return {
      text: `${named} I'm ${CONCIERGE_NAME}, your Cofkans concierge. Whether you're after lighting, solar, an inverter, or you need a hand with an order, I'm right here. What are you working on today?`,
      confidence: 0.75,
      source: 'fallback',
    };
  }

  // Product-context aware short-circuit — when the user is on a product page,
  // resolve "this/it" or generic intents to the actual product they're viewing.
  if (ctx.product) {
    const ctxHit = answerForProduct(question, ctx);
    if (ctxHit) return { text: humanize(personalize(ctxHit.text, ctx), { close: true }), confidence: ctxHit.confidence, source: 'fallback' };
  }

  // Role-specific answers win first — drivers/techs/agents/admins get their own playbook.
  const roleHit = detectRoleTopic(question, ctx.role);
  if (roleHit) {
    return { text: personalize(roleHit.answer, ctx), confidence: roleHit.confidence, source: 'fallback' };
  }

  // Approved KB takes precedence over baseline FAQ — agents curate it.
  const kbHit = findRelevantKb(question, kb);
  if (kbHit && kbHit.score >= 3) {
    return {
      text: personalize(kbHit.entry.answer, ctx),
      confidence: Math.min(0.95, 0.55 + kbHit.score * 0.07),
      source: 'kb',
      kbId: kbHit.entry.id,
    };
  }

  const hit = findRelevantFaq(question);
  if (hit && hit.score >= 3) {
    return { text: personalize(hit.entry.a, ctx), confidence: Math.min(0.95, 0.5 + hit.score * 0.08), source: 'faq' };
  }
  if (kbHit && kbHit.score >= 1) {
    return {
      text: personalize(`${kbHit.entry.answer}\n\nLet me know if you need more detail or want a human teammate.`, ctx),
      confidence: 0.5,
      source: 'kb',
      kbId: kbHit.entry.id,
    };
  }
  if (hit && hit.score >= 1) {
    return {
      text: personalize(`${hit.entry.a}\n\nIf that's not exactly what you meant, let me know and I can connect you with a human teammate.`, ctx),
      confidence: 0.45,
      source: 'faq',
    };
  }

  // Topic-aware fallback — actually try to help instead of punting.
  const topic = detectTopic(question);
  if (topic) {
    return { text: humanize(personalize(topic.answer, ctx), { ack: true, close: true }), confidence: topic.confidence, source: 'fallback' };
  }

  const f = firstName(ctx.name);
  const opener = f && !ctx.isGuest ? `${f}, I want` : 'I want';
  return {
    text: `${opener} to make sure I get this right. Could you share a bit more detail — for example the product name, order number, or what you're trying to do? I'm happy to dig in, and I can always connect you with one of our human teammates whenever you'd like.`,
    confidence: 0.3,
    source: 'fallback',
  };
}

const DRIVER_TOPICS: { keys: RegExp; answer: string; confidence: number }[] = [
  { keys: /\b(route|navigate|navigation|map|stops?)\b/i,
    answer: "Open the Routes tab — the system batches your stops in the optimal order with live traffic. Tap a stop for the customer's address, phone and any delivery notes. Mark each one delivered or failed before moving on so the next stop unlocks.",
    confidence: 0.7 },
  { keys: /\b(earning|payout|pay|wallet|cash[- ]?out)\b/i,
    answer: "Earnings live under the Earnings tab — base + per-stop + tips. Payouts run every Friday to your registered momo or bank. Tap a week to see the breakdown.",
    confidence: 0.7 },
  { keys: /\b(customer.*not.*home|no answer|wrong address|cannot deliver|failed delivery)\b/i,
    answer: "Try calling from the stop screen first. If still no luck, tap 'Mark failed' and pick a reason — dispatch is paged automatically and the stop is rescheduled. Don't leave packages unattended.",
    confidence: 0.7 },
  { keys: /\b(vehicle|van|bike|fuel|breakdown|accident|tire|tyre)\b/i,
    answer: "For breakdowns or accidents, tap the SOS shield in the app — dispatch and the nearest backup driver are alerted. Log fuel/maintenance under Vehicle so it's covered in your weekly reimbursement.",
    confidence: 0.7 },
  { keys: /\b(shift|schedule|hours|off duty|sick)\b/i,
    answer: "Set your status from the dashboard — online, busy, on break, or off duty. To swap a shift, post it in the Shifts tab; another approved driver can claim it instantly.",
    confidence: 0.65 },
];

const TECH_TOPICS: { keys: RegExp; answer: string; confidence: number }[] = [
  { keys: /\b(job|assignment|next job|schedule)\b/i,
    answer: "Your jobs queue is on the Jobs tab — sorted by SLA. Tap a job for the customer brief, address, parts list and any photos. Mark it 'On site' when you arrive so the customer gets a ping.",
    confidence: 0.7 },
  { keys: /\b(part|parts|spare|stock|inventory)\b/i,
    answer: "Parts lookup is on the Inventory tab — search by SKU, brand, or compatibility. If a part is out of stock you can transfer-request from the nearest branch; ETA shows on the request.",
    confidence: 0.65 },
  { keys: /\b(install|installation|procedure|spec|wiring diagram)\b/i,
    answer: "Open the job → Procedure tab for the manufacturer install guide and our internal checklist. Always run the post-install safety checks (insulation, polarity, RCBO trip test) and tick them off before closing the ticket.",
    confidence: 0.7 },
  { keys: /\b(complaint|callback|rework|unhappy customer)\b/i,
    answer: "Log a callback from the job's history pane with the root cause. The workmanship guarantee covers it — no charge to the customer. Flag the ticket as 'rework' so it routes correctly and doesn't double-count completions.",
    confidence: 0.7 },
];

const AGENT_TOPICS: { keys: RegExp; answer: string; confidence: number }[] = [
  { keys: /\b(kb|knowledge|article|template|response)\b/i,
    answer: "Search the KB from the AI Center → Knowledge Base tab. Submit a new entry whenever you find a gap; once an admin approves it, the AI starts using it automatically and tracks how often.",
    confidence: 0.7 },
  { keys: /\b(angry|upset|frustrated|de-?escalate|complaint)\b/i,
    answer: "Lead with empathy and one specific acknowledgement of what went wrong. Offer one concrete next step with a time. If you need cover, transfer to a senior on the Queue tab — note the context first so the handoff is clean.",
    confidence: 0.7 },
  { keys: /\b(history|past|previous|customer profile)\b/i,
    answer: "Open the customer card from the session header — past orders, prior tickets, satisfaction trend and active wishlist all show there. Use it before quoting policy.",
    confidence: 0.65 },
];

const ADMIN_TOPICS: { keys: RegExp; answer: string; confidence: number }[] = [
  { keys: /\b(threat|jailbreak|injection|security|attack)\b/i,
    answer: "AI Center → Security tab has the live threat log: severity, risk score and whether each was blocked at the guard. Anything 'critical' should be reviewed daily and patterns added to the guard regex.",
    confidence: 0.75 },
  { keys: /\b(analytics|report|metric|kpi|csat|deflection)\b/i,
    answer: "AI Center → Analytics gives you 7-day volume, peak hours, CSAT breakdown and top issues — exportable to CSV. For an executive view, the Overview tab summarises the same data as KPI cards.",
    confidence: 0.7 },
  { keys: /\b(training|test|accuracy|evaluation)\b/i,
    answer: "Run the adversarial suite from AI Center → Training Lab. It covers product Q&A, troubleshooting, jailbreak, PII probing, SQL/XSS and out-of-scope — pass rate is tracked over time so you see regressions instantly.",
    confidence: 0.7 },
];

function detectRoleTopic(q: string, role?: ChatUserRole): TopicHit | null {
  const set = role === 'driver' ? DRIVER_TOPICS
    : role === 'technician' ? TECH_TOPICS
    : role === 'support_agent' ? AGENT_TOPICS
    : role === 'admin' ? ADMIN_TOPICS
    : null;
  if (!set) return null;
  for (const t of set) if (t.keys.test(q)) {
    const prefix = rolePrefix(role);
    return { answer: prefix ? `${prefix}: ${t.answer}` : t.answer, confidence: t.confidence };
  }
  return null;
}

interface TopicHit { answer: string; confidence: number }

const TOPICS: { keys: RegExp; answer: string; confidence: number }[] = [
  {
    keys: /\b(price|cost|how much|quote|gh[¢s]|cedi)\b/i,
    answer: "Prices vary by brand and capacity, and every product page shows the current price in GH₵ plus any active promo. If you tell me the exact product or category (e.g. 3.5kVA inverter, 4-gang switch, LED downlight), I can point you to the right range. Bulk and contractor pricing is also available — just say the word.",
    confidence: 0.55,
  },
  {
    keys: /\b(install|installation|setup|set up|fit|fitting|mount)\b/i,
    answer: "We handle installation across Greater Accra and most regions — solar, inverters, lighting, switches, smart-home and EV chargers. Book from any product page or the dashboard, and a certified technician is dispatched to you. Workmanship is covered for 12 months.",
    confidence: 0.6,
  },
  {
    keys: /\b(deliver|delivery|ship|shipping|arrive|when.*come|how long)\b/i,
    answer: "Greater Accra: same-day or next-day. Other regions: typically 2–4 business days. You can track every order live from your dashboard. If you share your town I can give you a tighter window.",
    confidence: 0.6,
  },
  {
    keys: /\b(pay|payment|momo|mtn|vodafone|airtel|card|visa|mastercard|transfer)\b/i,
    answer: "You can pay with Mobile Money (MTN, Vodafone, AirtelTigo), Visa/Mastercard, or bank transfer. Every checkout is encrypted and you'll get an instant receipt by email.",
    confidence: 0.6,
  },
  {
    keys: /\b(warranty|guarantee|return|refund|replace|defect|faulty|broken|not working)\b/i,
    answer: "Every genuine product carries the manufacturer's warranty, and installations we perform get a 12-month workmanship guarantee. Unopened items can be returned within 14 days. If something isn't working, share the product name and order number and I'll start the claim.",
    confidence: 0.6,
  },
  {
    keys: /\b(solar|panel|battery|inverter|off[- ]?grid|hybrid|backup)\b/i,
    answer: "We do residential and commercial solar — panels, hybrid inverters, lithium batteries, and full turnkey installs. A free site consultation helps us right-size the system to your daily load. Tell me your monthly bill or the appliances you want backed up and I can suggest a starting point.",
    confidence: 0.6,
  },
  {
    keys: /\b(light|lighting|bulb|lamp|chandelier|downlight|fitting|fixture)\b/i,
    answer: "Our lighting catalog covers LED bulbs, downlights, panel lights, smart lighting, chandeliers and outdoor fittings — all from authorised brands with warranty. Let me know the room or use-case (kitchen, bedroom, office, façade) and I'll narrow it down.",
    confidence: 0.55,
  },
  {
    keys: /\b(switch|socket|outlet|gang|wall plate)\b/i,
    answer: "We stock 1-, 2-, 3- and multi-gang switches plus matching sockets in modern and classic finishes, including smart Wi-Fi versions. If you share the brand or style you're matching I can suggest exact SKUs.",
    confidence: 0.55,
  },
  {
    keys: /\b(cable|wire|wiring|conduit|breaker|mcb|rccb|distribution|board)\b/i,
    answer: "We carry copper cables in all standard sizes, conduits, MCBs/RCCBs, and distribution boards sized for homes through to small industrial sites. Tell me the current rating or load and I can point you to the right gauge.",
    confidence: 0.55,
  },
  {
    keys: /\b(smart|wifi|wi-fi|alexa|google home|automation|sensor)\b/i,
    answer: "Our smart-home range covers Wi-Fi switches, smart bulbs, motion sensors, smart locks and full automation kits — most work with Alexa and Google Home. Let me know what you'd like to automate and I'll recommend a starter setup.",
    confidence: 0.55,
  },
  {
    keys: /\b(order|track|tracking|where.*order|status)\b/i,
    answer: "You can track any order from your dashboard under Orders — it shows live status, the assigned driver, and a live map for Greater Accra. If you share your order number I can also pull the latest update.",
    confidence: 0.6,
  },
  {
    keys: /\b(account|login|sign in|password|register|sign up)\b/i,
    answer: "You can sign in or create an account from the top-right of the site. If you've forgotten your password, use the reset link on the sign-in screen. Need help getting in? I can hand you to a human agent right away.",
    confidence: 0.55,
  },
  {
    keys: /\b(contact|phone|call|whatsapp|email|reach|talk|speak)\b/i,
    answer: "Working hours (Mon–Fri 08:00–17:00 GMT): call +233 24 738 1412 (Ghana). After hours / weekends: call +1 417 424 5291 (US). You can also tap \"Call customer service\" below to dial the active line, or stay here — I'm Vanessa and I'm available 24/7.",
    confidence: 0.6,
  },
  {
    keys: /\b(finance|financing|installment|instalment|pay later|pay in|spread the cost|credit|monthly payment)\b/i,
    answer: "Yes — for bigger projects like solar and inverter systems we offer flexible installment plans so you don't have to pay it all upfront. Tell me roughly your budget and what you want powered, and I'll outline a plan that works for you.",
    confidence: 0.6,
  },
  {
    keys: /\b(consult|consultation|site visit|survey|assessment|advice|not sure|don.?t know|help me choose|recommend)\b/i,
    answer: "Happy to guide you. We offer a free, no-obligation consultation where an engineer right-sizes everything to your needs — no guesswork. Tell me a little about your space (home or business, rough size, what you want to achieve) and I'll either recommend a setup now or book you a slot.",
    confidence: 0.55,
  },
  {
    keys: /\b(ev|electric (car|vehicle)|charger|charging|generator|genset|standby power)\b/i,
    answer: "Yes — we supply and install home EV chargers and backup generators sized to your load. For an EV charger, tell me your vehicle; for a generator, tell me what you want to keep running during outages, and I'll point you to the right unit.",
    confidence: 0.55,
  },
  {
    keys: /\b(why (should|would).*(buy|choose)|why cofkans|are you (legit|trustworthy|reliable)|reviews?|reputation|trust)\b/i,
    answer: "Honestly? Four decades of trust. We only sell genuine, warranty-backed products, our own certified technicians handle installs, we deliver nationwide, and you get real human support six days a week. We don't just sell parts — we make sure your space works beautifully and safely. What can I help you set up?",
    confidence: 0.6,
  },
  {
    keys: /\b(budget|affordable|cheap(est)?|low cost|tight budget|save money|best value|value for money)\b/i,
    answer: "I'll help you get the most for your money. Tell me what you're buying and your rough budget, and I'll show you the best value option plus one step up so you can compare — no pressure either way.",
    confidence: 0.55,
  },
  {
    keys: /\b(hello|hi|hey|good (morning|afternoon|evening)|yo|how are you)\b/i,
    answer: "Hi there! I'm Vanessa, your Cofkans concierge — I can help with products, pricing, delivery, installation, orders, payments and troubleshooting. What are you working on today?",
    confidence: 0.7,
  },
];

function detectTopic(q: string): TopicHit | null {
  for (const t of TOPICS) if (t.keys.test(q)) return { answer: t.answer, confidence: t.confidence };
  return null;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function answerForProduct(question: string, ctx: AskContext): { text: string; confidence: number } | null {
  if (!ctx.product) return null;
  const p = ctx.product;
  const q = question.toLowerCase();
  const refersThis = /\b(this|it|the product|this one|that)\b/.test(q);
  const mentionsByName = p.name && q.includes(p.name.toLowerCase().split(' ')[0]);
  if (!refersThis && !mentionsByName && !/\b(stock|warranty|install|price|deliver|return|spec)\b/.test(q)) return null;

  if (/\b(stock|available|availability|in stock|when.*ship|how soon)\b/.test(q))
    return { text: `${p.name} is currently in stock — Greater Accra orders typically ship same or next day; other regions 2–4 business days. Want me to check the live count for your area?`, confidence: 0.7 };
  if (/\b(install|installation|fit|set ?up|mount)\b/.test(q))
    return { text: `Yes — installation is available for ${p.name}. A certified Cofkans technician handles the fit, tested and signed off with a 12-month workmanship guarantee. You can add installation at checkout or book from the product page.`, confidence: 0.7 };
  if (/\b(warranty|guarantee|return|refund)\b/.test(q))
    return { text: `${p.name} carries the full manufacturer warranty, and any installation we perform is covered by our 12-month workmanship guarantee. Unopened items can be returned within 14 days — share your order number and I'll start it.`, confidence: 0.7 };
  if (/\b(price|cost|how much|cheap|bulk|contractor|discount)\b/.test(q)) {
    const priceLine = p.price ? ` It's currently GH₵${p.price.toLocaleString()}.` : '';
    return { text: `${p.name} is priced for retail by default.${priceLine} Contractor and bulk pricing is available — tell me the quantity and I can pull a quote.`, confidence: 0.7 };
  }
  if (/\b(spec|specification|wattage|voltage|size|dimension|material)\b/.test(q))
    return { text: `The full specs for ${p.name} are on the product page — voltage, wattage, dimensions and materials are listed there${p.sku ? ` (SKU ${p.sku})` : ''}. Want me to highlight anything specific?`, confidence: 0.65 };
  if (/\b(alternative|similar|other|alike|compare|recommend)\b/.test(q)) {
    const where = p.subcategory || p.category;
    return { text: `Sure — I can suggest alternatives to ${p.name}${where ? ` in our ${where} range` : ''}. Tell me what matters most: price, brand, wattage, or finish?`, confidence: 0.7 };
  }
  if (/\b(deliver|delivery|ship|when)\b/.test(q))
    return { text: `${p.name} ships from our Accra warehouse — same/next day to Greater Accra, 2–4 business days elsewhere in Ghana. Live tracking shows in your dashboard once dispatched.`, confidence: 0.7 };
  return null;
}

// ===== Suggested questions (idle context chips) =====
const GLOBAL_SUGGESTIONS: SuggestedQuestion[] = [
  { id: 'g-delivery', label: 'How long does delivery take?', prompt: 'How long does delivery to my area take?' },
  { id: 'g-payment',  label: 'What payment methods?',         prompt: 'What payment methods do you accept?' },
  { id: 'g-warranty', label: 'Warranty info',                 prompt: 'What warranty do you offer?' },
  { id: 'g-human',    label: 'Talk to a human',               prompt: 'I would like to speak with a human agent.' },
];

export function getSuggestedQuestions(ctx: AskContext): SuggestedQuestion[] {
  if (ctx.product) {
    const p = ctx.product;
    return [
      { id: 'p-stock',   label: `Is ${truncate(p.name, 24)} in stock?`, prompt: `Is "${p.name}" in stock and how soon can it ship?` },
      { id: 'p-install', label: `Installation for this product`,        prompt: `Do you offer installation for ${p.name}? What does it cost?` },
      { id: 'p-warr',    label: `Warranty on this product`,             prompt: `What warranty comes with ${p.name}?` },
      { id: 'p-alt',     label: `Show similar options`,                  prompt: `Can you suggest similar products to ${p.name}${p.category ? ` in ${p.category}` : ''}?` },
      { id: 'p-price',   label: `Bulk / contractor price`,              prompt: `Do you offer bulk or contractor pricing on ${p.name}?` },
    ];
  }
  switch (ctx.route) {
    case 'checkout':
      return [
        { id: 'co-pay',  label: 'Payment options',         prompt: 'What payment methods can I use at checkout?' },
        { id: 'co-del',  label: 'Delivery times by region', prompt: 'How long does delivery take to my region?' },
        { id: 'co-fail', label: 'Payment failed — help',   prompt: 'My payment failed at checkout, what should I do?' },
        { id: 'co-prom', label: 'Apply a promo code',      prompt: 'How do I apply a promo code?' },
      ];
    case 'user-dashboard':
    case 'dashboard':
      return [
        { id: 'd-track',  label: 'Track my order',     prompt: 'How do I track my order?' },
        { id: 'd-return', label: 'Start a return',     prompt: 'How do I return an item?' },
        { id: 'd-tech',   label: 'Book a technician',  prompt: 'How do I book a technician?' },
        { id: 'd-update', label: 'Update my address',  prompt: 'How do I update my delivery address?' },
      ];
    case 'deals':
      return [
        { id: 'dl-now',  label: 'What deals are on now?', prompt: 'What deals are running this week?' },
        { id: 'dl-bulk', label: 'Contractor discounts',   prompt: 'Do contractors get extra discounts on deals?' },
        { id: 'dl-stack', label: 'Can I stack promos?',   prompt: 'Can I combine a promo code with a sale price?' },
      ];
    case 'admin':
      return [
        { id: 'a-thr',  label: 'Security threats today', prompt: 'Show me today’s AI security threat summary.' },
        { id: 'a-kb',   label: 'Pending KB submissions', prompt: 'Which KB submissions are pending review?' },
        { id: 'a-csat', label: 'CSAT this week',         prompt: 'What is our CSAT score this week?' },
      ];
    default:
      return [
        { id: 'h-cat',     label: 'What do you sell?',     prompt: 'What kinds of products do Cofkans Electricals sell?' },
        { id: 'h-solar',   label: 'Solar systems',         prompt: 'Tell me about your solar systems.' },
        { id: 'h-light',   label: 'Lighting for my home',  prompt: 'What lighting do you recommend for a 3-bedroom home?' },
        { id: 'h-install', label: 'Installation service',  prompt: 'Do you install what you sell?' },
        GLOBAL_SUGGESTIONS[3],
      ];
  }
}

// ===== Follow-up generator — drill-down chips after each AI reply =====
interface FollowUpRule { match: RegExp; chips: { label: string; prompt: string }[] }

const FOLLOW_UPS: FollowUpRule[] = [
  { match: /\b(light|lighting|bulb|lamp|chandelier|downlight|fitting|fixture|led|illumin)/i, chips: [
    { label: 'Light for living room',       prompt: 'I want lighting for my living room — what do you recommend?' },
    { label: 'Light for bedroom',           prompt: 'What lighting works best for a bedroom?' },
    { label: 'Light for kitchen',           prompt: 'Best lighting for a kitchen?' },
    { label: 'Light for bathroom',          prompt: 'I need waterproof lighting for a bathroom — options?' },
    { label: 'Light for balcony',           prompt: 'Outdoor lighting for a balcony — what do you suggest?' },
    { label: 'Light for hotel / lobby',     prompt: 'Lighting for a hotel lobby or reception — what looks premium?' },
    { label: 'Light for office',            prompt: 'Office lighting that reduces eye strain — recommendations?' },
    { label: 'Light for garden / outdoor',  prompt: 'Outdoor / garden lighting options that handle rain?' },
    { label: 'Smart / Wi-Fi lights',        prompt: 'Show me smart Wi-Fi lighting that works with Alexa or Google.' },
    { label: 'Chandeliers',                 prompt: 'I want to see your chandelier range.' },
    { label: 'Energy-saving bulbs',         prompt: 'What energy-saving bulbs do you sell?' },
  ]},
  { match: /\b(solar|panel|off[- ]?grid|hybrid)/i, chips: [
    { label: 'Solar for a 3-bed home',      prompt: 'What solar system do I need for a 3-bedroom home?' },
    { label: 'Solar for a shop / business', prompt: 'I need a solar system for a small business — what fits?' },
    { label: 'Solar for water pump',        prompt: 'Do you have solar systems for a borehole water pump?' },
    { label: 'Backup during outages',       prompt: 'I just want backup during ECG outages — what is the cheapest reliable option?' },
    { label: 'Battery options',             prompt: 'What battery options do you offer for solar — lithium vs lead-acid?' },
    { label: 'Free consultation',           prompt: 'I would like a free solar consultation.' },
  ]},
  { match: /\b(inverter|ups)/i, chips: [
    { label: '1 kVA (small home)',          prompt: 'I need a 1 kVA inverter for a small home, what do you recommend?' },
    { label: '3 kVA (medium home)',         prompt: 'I need a 3 kVA inverter for a medium home, what do you recommend?' },
    { label: '5 kVA (large home)',          prompt: 'I need a 5 kVA inverter for a large home, what do you recommend?' },
    { label: '10 kVA+ (business)',          prompt: 'I need a 10 kVA or larger inverter for a business — options?' },
    { label: 'Pure sine vs modified',       prompt: 'What is the difference between pure sine and modified sine inverters?' },
    { label: 'Inverter + battery bundle',   prompt: 'Do you sell inverter + battery bundles?' },
  ]},
  { match: /\b(switch|socket|outlet|gang|wall plate)/i, chips: [
    { label: '1-gang switch',               prompt: 'Show me 1-gang switch options.' },
    { label: '2-gang switch',               prompt: 'Show me 2-gang switch options.' },
    { label: '3-gang switch',               prompt: 'Show me 3-gang switch options.' },
    { label: 'Smart Wi-Fi switch',          prompt: 'Show me smart Wi-Fi switches.' },
    { label: 'Modern matte finish',         prompt: 'I want modern matte-finish switches and sockets.' },
    { label: 'Classic white',               prompt: 'I want classic white switches and sockets.' },
    { label: 'USB sockets',                 prompt: 'Do you have sockets with USB charging built in?' },
  ]},
  { match: /\b(cable|wire|wiring|conduit)/i, chips: [
    { label: '1.5mm cable',                 prompt: 'What is 1.5mm cable used for?' },
    { label: '2.5mm cable',                 prompt: 'What is 2.5mm cable used for?' },
    { label: '4mm cable',                   prompt: 'What is 4mm cable used for?' },
    { label: '6mm cable',                   prompt: 'What is 6mm cable used for?' },
    { label: 'Armoured cable',              prompt: 'Do you sell armoured cable and what sizes?' },
    { label: 'Conduit options',             prompt: 'What conduit options do you have?' },
  ]},
  { match: /\b(breaker|mcb|rccb|rcbo|distribution|fuse|board)/i, chips: [
    { label: 'Pick the right MCB',          prompt: 'How do I pick the right MCB amperage for my circuit?' },
    { label: 'RCCB vs RCBO',                prompt: 'What is the difference between RCCB and RCBO?' },
    { label: 'Home distribution board',     prompt: 'I need a distribution board for a 3-bedroom home — what fits?' },
    { label: 'Surge protection',            prompt: 'Do you sell surge protectors for the main board?' },
  ]},
  { match: /\b(smart|wi[- ]?fi|alexa|google home|automation|sensor)/i, chips: [
    { label: 'Smart bulbs',                 prompt: 'Show me smart bulbs that work with Alexa / Google.' },
    { label: 'Smart switches',              prompt: 'Show me smart wall switches.' },
    { label: 'Motion sensors',              prompt: 'Do you sell motion sensors for lights?' },
    { label: 'Smart lock',                  prompt: 'Do you sell smart door locks?' },
    { label: 'Full smart-home starter',     prompt: 'I want a full smart-home starter kit — what do you recommend?' },
  ]},
  { match: /\b(install|installation|fit|setup|mount)/i, chips: [
    { label: 'Installation cost',           prompt: 'How much does installation typically cost?' },
    { label: 'Book a technician',           prompt: 'I want to book a technician.' },
    { label: 'Solar installation',          prompt: 'Tell me about solar installation.' },
    { label: 'Inverter installation',       prompt: 'Tell me about inverter installation.' },
    { label: 'Lighting installation',       prompt: 'Tell me about lighting installation.' },
  ]},
  { match: /\b(deliver|delivery|ship|when.*come|how long)/i, chips: [
    { label: 'Delivery to Accra',           prompt: 'How long does delivery to Accra take?' },
    { label: 'Delivery to Kumasi',          prompt: 'How long does delivery to Kumasi take?' },
    { label: 'Delivery to Takoradi',        prompt: 'How long does delivery to Takoradi take?' },
    { label: 'Delivery to Tamale',          prompt: 'How long does delivery to Tamale take?' },
    { label: 'Same-day delivery',           prompt: 'Where do you offer same-day delivery?' },
    { label: 'Track my order',              prompt: 'How do I track my order?' },
  ]},
  { match: /\b(pay|payment|momo|mobile money|card|visa|mastercard|transfer)/i, chips: [
    { label: 'Pay with Mobile Money',       prompt: 'How do I pay with Mobile Money?' },
    { label: 'Pay with card',               prompt: 'Can I pay with Visa or Mastercard?' },
    { label: 'Bank transfer',               prompt: 'How does bank transfer payment work?' },
    { label: 'Pay on delivery',             prompt: 'Do you offer pay-on-delivery?' },
    { label: 'Payment failed help',         prompt: 'My payment failed — what should I do?' },
  ]},
  { match: /\b(price|cost|how much|cheap|expensive|bulk|wholesale|contractor)/i, chips: [
    { label: 'Budget options',              prompt: 'Show me the most affordable options.' },
    { label: 'Premium options',             prompt: 'Show me the premium options.' },
    { label: 'Contractor pricing',          prompt: 'How do I get contractor pricing?' },
    { label: 'Bulk discount',               prompt: 'Do you offer bulk discounts?' },
    { label: 'Current deals',               prompt: 'What deals are running this week?' },
  ]},
  { match: /\b(warranty|guarantee|return|refund|faulty|defect|broken)/i, chips: [
    { label: 'How to claim warranty',       prompt: 'How do I claim warranty on a product?' },
    { label: 'Start a return',              prompt: 'How do I start a return?' },
    { label: 'Refund timeline',             prompt: 'How long do refunds take?' },
    { label: 'Replacement instead',         prompt: 'Can I get a replacement instead of a refund?' },
  ]},
  { match: /\b(fan|ceiling fan|stand fan)/i, chips: [
    { label: 'Ceiling fans',                prompt: 'Show me ceiling fan options.' },
    { label: 'Stand fans',                  prompt: 'Show me stand fan options.' },
    { label: 'Fans with light',             prompt: 'Show me ceiling fans with a built-in light.' },
    { label: 'Quiet fans',                  prompt: 'I want a really quiet fan — recommendations?' },
  ]},
  { match: /\b(industrial|factory|warehouse|workshop|commercial)/i, chips: [
    { label: 'Industrial lighting',         prompt: 'What industrial lighting do you sell?' },
    { label: 'Factory power',               prompt: 'I need power gear for a factory — where do I start?' },
    { label: 'High-bay lights',             prompt: 'Show me high-bay LED lights.' },
    { label: 'Three-phase gear',            prompt: 'Do you sell three-phase distribution gear?' },
  ]},
];

const GENERIC_FOLLOWUPS: { label: string; prompt: string }[] = [
  { label: 'Talk to a human',    prompt: 'I would like to speak with a human agent.' },
  { label: 'Book installation',  prompt: 'I want to book installation.' },
  { label: 'See current deals',  prompt: 'What deals are running this week?' },
];

export function generateFollowUps(question: string, ctx: AskContext = {}): SuggestedQuestion[] {
  const out: SuggestedQuestion[] = [];
  const seen = new Set<string>();
  const push = (chips: { label: string; prompt: string }[], prefix: string) => {
    for (const c of chips) {
      if (seen.has(c.label)) continue;
      seen.add(c.label);
      out.push({ id: `${prefix}-${c.label}`, label: c.label, prompt: c.prompt });
      if (out.length >= 6) return true;
    }
    return false;
  };

  if (ctx.product) {
    const p = ctx.product;
    if (push([
      { label: `Specs of ${truncate(p.name, 20)}`,     prompt: `What are the full specs of ${p.name}?` },
      { label: `Install ${truncate(p.name, 18)}`,      prompt: `Do you install ${p.name}? How much?` },
      { label: `Warranty on ${truncate(p.name, 16)}`,  prompt: `What warranty comes with ${p.name}?` },
      { label: 'Show similar products',                 prompt: `Show me alternatives to ${p.name}${p.category ? ` in ${p.category}` : ''}.` },
    ], 'p')) return out;
  }

  for (const rule of FOLLOW_UPS) {
    if (rule.match.test(question)) {
      if (push(rule.chips, 'r')) return out;
    }
  }
  if (out.length < 4) push(GENERIC_FOLLOWUPS, 'g');
  return out;
}

export { SYSTEM_PROMPT };
