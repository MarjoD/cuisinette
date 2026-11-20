import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  titre: string;
  message: string;
  onConfirmer: () => void;
  onAnnuler: () => void;
};

export default function ConfirmDialog({
  titre,
  message,
  onConfirmer,
  onAnnuler,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-cuisinette"
      aria-labelledby="confirm-titre"
      aria-describedby="confirm-message"
      onCancel={(event) => {
        event.preventDefault();
        onAnnuler();
      }}
    >
      <span className="confirm-fleur" aria-hidden="true">
        ✿
      </span>

      <h2 id="confirm-titre">{titre}</h2>
      <p id="confirm-message">{message}</p>

      <div className="confirm-actions">
        <button type="button" className="confirm-annuler" onClick={onAnnuler}>
          Non, garder !
        </button>

        <button type="button" className="confirm-valider" onClick={onConfirmer}>
          Oui, c'est parti !
        </button>
      </div>
    </dialog>
  );
}
