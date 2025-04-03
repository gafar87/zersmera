import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ id, index, row, onChange, onRemove }) {
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
    
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-300 rounded p-3 bg-gray-50 shadow-sm mb-2"
    >
      <div className="flex justify-between items-start">
        <div className="text-xl cursor-grab pr-3 select-none" {...attributes} {...listeners}>
          ⠿
        </div>
        <label className="block w-full">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Название оборудования
          </span>
          <input
            type="text"
            value={row.name}
            onChange={(e) => onChange(index, "name", e.target.value)}
            className="input w-full"
          />
        </label>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="ml-4 text-red-500 hover:text-red-700 text-xl"
        >
          ✕
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-4 w-full pl-7 pr-2">
        <input
          type="number"
          value={row.length}
          placeholder="Длина"
          onChange={(e) => onChange(index, "length", e.target.value)}
          className="input"
        />
        <input
          type="text"
          value={row.interval}
          placeholder="Интервал"
          onChange={(e) => onChange(index, "interval", e.target.value)}
          className="input"
        />
        <input
          type="number"
          value={row.tolerance}
          placeholder="Допуск ±"
          onChange={(e) => onChange(index, "tolerance", e.target.value)}
          className="input"
        />
      </div>
    </div>
  );
}

function EquipmentInput({ onChange, initialData = [] }) {
  const [rows, setRows] = useState(initialData);

  useEffect(() => {
    setRows(initialData);
  }, [initialData]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
    onChange(updated);
  };

  const addRow = () => {
    const updated = [...rows, { name: "", length: "", interval: "", tolerance: "" }];
    setRows(updated);
    onChange(updated);
  };

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    onChange(updated);
  };

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = rows.findIndex((_, i) => `row-${i}` === active.id);
      const newIndex = rows.findIndex((_, i) => `row-${i}` === over.id);
      const reordered = arrayMove(rows, oldIndex, newIndex);
      setRows(reordered);
      onChange(reordered);
    }
  };

  return (
    <div className="mt-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={rows.map((_, i) => `row-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          {rows.map((row, index) => (
            <SortableItem
              key={index}
              id={`row-${index}`}
              index={index}
              row={row}
              onChange={handleChange}
              onRemove={removeRow}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addRow}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        ➕ Добавить строку
      </button>
    </div>
  );
}

export default EquipmentInput;