import type { ReactNode } from 'react';
import { TabBar } from './TabBar';

interface Props {
  children: ReactNode;
  /** 56px of breathing room above the first screen element, as in the design. */
  topSpacer?: boolean;
  showTabBar?: boolean;
  /** Landing paints its own dark ground edge to edge. */
  dark?: boolean;
}

/**
 * The device column. Full-bleed on a phone; on a wide viewport it settles into
 * a 390px column on the warm backdrop, which is how the design is composed.
 */
export function AppShell({ children, topSpacer = false, showTabBar = false, dark = false }: Props) {
  return (
    <div className="backdrop">
      <div className="device" style={dark ? { background: 'var(--ink)' } : undefined}>
        {topSpacer ? <div style={{ height: 'calc(var(--safe-top) + 56px)', flexShrink: 0 }} /> : null}
        <main className="deviceScroll">{children}</main>
        {showTabBar ? <TabBar /> : null}
      </div>
    </div>
  );
}
