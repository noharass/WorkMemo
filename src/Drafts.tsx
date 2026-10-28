import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { Draft } from "./draftController";
export type { Draft } from "./draftController";
export const DraftContext = createContext<
  ((id: string, draft: Draft | null) => void) | null
>(null);
export function useDraft(
  id: string,
  dirty: boolean,
  busy: boolean,
  save: () => Promise<boolean>,
  discard: () => void,
) {
  const register = useContext(DraftContext);
  const latest = useRef({ save, discard });
  latest.current = { save, discard };
  useEffect(() => {
    register?.(id, {
      dirty,
      busy,
      save: () => latest.current.save(),
      discard: () => latest.current.discard(),
    });
  }, [register, id, dirty, busy]);
  useEffect(() => () => register?.(id, null), [register, id]);
}
export function Surface({
  title,
  onClose,
  children,
  actions,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="panel-surface">
      <header className="panel-heading">
        <h2>{title}</h2>
        <button type="button" className="secondary" onClick={onClose}>
          关闭
        </button>
      </header>
      <div className="panel-scroll">{children}</div>
      {actions && <footer className="panel-actions">{actions}</footer>}
    </section>
  );
}
