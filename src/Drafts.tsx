import {
  createContext,
  useContext,
  useEffect,
  useRef,
  Children,
  isValidElement,
  cloneElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { useLayout } from "./desktopPreferences";
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
  children,
  actions,
}: {
  title: string;
  onClose?: () => void;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const compact = useLayout().current.density === "compact";
  function fold(node: ReactNode): ReactNode {
    return Children.map(node, (child) => {
      if (!isValidElement(child)) return child;
      const element = child as ReactElement<{
        children?: ReactNode;
        className?: string;
      }>;
      if (
        element.type === "p" &&
        element.props.className?.split(" ").includes("hint")
      )
        return (
          <details className="compact-help">
            <summary>说明</summary>
            {element}
          </details>
        );
      return element.props.children
        ? cloneElement(element, {}, fold(element.props.children))
        : element;
    });
  }
  return (
    <section className="panel-surface">
      <header className="panel-heading">
        <h2>{title}</h2>
      </header>
      <div className="panel-scroll">{compact ? fold(children) : children}</div>
      {actions && <footer className="panel-actions">{actions}</footer>}
    </section>
  );
}
