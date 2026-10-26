import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

/** Presentation-only dialogs keep Escape, focus trapping and focus restoration native. */
export function UiDialog({ open, onClose, title, id, children }: {
  open: boolean; onClose: () => void; title: string; id: string; children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current?.close();
  }, [open]);
  return <dialog ref={dialog} className="ui-dialog" aria-labelledby={id}
    onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <div className="settings-heading">
      <h2 id={id}>{title}</h2>
      <button className="window-control" type="button" aria-label={`关闭${title}`} onClick={onClose}><Icon name="close" /></button>
    </div>
    {children}
  </dialog>;
}
