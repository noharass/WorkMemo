export interface Draft {
  dirty: boolean;
  busy: boolean;
  save: () => Promise<boolean>;
  discard: () => void;
}

/** Coordinates drafts without replacing the form's current input. */
export class DraftController {
  readonly entries = new Map<string, Draft>();
  private saving = false;

  get busy() {
    return this.saving || [...this.entries.values()].some((d) => d.busy);
  }
  get dirty() {
    return [...this.entries.values()].some((d) => d.dirty);
  }

  async save(): Promise<boolean> {
    if (this.busy) return false;
    this.saving = true;
    try {
      // A saved form may unmount itself. New forms are not part of this operation.
      for (const draft of [...this.entries.values()]) {
        if (draft.dirty && !(await draft.save())) return false;
      }
      return true;
    } finally {
      this.saving = false;
    }
  }

  discard(): boolean {
    if (this.busy) return false;
    for (const draft of [...this.entries.values()])
      if (draft.dirty) draft.discard();
    return true;
  }
}
