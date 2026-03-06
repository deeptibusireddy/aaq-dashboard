import { useMemo, useState } from 'react';
import type { ActionItem as ActionItemType, Priority } from '../../types';
import { ActionItem } from './ActionItem';
import { ResolutionDrawer } from './ResolutionDrawer';
import './ActionInsightsPanel.css';

interface Props {
  items: ActionItemType[];
}

const PRIORITY_ORDER: Priority[] = ['High', 'Medium', 'Low'];

export function ActionInsightsPanel({ items }: Props) {
  const [activeItem, setActiveItem] = useState<ActionItemType | null>(null);

  const grouped = useMemo(() => {
    return PRIORITY_ORDER.map(priority => ({
      priority,
      items: items.filter(i => i.priority === priority),
    })).filter(g => g.items.length > 0);
  }, [items]);

  return (
    <>
      <aside className="insights-panel surface">
        <div className="insights-panel__header">
          <span className="insights-panel__icon">⚡</span>
          <h2 className="insights-panel__title">Actionable Insights</h2>
          <span className="insights-panel__count">{items.length}</span>
        </div>

        <div className="insights-panel__body">
          {grouped.map(group => (
            <div key={group.priority} className="insights-panel__group">
              <div className="insights-panel__group-label">
                {group.priority === 'High' ? '🔴' : group.priority === 'Medium' ? '🟡' : '🟢'}
                {' '}{group.priority} Priority
              </div>
              {group.items.map(item => (
                <ActionItem key={item.id} item={item} onClick={setActiveItem} />
              ))}
            </div>
          ))}
        </div>
      </aside>

      <ResolutionDrawer item={activeItem} onClose={() => setActiveItem(null)} />
    </>
  );
}
