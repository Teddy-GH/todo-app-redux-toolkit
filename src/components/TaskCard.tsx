import type { FC } from "react";
import type { Task } from "../types/types";

interface TaskCardProps {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: FC<TaskCardProps> = () => {
  return <div>Task Card</div>;
};

export default TaskCard;
