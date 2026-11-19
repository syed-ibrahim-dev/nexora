
import {
  Plus,
  Search,
  SlidersHorizontal,
  Flag,
  X,
} from "lucide-react";

const TaskToolbar = ({
  search,
  setSearch,
  filter,
  setFilter,
  priorityFilter,
  setPriorityFilter,
  onAdd,
}) => {
  return (
    <div className="task-toolbar">
      <div className="task-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search tasks"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="task-toolbar-actions">
        <div className="task-filter">
          <SlidersHorizontal size={16} />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter by task status"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="task-filter">
          <Flag size={16} />

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        <button
          type="button"
          className="task-add-button"
          onClick={onAdd}
        >
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>
    </div>
  );
};

export default TaskToolbar;
