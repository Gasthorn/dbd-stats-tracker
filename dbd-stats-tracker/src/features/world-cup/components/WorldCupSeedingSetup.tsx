import { useState, type PointerEvent } from "react";
import { Icon } from "../../settings";

const GROUP_SIZE = 6;

interface WorldCupSeedingSetupProps {
  eligibleKillers: string[];
  onStart: (options?: { manualSeedOrder?: string[] }) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

function moveItem<T>(items: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function reorderItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function WorldCupSeedingSetup({ eligibleKillers, onStart, isSubmitting, error }: WorldCupSeedingSetupProps) {
  const [mode, setMode] = useState<"choice" | "manual">("choice");
  const [order, setOrder] = useState<string[]>(eligibleKillers);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const groupCount = Math.floor(eligibleKillers.length / GROUP_SIZE);
  const canStart = groupCount >= 1;

  // Native HTML5 drag-and-drop is unreliable in Tauri's WebView2, so this drags via Pointer
  // Events instead: capture the pointer on the handle, track which row it's over via
  // elementFromPoint, and commit the reorder on release.
  function handlePointerDown(event: PointerEvent<HTMLSpanElement>, index: number) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggedIndex(index);
    setDragOverIndex(index);
  }

  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    if (draggedIndex === null) return;
    const row = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("li[data-drag-index]");
    if (!row) return;
    const index = Number(row.dataset.dragIndex);
    if (!Number.isNaN(index)) setDragOverIndex(index);
  }

  function handlePointerUp(event: PointerEvent<HTMLSpanElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (draggedIndex !== null && dragOverIndex !== null) {
      setOrder((prev) => reorderItem(prev, draggedIndex, dragOverIndex));
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="stats-zone world-cup-seeding-setup">
      <h2>Premier World Cup</h2>
      <p>
        {eligibleKillers.length} tueurs débloqués — {groupCount} poule(s) de {GROUP_SIZE} seront formées
        {eligibleKillers.length % GROUP_SIZE !== 0 &&
          ` (${eligibleKillers.length % GROUP_SIZE} tueur(s) tiré(s) au sort resteront hors tournoi)`}
        .
      </p>

      {!canStart && (
        <p className="match-error">
          Il faut au moins {GROUP_SIZE * 6} tueurs débloqués pour former assez de poules et qualifier 32 tueurs.
        </p>
      )}

      {error && <p className="match-error">{error}</p>}

      {mode === "choice" && canStart && (
        <div className="world-cup-seeding-choice">
          <button type="button" onClick={() => onStart()} disabled={isSubmitting}>
            Tirage aléatoire
          </button>
          <button type="button" onClick={() => setMode("manual")} disabled={isSubmitting}>
            Classer moi-même les tueurs (chapeaux)
          </button>
        </div>
      )}

      {mode === "manual" && (
        <>
          <p className="world-cup-seeding-hint">
            Classe les tueurs du plus fort (1er) au plus faible : les meilleurs seront répartis un par poule
            (comme les chapeaux de la Coupe du Monde), pour équilibrer le tirage. Glisse-dépose pour réordonner,
            ou utilise les flèches.
          </p>
          <ol className="world-cup-seeding-list">
            {order.map((killer, index) => (
              <li
                key={killer}
                data-drag-index={index}
                className={`${draggedIndex === index ? "is-dragging" : ""} ${dragOverIndex === index && draggedIndex !== index ? "is-drag-over" : ""}`.trim()}
              >
                <span
                  className="world-cup-seeding-drag-handle"
                  aria-hidden="true"
                  onPointerDown={(event) => handlePointerDown(event, index)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                >
                  ⠿
                </span>
                <span className="world-cup-seeding-rank">{index + 1}</span>
                <Icon category="Characters" name={killer} alt={killer} size={32} />
                <span className="world-cup-seeding-name">{killer}</span>
                <span className="world-cup-seeding-controls">
                  <button
                    type="button"
                    onClick={() => setOrder((prev) => moveItem(prev, index, -1))}
                    disabled={index === 0}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrder((prev) => moveItem(prev, index, 1))}
                    disabled={index === order.length - 1}
                  >
                    ▼
                  </button>
                </span>
              </li>
            ))}
          </ol>
          <div className="match-form-row">
            <button type="button" onClick={() => onStart({ manualSeedOrder: order })} disabled={isSubmitting}>
              {isSubmitting ? "Tirage en cours..." : "Lancer le tirage"}
            </button>
            <button type="button" onClick={() => setMode("choice")} disabled={isSubmitting}>
              Annuler
            </button>
          </div>
        </>
      )}
    </div>
  );
}
