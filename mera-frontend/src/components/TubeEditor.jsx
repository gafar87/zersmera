// components/TubeEditor.jsx
import React, { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableTubeRow({ tube, index, onToggle, onRemove }) {
  const { id, length, number, row, enabled } = tube;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} className={enabled ? "" : "bg-gray-200"}>
      <td {...attributes} {...listeners} className="cursor-grab">⠿</td>
      <td>{number}</td>
      <td>{length}</td>
      <td>{row || "—"}</td>
      <td>
        <input type="checkbox" checked={enabled} onChange={() => onToggle(id)} />
      </td>
      <td>
        <button onClick={() => onRemove(id)} className="text-red-500 hover:text-red-700">✕</button>
      </td>
    </tr>
  );
}

export default function TubeEditor({ tubes, onChange }) {
  const [tubeList, setTubeList] = useState([]);

  useEffect(() => {
    // Добавляем ID и флаг активности если нет
    const prepared = tubes.map((t, idx) => ({
      ...t,
      id: t.id || `tube-${idx}-${t.number}`,
      enabled: t.enabled !== false,
    }));
    setTubeList(prepared);
  }, [tubes]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tubeList.findIndex((t) => t.id === active.id);
      const newIndex = tubeList.findIndex((t) => t.id === over.id);
      const newList = arrayMove(tubeList, oldIndex, newIndex);
      setTubeList(newList);
      onChange(newList);
    }
  };

  const toggleTube = (id) => {
    const updated = tubeList.map((t) =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    );
    setTubeList(updated);
    onChange(updated);
  };

  const removeTube = (id) => {
    const filtered = tubeList.filter((t) => t.id !== id);
    setTubeList(filtered);
    onChange(filtered);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Редактор труб</h2>
      <div className="overflow-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tubeList.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <table className="min-w-full table-auto border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">⇅</th>
                  <th className="p-2">№ трубы</th>
                  <th className="p-2">Длина</th>
                  <th className="p-2">Ряд</th>
                  <th className="p-2">Включена</th>
                  <th className="p-2">Удалить</th>
                </tr>
              </thead>
              <tbody>
                {tubeList.map((tube, index) => (
                  <SortableTubeRow
                    key={tube.id}
                    tube={tube}
                    index={index}
                    onToggle={toggleTube}
                    onRemove={removeTube}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}