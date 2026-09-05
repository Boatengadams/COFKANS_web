import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Users, MessageSquare, Mail, CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useSmsCampaignsStore } from '@/stores/sms-campaigns-store';
import { estimateCost, isValidSenderId } from '@/lib/sms/hubtel';
import { requireDevPasscode } from '@/lib/dev-passcode';
import { logAuditEvent } from '@/lib/security-service';
import toast from 'react-hot-toast';

type CampaignType = 'sms' | 'email';

interface EmailCampaign {
  id: string;
  type: 'email';
  title: string;
  subject: string;
  content: string;
  htmlContent: string;
  audienceLabel: string;
  recipientCount: number;
  delivered: number;
  failed: number;
  status: 'queued' | 'sending' | 'completed' | 'failed';
  sentAt: number;
  reports: Array<{
    email: string;
    status: 'delivered' | 'failed';
    reason?: string;
  }>;
}

function toMillis(v: any): number {
  if (!v) return Date.now();
  if (typeof v === 'number') return v;
  if (typeof v?.toMillis === 'function') return v.toMillis();
  if (v?.seconds) return v.seconds * 1000;
  return Date.now();
}

export function EmailSmsCampaigns() {
  const recipients = useSmsCampaignsStore(s => s.optedInRecipients);
  const smsCampaigns = useSmsCampaignsStore(s => s.campaigns);
  const sendSms = useSmsCampaignsStore(s => s.send);

  const [campaignType, setCampaignType] = useState<CampaignType>('sms');
  const [senderId, setSenderId] = useState('Cofkans');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('Hi {{name}} — new arrivals at Cofkans! Visit cofkanselectricals.com to shop.');
  const [sending, setSending] = useState(false);
  const [openLog, setOpenLog] = useState<string | null>(null);

  // Email-specific states
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [emailHtml, setEmailHtml] = useState('');
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);

  // Live-read email campaign history from Firestore.
  useEffect(() => {
    const q = query(collection(db, 'emailCampaigns'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(
      q,
      snap => {
        setEmailCampaigns(snap.docs.map(d => {
          const data = d.data() as any;
          return {
            id: d.id,
            type: 'email',
            title: data.title || '(untitled)',
            subject: data.subject || '',
            content: data.content || '',
            htmlContent: data.htmlContent || '',
            audienceLabel: data.audienceLabel || '',
            recipientCount: data.recipientCount || 0,
            delivered: data.delivered || 0,
            failed: data.failed || 0,
            status: data.status || 'queued',
            sentAt: toMillis(data.createdAt),
            reports: Array.isArray(data.reports) ? data.reports : [],
          } satisfies EmailCampaign;
        }));
      },
      err => console.warn('[EmailSmsCampaigns] email history listener failed:', err?.message),
    );
    return () => unsub();
  }, []);

  const cost = useMemo(() => estimateCost(content, recipients.length), [content, recipients.length]);
  const senderOk = isValidSenderId(senderId);

  const submitSms = async () => {
    if (!senderOk) { toast.error('Sender ID must be 1–11 alphanumeric.'); return; }
    if (!title.trim()) { toast.error('Add a campaign title.'); return; }
    if (!content.trim()) { toast.error('Write the SMS content.'); return; }
    if (recipients.length === 0) { toast.error('No opted-in recipients.'); return; }

    setSending(true);
    const personalisedAudience = recipients.map(r => ({
      ...r,
    }));
    await sendSms({
      senderId,
      title: title.trim(),
      content: content.trim(),
      audience: personalisedAudience,
      audienceLabel: `All opted-in (${recipients.length})`,
    });
    setSending(false);
    setTitle('');
    toast.success('SMS campaign queued — see delivery log below.');
  };

  const submitEmail = async () => {
    if (!title.trim()) { toast.error('Add a campaign title.'); return; }
    if (!emailSubject.trim()) { toast.error('Add an email subject.'); return; }
    if (!emailContent.trim() && !emailHtml.trim()) { toast.error('Write the email content.'); return; }
    if (recipients.length === 0) { toast.error('No opted-in recipients.'); return; }

    const ok = await requireDevPasscode(`Queue email campaign "${title.trim()}"`);
    if (!ok) { toast.error('Action cancelled — passcode required.'); return; }

    setSending(true);
    try {
      // Persist the campaign to Firestore as a queued job. A backend worker
      // (Cloud Function on the emailCampaigns collection) resolves recipient
      // emails, dispatches via the configured provider, and writes back the
      // delivered/failed counts and per-recipient reports.
      const ref = await addDoc(collection(db, 'emailCampaigns'), {
        title: title.trim(),
        subject: emailSubject.trim(),
        content: emailContent.trim(),
        htmlContent: emailHtml.trim(),
        audienceLabel: `All opted-in (${recipients.length})`,
        recipientCount: recipients.length,
        audience: recipients.map(r => ({ customerId: r.customerId, customerName: r.customerName })),
        delivered: 0,
        failed: 0,
        status: 'queued',
        reports: [],
        createdBy: auth.currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });

      await logAuditEvent('email_campaign_queued', auth.currentUser?.uid || 'unknown', 'campaign', ref.id, {
        title: title.trim(),
        recipientCount: recipients.length,
      });

      setTitle('');
      setEmailSubject('');
      setEmailContent('');
      setEmailHtml('');
      toast.success('Email campaign queued to Firestore — the email worker will dispatch it.');
    } catch (err: any) {
      console.error('[EmailSmsCampaigns] failed to queue email campaign:', err);
      toast.error(err?.message || 'Failed to queue email campaign.');
    } finally {
      setSending(false);
    }
  };

  const submit = () => {
    if (campaignType === 'sms') {
      return submitSms();
    } else {
      return submitEmail();
    }
  };

  const allCampaigns = [
    ...smsCampaigns.map(c => ({ ...c, type: 'sms' as const })),
    ...emailCampaigns,
  ].sort((a, b) => b.sentAt - a.sentAt);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> Email & SMS Campaigns
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Send marketing emails and SMS to opted-in customers. SMS via Hubtel (costs apply).
        </p>
      </div>

      {/* Campaign Type Selector */}
      <div className="flex items-center gap-3 p-1 bg-muted rounded-xl w-fit">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCampaignType('sms')}
          className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${
            campaignType === 'sms'
              ? 'bg-foreground text-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          SMS
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCampaignType('email')}
          className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${
            campaignType === 'email'
              ? 'bg-foreground text-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email
        </motion.button>
      </div>

      {/* Composer */}
      <div className="bg-card border-2 border-border rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaignType === 'sms' ? (
            <>
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-muted-foreground">Sender ID</label>
                <input
                  value={senderId}
                  onChange={e => setSenderId(e.target.value.slice(0, 11))}
                  className={`w-full px-4 py-2.5 bg-muted rounded-xl border-2 focus:outline-none font-mono font-bold ${senderOk ? 'border-border focus:border-primary' : 'border-red-500'}`}
                />
                <p className="text-[11px] text-muted-foreground mt-1">Max 11 alphanumeric characters (Hubtel rule).</p>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-muted-foreground">Campaign title (internal)</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. May Solar Promo"
                  className="w-full px-4 py-2.5 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none font-semibold"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-muted-foreground">Campaign title (internal)</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. May Solar Promo"
                  className="w-full px-4 py-2.5 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-muted-foreground">Email Subject</label>
                <input
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="e.g. New Solar Products - Limited Time Offer!"
                  className="w-full px-4 py-2.5 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none font-semibold"
                />
              </div>
            </>
          )}
        </div>

        {campaignType === 'sms' ? (
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-muted-foreground">Message</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none text-sm"
              placeholder="Hi {{name}} — your message here..."
            />
            <div className="flex items-center justify-between mt-1.5 text-[11px] text-muted-foreground">
              <span>{content.length} chars · {cost.segments} segment{cost.segments !== 1 ? 's' : ''}</span>
              <span>Est. cost: GH₵{cost.total.toFixed(2)} for {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-muted-foreground">Plain Text Content</label>
              <textarea
                value={emailContent}
                onChange={e => setEmailContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none text-sm"
                placeholder="Plain text version of your email (fallback for clients that don't support HTML)..."
              />
              <p className="text-[11px] text-muted-foreground mt-1">{emailContent.length} characters</p>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-muted-foreground">HTML Content (Optional)</label>
              <textarea
                value={emailHtml}
                onChange={e => setEmailHtml(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none text-sm font-mono text-xs"
                placeholder="<html><body><h1>Hello {{name}}</h1><p>Your HTML content here...</p></body></html>"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Use {{name}} to personalize with customer names</p>
            </div>
          </>
        )}

        <div className="flex items-center justify-between gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-semibold">{recipients.length}</span>
            <span className="text-muted-foreground">opted-in recipients</span>
          </div>
          <motion.button
            whileTap={{ scale: sending ? 1 : 0.98 }}
            onClick={submit}
            disabled={sending || (campaignType === 'sms' && !senderOk)}
            className="px-5 py-2.5 bg-foreground text-background rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {sending ? (
              <><div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />Sending…</>
            ) : (
              <><Send className="w-4 h-4" />Send {campaignType === 'sms' ? 'SMS' : 'Email'}</>
            )}
          </motion.button>
        </div>

        {campaignType === 'email' && (
          <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-700">
              <p className="font-bold mb-1">How email delivery works</p>
              <p>Pressing Send writes a <code>queued</code> campaign to the <code>emailCampaigns</code> collection in Firestore. The backend email worker (Cloud Function with your SendGrid / AWS SES credentials) picks it up, dispatches it, and writes back delivery results — which appear live in the history below.</p>
            </div>
          </div>
        )}
      </div>

      {/* Campaign history */}
      <div className="space-y-3">
        <h3 className="font-bold flex items-center gap-2">
          <Clock className="w-4 h-4" /> Campaign history
        </h3>
        {allCampaigns.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
            <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No campaigns sent yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allCampaigns.map(c => {
              const isOpen = openLog === c.id;
              const deliveryRate = c.recipientCount ? Math.round((c.delivered / c.recipientCount) * 100) : 0;
              const isSms = c.type === 'sms';
              return (
                <div key={c.id} className="bg-card border-2 border-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenLog(isOpen ? null : c.id)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-muted/30 text-left"
                  >
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    {isSms ? <MessageSquare className="w-4 h-4 text-blue-500" /> : <Mail className="w-4 h-4 text-purple-500" />}
                    <StatusPill status={c.status} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {new Date(c.sentAt).toLocaleString()} · {c.audienceLabel}
                        {!isSms && ' · ' + (c as EmailCampaign).subject}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold">{deliveryRate}% delivered</p>
                      <p className="text-[11px] text-muted-foreground">
                        {isSms ? `GH₵${c.cost?.toFixed(2)}` : 'Email'}
                      </p>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <Metric icon={<CheckCircle className="w-4 h-4 text-emerald-500" />} value={c.delivered} label="Delivered" />
                            <Metric icon={<XCircle className="w-4 h-4 text-red-500" />} value={c.failed} label="Failed" />
                            <Metric icon={<Users className="w-4 h-4 text-primary" />} value={c.recipientCount} label="Total" />
                          </div>
                          {isSms ? (
                            <div className="bg-muted/40 rounded-xl p-3 text-xs whitespace-pre-wrap">{c.content}</div>
                          ) : (
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs font-bold text-muted-foreground mb-1">Subject</p>
                                <div className="bg-muted/40 rounded-xl p-3 text-sm font-semibold">{(c as EmailCampaign).subject}</div>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-muted-foreground mb-1">Content</p>
                                <div className="bg-muted/40 rounded-xl p-3 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                                  {(c as EmailCampaign).content || (c as EmailCampaign).htmlContent}
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="max-h-64 overflow-y-auto border border-border rounded-xl divide-y divide-border">
                            {isSms ? (
                              c.reports.map((r: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 text-xs">
                                  {r.status === 'delivered' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                                  <span className="font-mono">{r.phone}</span>
                                  <span className="flex-1 text-muted-foreground">{r.reason || (r.status === 'delivered' ? 'OK' : '—')}</span>
                                  <span className="text-muted-foreground">GH₵{r.cost.toFixed(4)}</span>
                                </div>
                              ))
                            ) : (
                              (c as EmailCampaign).reports.map((r, i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 text-xs">
                                  {r.status === 'delivered' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                                  <span className="font-mono">{r.email}</span>
                                  <span className="flex-1 text-muted-foreground">{r.reason || (r.status === 'delivered' ? 'OK' : '—')}</span>
                                </div>
                              ))
                            )}
                            {c.reports.length === 0 && <div className="p-3 text-xs text-muted-foreground">No delivery reports.</div>}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipients list */}
      <div>
        <h3 className="font-bold flex items-center gap-2 mb-3"><Users className="w-4 h-4" /> Opted-in recipients</h3>
        <div className="bg-card border-2 border-border rounded-2xl divide-y divide-border max-h-72 overflow-y-auto">
          {recipients.map(r => (
            <div key={r.customerId} className="flex items-center gap-3 p-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs">
                {r.customerName.split(' ').map(p => p[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{r.customerName}</p>
                <p className="text-xs text-muted-foreground font-mono">{r.phone}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold uppercase tracking-wide">Opted in</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 flex items-start gap-1.5">
          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          Only customers who explicitly opted in to marketing communications appear here. Manage opt-ins via the Privacy section on user accounts.
        </p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: 'queued' | 'sending' | 'completed' | 'failed' }) {
  const cls =
    status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
    status === 'sending'   ? 'bg-amber-500/10 text-amber-600 animate-pulse' :
    status === 'queued'    ? 'bg-blue-500/10 text-blue-600' :
                             'bg-red-500/10 text-red-600';
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cls}`}>{status}</span>;
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-muted/40 rounded-xl p-3 flex items-center gap-2">
      {icon}
      <div>
        <p className="font-bold leading-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}
