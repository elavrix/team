import { statuses } from "../../data/sampleData.js";
import BoardColumn from "./BoardColumn.jsx";

export default function BoardView({ tasks, onOpenTask, onUpdateTask }) {
  return (
    <div className="board-view">
      {statuses.map((status) => (
        <BoardColumn
          key={status}
          status={status}
          tasks={tasks.filter((task) => task.status === status)}
          onOpenTask={onOpenTask}
          onUpdateTask={onUpdateTask}
        />
      ))}
    </div>
  );
}
