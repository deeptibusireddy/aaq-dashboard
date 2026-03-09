import { useState, useEffect } from 'react';
import './ResolutionDrawer.css';
import type { ActionItem, AdoFormData, BugFormData, MissingQuery } from '../../types';

// ── Constants ────────────────────────────────────────────────────────────────

const PERSONA_COLORS: Record<string, string> = {
  'Content Manager': '#ca5010',
  'Support Engineer': '#0078d4',
  'LOB Leader':       '#8764b8',
  'Program Leader':   '#d83b01',
};

const PERSONA_INITIALS: Record<string, string> = {
  'Content Manager': 'CM',
  'Support Engineer': 'SE',
  'LOB Leader':       'LL',
  'Program Leader':   'PL',
};

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ── Types for sub-component props ────────────────────────────────────────────

interface AdoFlowProps {
  item: ActionItem;
  adoForm: AdoFormData;
  setAdoForm: (f: AdoFormData) => void;
  adoSuccess: boolean;
  adoId: string;
  onSubmit: () => void;
}

type DsForm = { title: string; context: string; requestedBy: string; priority: string };

interface BugFlowProps {
  item: ActionItem;
  bugTab: 'file-bug' | 'assign-ds';
  setBugTab: (t: 'file-bug' | 'assign-ds') => void;
  bugForm: BugFormData;
  setBugForm: (f: BugFormData) => void;
  bugSuccess: boolean;
  bugId: string;
  onBugSubmit: () => void;
  dsForm: DsForm;
  setDsForm: (f: DsForm) => void;
  dsSuccess: boolean;
  dsId: string;
  onDsSubmit: () => void;
}

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  item: ActionItem | null;
  onClose: () => void;
}

export function ResolutionDrawer({ item, onClose }: Props) {
  // ado-assignment state
  const [adoForm, setAdoForm] = useState<AdoFormData>({
    title: '', type: 'Bug', assignedTo: '', areaPath: '', priority: '2', tags: '',
  });
  const [adoSuccess, setAdoSuccess] = useState(false);
  const [adoId, setAdoId]           = useState('');

  // bug-filing state
  const [bugTab, setBugTab]   = useState<'file-bug' | 'assign-ds'>('file-bug');
  const [bugForm, setBugForm] = useState<BugFormData>({
    title: '', severity: 'High', component: '', team: 'PG', description: '',
  });
  const [bugSuccess, setBugSuccess] = useState(false);
  const [bugId, setBugId]           = useState('');
  const [dsForm, setDsForm]         = useState<DsForm>({
    title: '', context: '', requestedBy: 'Program Leader', priority: '2',
  });
  const [dsSuccess, setDsSuccess] = useState(false);
  const [dsId, setDsId]           = useState('');

  // Reset all state when the active item changes
  useEffect(() => {
    if (!item) return;
    setAdoSuccess(false);
    setAdoId('');
    setBugTab('file-bug');
    setBugSuccess(false);
    setBugId('');
    setDsSuccess(false);
    setDsId('');

    const d = item.detail;

    setAdoForm({
      title:      d.adoDefaults?.title      ?? '',
      type:       d.adoDefaults?.type       ?? 'Bug',
      assignedTo: d.adoDefaults?.assignedTo ?? '',
      areaPath:   d.adoDefaults?.areaPath   ?? '',
      priority:   d.adoDefaults?.priority   ?? '2',
      tags:       d.adoDefaults?.tags       ?? '',
    });

    setBugForm({
      title:       d.bugDefaults?.title       ?? '',
      severity:    d.bugDefaults?.severity    ?? 'High',
      component:   d.bugDefaults?.component   ?? '',
      team:        d.bugDefaults?.team        ?? 'PG',
      description: d.bugDefaults?.description ?? '',
    });

    setDsForm({
      title:       d.bugDefaults?.title ?? '',
      context:     d.investigationContext ?? '',
      requestedBy: 'Program Leader',
      priority:    '2',
    });
  }, [item]);

  if (!item) return null;

  const personaColor    = PERSONA_COLORS[item.persona]   ?? '#888';
  const personaInitials = PERSONA_INITIALS[item.persona] ?? '??';
  const priorityIcon    = item.priority === 'High' ? '🔴' : item.priority === 'Medium' ? '🟡' : '🟢';

  return (
    <>
      <div className="rd-overlay" onClick={onClose} />

      <aside className="rd-drawer">
        {/* Header */}
        <div className="rd-header">
          <div className="rd-header__badges">
            <span
              className="rd-persona-badge"
              style={{
                background: personaColor + '18',
                color:      personaColor,
                border:     `1px solid ${personaColor}40`,
              }}
            >
              {personaInitials} {item.persona}
            </span>
            <span className={`rd-priority-badge rd-priority-badge--${item.priority.toLowerCase()}`}>
              {priorityIcon} {item.priority}
            </span>
          </div>
          <button className="rd-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Summary */}
        <p className="rd-summary">{item.detail.summary}</p>

        {/* Flow body */}
        <div className="rd-body">
          {item.resolutionType === 'content-fix' && (
            <ContentFixFlow key={item.id} item={item} />
          )}

          {item.resolutionType === 'ado-assignment' && (
            <AdoAssignmentFlow
              item={item}
              adoForm={adoForm}
              setAdoForm={setAdoForm}
              adoSuccess={adoSuccess}
              adoId={adoId}
              onSubmit={() => {
                setAdoId(`AB#${rand(14000, 15999)}`);
                setAdoSuccess(true);
              }}
            />
          )}

          {item.resolutionType === 'bug-filing' && (
            <BugFilingFlow
              item={item}
              bugTab={bugTab}
              setBugTab={setBugTab}
              bugForm={bugForm}
              setBugForm={setBugForm}
              bugSuccess={bugSuccess}
              bugId={bugId}
              onBugSubmit={() => {
                setBugId(`AAQ-${rand(1000, 9999)}`);
                setBugSuccess(true);
              }}
              dsForm={dsForm}
              setDsForm={setDsForm}
              dsSuccess={dsSuccess}
              dsId={dsId}
              onDsSubmit={() => {
                setDsId(`IR-${rand(100, 999)}`);
                setDsSuccess(true);
              }}
            />
          )}

          {item.resolutionType === 'content-request' && (
            <ContentRequestFlow key={item.id} item={item} />
          )}
        </div>
      </aside>
    </>
  );
}

// ── Flow 1: content-fix ──────────────────────────────────────────────────────

type ArticleAction = { type: string; date: string; by: string };

function ContentFixFlow({ item }: { item: ActionItem }) {
  const { detail } = item;
  const articles = detail.articles ?? [];

  const [selected, setSelected]           = useState<Set<number>>(new Set());
  const [actions, setActions]             = useState<Record<number, ArticleAction>>({});
  const [blockedPopupIdx, setBlockedPopupIdx] = useState<number | null>(null);
  const [actionDetailIdx, setActionDetailIdx] = useState<number | null>(null);
  const [showAdoForm, setShowAdoForm]     = useState(false);
  const [adoTitle, setAdoTitle]           = useState('');
  const [adoAssignee, setAdoAssignee]     = useState('Azure LOB Lead');
  const [adoSuccess, setAdoSuccess]       = useState(false);
  const [adoId, setAdoId]                 = useState('');

  const allSelected = selected.size === articles.length && articles.length > 0;
  const noneSelected = selected.size === 0;

  const toggleAll = () => allSelected ? setSelected(new Set()) : setSelected(new Set(articles.map((_, i) => i)));
  const toggleOne = (i: number) => {
    const next = new Set(selected);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelected(next);
  };

  const takeAction = (type: string) => {
    const now = new Date();
    const stamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      + ' · ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const entry: ArticleAction = { type, date: stamp, by: 'You' };
    setActions(prev => {
      const next = { ...prev };
      selected.forEach(i => { next[i] = entry; });
      return next;
    });
    setSelected(new Set());
  };

  return (
    <div>
      {/* Failing Prompts */}
      <section className="rd-section">
        <h3 className="rd-section-title">Failing Prompts</h3>
        {detail.failingPrompts?.map((p, i) => (
          <div key={i} className="rd-prompt-card">
            <div className="rd-callout rd-callout--blue">{p.question}</div>
            <div className="rd-info-box rd-info-box--gray">
              <span className="rd-info-box__label">Bot answered:</span>
              <p>{p.botAnswer}</p>
            </div>
            <div className="rd-info-box rd-info-box--amber">
              <span className="rd-info-box__label">⚠ Missing content:</span>
              <p>{p.missingContent}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Affected Articles */}
      <section className="rd-section">
        <h3 className="rd-section-title">
          Affected Articles
          {selected.size > 0 && <span className="rd-selected-count">{selected.size} selected</span>}
        </h3>

        <table className="rd-table rd-table--checkable">
          <thead>
            <tr>
              <th><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
              <th>Article</th>
              <th>LOB</th>
              <th>Status</th>
              <th>Age</th>
              <th>Action Taken</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a, i) => (
              <tr key={i} className={selected.has(i) ? 'rd-row--selected' : ''}>
                <td><input type="checkbox" checked={selected.has(i)} onChange={() => toggleOne(i)} /></td>
                <td>
                  <a
                    href={a.articleUrl ?? 'https://aka.ms/KABugReport'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rd-article-link"
                  >
                    {a.title} ↗
                  </a>
                </td>
                <td>{a.lob}</td>
                <td>
                  {a.status === 'Blocked' && a.blockedReason ? (
                    <button
                      className="rd-status-badge rd-status-badge--blocked rd-status-badge--clickable"
                      onClick={() => setBlockedPopupIdx(blockedPopupIdx === i ? null : i)}
                    >
                      🔒 Blocked ▾
                    </button>
                  ) : (
                    <span className={`rd-status-badge rd-status-badge--${a.status.toLowerCase()}`}>{a.status}</span>
                  )}
                  {blockedPopupIdx === i && a.blockedReason && (
                    <div className="rd-blocked-popup">
                      <div className="rd-blocked-popup__header">
                        <strong>Why blocked?</strong>
                        <button onClick={() => setBlockedPopupIdx(null)}>✕</button>
                      </div>
                      <p>{a.blockedReason}</p>
                    </div>
                  )}
                </td>
                <td>{a.age}</td>
                <td>
                  {actions[i] ? (
                    <button
                      className="rd-action-taken-badge"
                      onClick={() => setActionDetailIdx(actionDetailIdx === i ? null : i)}
                    >
                      ✓ {actions[i].type} ▾
                    </button>
                  ) : (
                    <span className="rd-muted-sm">—</span>
                  )}
                  {actionDetailIdx === i && actions[i] && (
                    <div className="rd-blocked-popup">
                      <div className="rd-blocked-popup__header">
                        <strong>Action detail</strong>
                        <button onClick={() => setActionDetailIdx(null)}>✕</button>
                      </div>
                      <p><strong>Action:</strong> {actions[i].type}</p>
                      <p><strong>By:</strong> {actions[i].by}</p>
                      <p><strong>When:</strong> {actions[i].date}</p>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bulk action buttons */}
        <div className="rd-action-row rd-action-row--wrap" style={{ marginTop: 14 }}>
          <button className="rd-btn rd-btn--primary"   disabled={noneSelected} onClick={() => takeAction('Unblocked')}>🔓 Unblock</button>
          <a href="https://aka.ms/KABugReport" target="_blank" rel="noopener noreferrer"
            className={`rd-btn rd-btn--secondary${noneSelected ? ' rd-btn--disabled' : ''}`}
            onClick={e => { if (noneSelected) e.preventDefault(); else takeAction('Content Removed'); }}
          >🗑 Remove Content</a>
          <a href="https://aka.ms/KABugReport" target="_blank" rel="noopener noreferrer"
            className={`rd-btn rd-btn--secondary${noneSelected ? ' rd-btn--disabled' : ''}`}
            onClick={e => { if (noneSelected) e.preventDefault(); else takeAction('Content Added'); }}
          >➕ Add Content</a>
          <button className="rd-btn rd-btn--secondary"  disabled={noneSelected} onClick={() => { setShowAdoForm(true); takeAction('Content Update Requested'); }}>✏️ Request Content Update</button>
          <button className="rd-btn rd-btn--ghost-danger" disabled={noneSelected} onClick={() => takeAction('Archived')}>🗄 Archive</button>
        </div>

        {/* ADO content update form */}
        {showAdoForm && !adoSuccess && (
          <div className="rd-inline-form" style={{ marginTop: 14 }}>
            <h4 className="rd-inline-form__title">📋 Content Update Request (ADO)</h4>
            <label className="rd-form-label">Title
              <input className="rd-form-input" value={adoTitle} onChange={e => setAdoTitle(e.target.value)} />
            </label>
            <label className="rd-form-label">Assign to
              <input className="rd-form-input" value={adoAssignee} onChange={e => setAdoAssignee(e.target.value)} />
            </label>
            <div className="rd-action-row">
              <button className="rd-btn rd-btn--primary" onClick={() => { setAdoId(`AB#${rand(14000,15999)}`); setAdoSuccess(true); }}>
                🔗 Create ADO Item
              </button>
              <button className="rd-btn rd-btn--secondary" onClick={() => setShowAdoForm(false)}>Cancel</button>
            </div>
          </div>
        )}
        {adoSuccess && (
          <div className="rd-ado-card" style={{ marginTop: 14 }}>
            <div className="rd-ado-card__id">{adoId}</div>
            <div className="rd-ado-card__title">{adoTitle || 'Content Update Request'}</div>
            <div className="rd-ado-card__meta">
              <span>Assigned to: <strong>{adoAssignee}</strong></span>
              <span>Type: <strong>Task</strong></span>
            </div>
            <a href="#" className="rd-ado-link">View in ADO →</a>
          </div>
        )}
      </section>
    </div>
  );
}

// ── Flow 2: ado-assignment ───────────────────────────────────────────────────

function AdoAssignmentFlow({ item, adoForm, setAdoForm, adoSuccess, adoId, onSubmit }: AdoFlowProps) {
  const { detail } = item;

  return (
    <div>
      <section className="rd-section">
        <h3 className="rd-section-title">Affected Queries / Context</h3>
        {detail.affectedQueries && detail.affectedQueries.length > 0 ? (
          <ul className="rd-bullet-list">
            {detail.affectedQueries.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        ) : (
          <p className="rd-muted">No affected queries listed.</p>
        )}
      </section>

      <section className="rd-section">
        <h3 className="rd-section-title">Create ADO Work Item</h3>

        {adoSuccess ? (
          <div className="rd-ado-card">
            <div className="rd-ado-card__id">{adoId}</div>
            <div className="rd-ado-card__title">{adoForm.title}</div>
            <div className="rd-ado-card__meta">
              <span>Assigned to: <strong>{adoForm.assignedTo || '(unassigned)'}</strong></span>
              <span>Type: <strong>{adoForm.type}</strong></span>
            </div>
            <a href="#" className="rd-ado-link">View in ADO →</a>
          </div>
        ) : (
          <form className="rd-form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <div className="rd-form-field">
              <label>Title</label>
              <input
                type="text"
                value={adoForm.title}
                onChange={(e) => setAdoForm({ ...adoForm, title: e.target.value })}
              />
            </div>
            <div className="rd-form-row">
              <div className="rd-form-field">
                <label>Type</label>
                <select
                  value={adoForm.type}
                  onChange={(e) => setAdoForm({ ...adoForm, type: e.target.value as AdoFormData['type'] })}
                >
                  <option value="Bug">Bug</option>
                  <option value="Task">Task</option>
                  <option value="User Story">User Story</option>
                </select>
              </div>
              <div className="rd-form-field">
                <label>Priority</label>
                <select
                  value={adoForm.priority}
                  onChange={(e) => setAdoForm({ ...adoForm, priority: e.target.value as AdoFormData['priority'] })}
                >
                  <option value="1">1 – Critical</option>
                  <option value="2">2 – High</option>
                  <option value="3">3 – Medium</option>
                  <option value="4">4 – Low</option>
                </select>
              </div>
            </div>
            <div className="rd-form-field">
              <label>Assigned To</label>
              <input
                type="text"
                value={adoForm.assignedTo}
                onChange={(e) => setAdoForm({ ...adoForm, assignedTo: e.target.value })}
              />
            </div>
            <div className="rd-form-field">
              <label>Area Path</label>
              <input
                type="text"
                value={adoForm.areaPath}
                onChange={(e) => setAdoForm({ ...adoForm, areaPath: e.target.value })}
              />
            </div>
            <div className="rd-form-field">
              <label>Tags</label>
              <input
                type="text"
                value={adoForm.tags}
                onChange={(e) => setAdoForm({ ...adoForm, tags: e.target.value })}
                placeholder="e.g. knowledge-bot, triage"
              />
            </div>
            <button type="submit" className="rd-btn rd-btn--primary rd-btn--full">
              🔗 Create ADO Item
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

// ── Flow 3: bug-filing ───────────────────────────────────────────────────────

function BugFilingFlow({
  item,
  bugTab,
  setBugTab,
  bugForm,
  setBugForm,
  bugSuccess,
  bugId,
  onBugSubmit,
  dsForm,
  setDsForm,
  dsSuccess,
  dsId,
  onDsSubmit,
}: BugFlowProps) {
  const { detail } = item;

  return (
    <div>
      <div className="rd-tabs">
        <button
          className={`rd-tab ${bugTab === 'file-bug' ? 'rd-tab--active' : ''}`}
          onClick={() => setBugTab('file-bug')}
        >
          🐛 File Bug
        </button>
        <button
          className={`rd-tab ${bugTab === 'assign-ds' ? 'rd-tab--active' : ''}`}
          onClick={() => setBugTab('assign-ds')}
        >
          🔬 Assign to DS
        </button>
      </div>

      {/* Tab: File Bug */}
      {bugTab === 'file-bug' && (
        <div className="rd-tab-panel">
          {detail.incidentId && (
            <div className="rd-incident-banner">
              🚨 Related incident: <strong>{detail.incidentId}</strong>
            </div>
          )}
          {detail.investigationContext && (
            <pre className="rd-code-block">{detail.investigationContext}</pre>
          )}
          {bugSuccess ? (
            <div className="rd-success-msg">
              ✓ Bug #{bugId} filed and assigned to {bugForm.team} team. Average response: 2 business days.
            </div>
          ) : (
            <form className="rd-form" onSubmit={(e) => { e.preventDefault(); onBugSubmit(); }}>
              <div className="rd-form-field">
                <label>Title</label>
                <input
                  type="text"
                  value={bugForm.title}
                  onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
                />
              </div>
              <div className="rd-form-row">
                <div className="rd-form-field">
                  <label>Severity</label>
                  <select
                    value={bugForm.severity}
                    onChange={(e) => setBugForm({ ...bugForm, severity: e.target.value as BugFormData['severity'] })}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="rd-form-field">
                  <label>Team</label>
                  <select
                    value={bugForm.team}
                    onChange={(e) => setBugForm({ ...bugForm, team: e.target.value as BugFormData['team'] })}
                  >
                    <option value="PG">PG</option>
                    <option value="SIA Eng">SIA Eng</option>
                    <option value="DS">DS</option>
                  </select>
                </div>
              </div>
              <div className="rd-form-field">
                <label>Component</label>
                <input
                  type="text"
                  value={bugForm.component}
                  onChange={(e) => setBugForm({ ...bugForm, component: e.target.value })}
                />
              </div>
              <div className="rd-form-field">
                <label>Description</label>
                <textarea
                  value={bugForm.description}
                  rows={4}
                  onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
                />
              </div>
              <button type="submit" className="rd-btn rd-btn--primary rd-btn--full">
                🐛 File Bug
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab: Assign to DS */}
      {bugTab === 'assign-ds' && (
        <div className="rd-tab-panel">
          {dsSuccess ? (
            <div className="rd-success-msg">
              ✓ Investigation request {dsId} created and assigned to DS team.
            </div>
          ) : (
            <form className="rd-form" onSubmit={(e) => { e.preventDefault(); onDsSubmit(); }}>
              <div className="rd-form-field">
                <label>Title</label>
                <input
                  type="text"
                  value={dsForm.title}
                  onChange={(e) => setDsForm({ ...dsForm, title: e.target.value })}
                />
              </div>
              <div className="rd-form-field">
                <label>Context</label>
                <textarea
                  value={dsForm.context}
                  rows={5}
                  onChange={(e) => setDsForm({ ...dsForm, context: e.target.value })}
                />
              </div>
              <div className="rd-form-row">
                <div className="rd-form-field">
                  <label>Requested By</label>
                  <input
                    type="text"
                    value={dsForm.requestedBy}
                    onChange={(e) => setDsForm({ ...dsForm, requestedBy: e.target.value })}
                  />
                </div>
                <div className="rd-form-field">
                  <label>Priority</label>
                  <select
                    value={dsForm.priority}
                    onChange={(e) => setDsForm({ ...dsForm, priority: e.target.value })}
                  >
                    <option value="1">1 – Critical</option>
                    <option value="2">2 – High</option>
                    <option value="3">3 – Medium</option>
                    <option value="4">4 – Low</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="rd-btn rd-btn--primary rd-btn--full">
                🔬 Submit Investigation Request
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ── Flow 4: content-request ──────────────────────────────────────────────────

function ContentRequestFlow({ item }: { item: ActionItem }) {
  const { detail } = item;
  const queries: MissingQuery[] = detail.missingQueries ?? [];

  const [tab, setTab]                   = useState<'add-content' | 'assign-ado'>('add-content');
  const [selectedQuery, setSelectedQuery] = useState<number | null>(null);

  // add-content form
  const [contentTitle, setContentTitle]   = useState('');
  const [contentLob, setContentLob]       = useState(detail.contentRequestDefaults?.areaPath?.split('\\')[2] ?? '');
  const [contentTopic, setContentTopic]   = useState('');
  const [contentDesc, setContentDesc]     = useState('');
  const [contentUrl, setContentUrl]       = useState('');
  const [addSuccess, setAddSuccess]       = useState(false);
  const [addAdoId, setAddAdoId]           = useState('');

  // assign-ado form
  const [adoTitle, setAdoTitle]           = useState('');
  const [adoAssignee, setAdoAssignee]     = useState(detail.contentRequestDefaults?.assignedTo ?? 'LOB Content Lead');
  const [adoAreaPath, setAdoAreaPath]     = useState(detail.contentRequestDefaults?.areaPath ?? '');
  const [adoPriority, setAdoPriority]     = useState<'1'|'2'|'3'|'4'>('2');
  const [adoTags, setAdoTags]             = useState(detail.contentRequestDefaults?.tags ?? '');
  const [adoSuccess, setAdoSuccess]       = useState(false);
  const [adoId, setAdoId]                 = useState('');

  // pre-fill forms when user clicks a query
  const selectQuery = (i: number) => {
    const q = queries[i];
    setSelectedQuery(i === selectedQuery ? null : i);
    if (i !== selectedQuery) {
      setContentTitle(`Add content: ${q.topic} (${q.lob})`);
      setContentLob(q.lob);
      setContentTopic(q.topic);
      setAdoTitle(`[Content Gap] ${q.lob} – ${q.topic}: no knowledge for "${q.question.slice(0, 60)}..."`);
    }
  };

  const lobColor: Record<string, string> = {
    Azure: '#0078d4', M365: '#217346', Intune: '#ca5010',
    Xbox: '#107c10', Windows: '#8764b8', Dynamics: '#d83b01',
  };

  return (
    <div>
      {/* Missing queries table */}
      <section className="rd-section">
        <h3 className="rd-section-title">Unanswered Queries <span className="rd-selected-count">{queries.length} gaps</span></h3>
        <p className="rd-muted-sm" style={{ marginBottom: 10 }}>Click a row to pre-fill the resolution form below.</p>
        <table className="rd-table rd-table--checkable">
          <thead>
            <tr>
              <th>Question</th>
              <th>LOB</th>
              <th>Topic</th>
              <th style={{ textAlign: 'right' }}># Asked</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((q, i) => (
              <tr
                key={i}
                className={`rd-table-row--clickable${selectedQuery === i ? ' rd-row--selected' : ''}`}
                onClick={() => selectQuery(i)}
                title="Click to pre-fill the form below"
              >
                <td>{q.question}</td>
                <td>
                  <span
                    className="rd-lob-chip"
                    style={{ background: (lobColor[q.lob] ?? '#888') + '18', color: lobColor[q.lob] ?? '#888' }}
                  >
                    {q.lob}
                  </span>
                </td>
                <td>{q.topic}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{q.frequency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Action tabs */}
      <section className="rd-section">
        <div className="rd-tabs">
          <button
            className={`rd-tab ${tab === 'add-content' ? 'rd-tab--active' : ''}`}
            onClick={() => setTab('add-content')}
          >
            ➕ Add Content
          </button>
          <button
            className={`rd-tab ${tab === 'assign-ado' ? 'rd-tab--active' : ''}`}
            onClick={() => setTab('assign-ado')}
          >
            📋 Assign to Investigate
          </button>
        </div>

        {/* Tab: Add Content */}
        {tab === 'add-content' && (
          <div className="rd-tab-panel">
            {addSuccess ? (
              <div className="rd-success-msg">
                ✓ Content addition request {addAdoId} created. LOB lead notified to review and publish.
              </div>
            ) : (
              <>
                <p className="rd-muted-sm" style={{ marginBottom: 12 }}>
                  Describe the missing content and optionally provide a source URL or document. This creates an ADO User Story for the content team to author and publish.
                </p>
                <form className="rd-form" onSubmit={(e) => { e.preventDefault(); setAddAdoId(`AB#${rand(14000, 15999)}`); setAddSuccess(true); }}>
                  <div className="rd-form-field">
                    <label>Content Title</label>
                    <input type="text" value={contentTitle} onChange={e => setContentTitle(e.target.value)} placeholder="e.g. Azure Private Endpoint setup guide" />
                  </div>
                  <div className="rd-form-row">
                    <div className="rd-form-field">
                      <label>LOB</label>
                      <input type="text" value={contentLob} onChange={e => setContentLob(e.target.value)} placeholder="e.g. Azure" />
                    </div>
                    <div className="rd-form-field">
                      <label>Topic</label>
                      <input type="text" value={contentTopic} onChange={e => setContentTopic(e.target.value)} placeholder="e.g. Networking" />
                    </div>
                  </div>
                  <div className="rd-form-field">
                    <label>Description of needed content</label>
                    <textarea rows={3} value={contentDesc} onChange={e => setContentDesc(e.target.value)} placeholder="What should this content cover? Include any known source materials or SMEs." />
                  </div>
                  <div className="rd-form-field">
                    <label>Source URL <span className="rd-muted-sm">(optional)</span></label>
                    <input type="url" value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder="https://learn.microsoft.com/..." />
                  </div>
                  <div className="rd-form-field">
                    <label>Upload document <span className="rd-muted-sm">(optional)</span></label>
                    <div className="rd-upload-zone">
                      <span>📄 Drag a file here or <strong>browse</strong></span>
                      <span className="rd-muted-sm">.docx, .pdf, .md supported</span>
                    </div>
                  </div>
                  <button type="submit" className="rd-btn rd-btn--primary rd-btn--full">
                    ➕ Submit Content Request
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* Tab: Assign to Investigate */}
        {tab === 'assign-ado' && (
          <div className="rd-tab-panel">
            {adoSuccess ? (
              <div className="rd-ado-card">
                <div className="rd-ado-card__id">{adoId}</div>
                <div className="rd-ado-card__title">{adoTitle || 'Content Gap Investigation'}</div>
                <div className="rd-ado-card__meta">
                  <span>Assigned to: <strong>{adoAssignee}</strong></span>
                  <span>Type: <strong>User Story</strong></span>
                  <span>Priority: <strong>{adoPriority}</strong></span>
                </div>
                <a href="#" className="rd-ado-link">View in ADO →</a>
              </div>
            ) : (
              <>
                <p className="rd-muted-sm" style={{ marginBottom: 12 }}>
                  Create an ADO User Story assigning the LOB content lead to research, author, and publish the missing content.
                </p>
                <form className="rd-form" onSubmit={(e) => { e.preventDefault(); setAdoId(`AB#${rand(14000, 15999)}`); setAdoSuccess(true); }}>
                  <div className="rd-form-field">
                    <label>Title</label>
                    <input type="text" value={adoTitle} onChange={e => setAdoTitle(e.target.value)} placeholder="e.g. [Content Gap] Azure – Networking: Private Endpoint" />
                  </div>
                  <div className="rd-form-field">
                    <label>Assign To</label>
                    <input type="text" value={adoAssignee} onChange={e => setAdoAssignee(e.target.value)} />
                  </div>
                  <div className="rd-form-row">
                    <div className="rd-form-field">
                      <label>Area Path</label>
                      <input type="text" value={adoAreaPath} onChange={e => setAdoAreaPath(e.target.value)} />
                    </div>
                    <div className="rd-form-field">
                      <label>Priority</label>
                      <select value={adoPriority} onChange={e => setAdoPriority(e.target.value as '1'|'2'|'3'|'4')}>
                        <option value="1">1 – Critical</option>
                        <option value="2">2 – High</option>
                        <option value="3">3 – Medium</option>
                        <option value="4">4 – Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="rd-form-field">
                    <label>Tags</label>
                    <input type="text" value={adoTags} onChange={e => setAdoTags(e.target.value)} />
                  </div>
                  <button type="submit" className="rd-btn rd-btn--primary rd-btn--full">
                    📋 Create ADO Item
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
