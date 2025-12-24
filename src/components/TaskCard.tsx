import type { FC } from "react";
import type { Task } from "../types/types";

interface TaskCardProps {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: FC<TaskCardProps> = ({task, onEdit, onDelete}) => {
 return (
    <div className="group rounded-2xl border bg-white p-3 shadow-sm transition hover:shadow">
      <div className="mb-1 flex items-start justify-between gap-2">
        <h4 className="font-semibold leading-tight">{task.title}</h4>
        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => onEdit(task)}
            className="rounded-xl border px-2 py-1 text-xs hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="rounded-xl border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
      {task.description && (
        <p className="line-clamp-3 text-sm text-gray-600">{task.description}</p>
      )}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>
          {new Date(task.updatedAt || new Date()).toLocaleDateString()}
        </span>
        <span className="rounded-full border px-2 py-0.5">{task.status}</span>
      </div>
    </div>
  );
};

export default TaskCard;
