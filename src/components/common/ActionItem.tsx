import type { ActionItem as ActionItemType } from '../../types';
import './ActionItem.css';

const PERSONA_COLORS: Record<string, string> = {
  'Content Manager': '#ca5010',
  'Support Engineer': '#0078d4',
  'LOB Leader': '#8764b8',
  'Program Leader': '#d83b01',
};

const PERSONA_INITIALS: Record<string, string> = {
  'Content Manager': 'CM',
  'Support Engineer': 'SE',
  'LOB Leader': 'LL',
  'Program Leader': 'PL',
};

const RESOLUTION_LABEL: Record<string, string> = {
  'content-fix': '📄 Fix Content',
  'ado-assignment': '🔗 Create ADO',
  'bug-filing': '🐛 File Bug / DS',
};

interface Props {
  item: ActionItemType;
  onClick: (item: ActionItemType) => void;
}

export function ActionItem({ item, onClick }: Props) {
  const { priority, persona, description, resolutionType } = item;

  const priorityDot = priority === 'High' ? '🔴' : priority === 'Medium' ? '🟡' : '🟢';
  const personaColor = PERSONA_COLORS[persona] ?? '#888';
  const personaInitials = PERSONA_INITIALS[persona] ?? '??';

  return (
    <div
      className={`action-item action-item--${priority.toLowerCase()} action-item--clickable`}
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(item)}
    >
      <div className="action-item__header">
        <span className="action-item__priority">{priorityDot} {priority}</span>
        <span
          className="action-item__persona-badge"
          style={{ background: personaColor + '18', color: personaColor, border: `1px solid ${personaColor}40` }}
        >
          {personaInitials} {persona}
        </span>
      </div>
      <p className="action-item__desc">{description}</p>
      <span className="action-item__resolve-hint">{RESOLUTION_LABEL[resolutionType]} →</span>
    </div>
  );
}
