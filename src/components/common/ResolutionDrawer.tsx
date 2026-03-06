import { useState, useEffect } from 'react';
import './ResolutionDrawer.css';
import type { ActionItem, AdoFormData, BugFormData } from '../../types';

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

interface ContentFixProps {
  item: ActionItem;
  showFileInput: boolean;
  setShowFileInput: (v: boolean) => void;
  uploadSuccess: boolean;
  setUploadSuccess: (v: boolean) => void;
  showArchiveConfirm: boolean;
  setShowArchiveConfirm: (v: boolean) => void;
}

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
  // content-fix state
  const [showFileInput, setShowFileInput]         = useState(false);
  const [uploadSuccess, setUploadSuccess]         = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

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

    setShowFileInput(false);
    setUploadSuccess(false);
    setShowArchiveConfirm(false);
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
            <ContentFixFlow
              item={item}
              showFileInput={showFileInput}
              setShowFileInput={setShowFileInput}
              uploadSuccess={uploadSuccess}
              setUploadSuccess={setUploadSuccess}
              showArchiveConfirm={showArchiveConfirm}
              setShowArchiveConfirm={setShowArchiveConfirm}
            />
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
        </div>
      </aside>
    </>
  );
}

// ── Flow 1: content-fix ──────────────────────────────────────────────────────

function ContentFixFlow({
  item,
  showFileInput,
  setShowFileInput,
  uploadSuccess,
  setUploadSuccess,
  showArchiveConfirm,
  setShowArchiveConfirm,
}: ContentFixProps) {
  const { detail } = item;

  return (
    <div>
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

      <section className="rd-section">
        <h3 className="rd-section-title">Affected Articles</h3>

        {detail.articles && detail.articles.length > 0 && (
          <table className="rd-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>LOB</th>
                <th>Status</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              {detail.articles.map((a, i) => (
                <tr key={i}>
                  <td>{a.title}</td>
                  <td>{a.lob}</td>
                  <td>
                    <span className={`rd-status-badge rd-status-badge--${a.status.toLowerCase()}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="rd-action-row">
          {uploadSuccess ? (
            <div className="rd-success-msg">✓ Content uploaded and queued for indexing</div>
          ) : (
            <>
              <button className="rd-btn rd-btn--primary" onClick={() => setShowFileInput(true)}>
                📤 Upload Content
              </button>
              <button className="rd-btn rd-btn--secondary">✏️ Edit Article</button>
              <button className="rd-btn rd-btn--ghost-danger" onClick={() => setShowArchiveConfirm(true)}>
                🗄 Archive
              </button>
            </>
          )}
        </div>

        {showFileInput && !uploadSuccess && (
          <div className="rd-file-area">
            <label className="rd-file-label">
              <input type="file" className="rd-file-input" />
              <span>Click to select a file or drag and drop</span>
            </label>
            <button
              className="rd-btn rd-btn--primary"
              onClick={() => { setUploadSuccess(true); setShowFileInput(false); }}
            >
              Confirm Upload
            </button>
          </div>
        )}

        {showArchiveConfirm && (
          <div className="rd-confirm-box">
            <p>Are you sure you want to archive this article?</p>
            <div className="rd-confirm-box__actions">
              <button className="rd-btn rd-btn--ghost-danger" onClick={() => setShowArchiveConfirm(false)}>
                Confirm Archive
              </button>
              <button className="rd-btn rd-btn--secondary" onClick={() => setShowArchiveConfirm(false)}>
                Cancel
              </button>
            </div>
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
