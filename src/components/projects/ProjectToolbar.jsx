
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";

const ProjectToolbar = ({
  search,
  setSearch,
  filter,
  setFilter,
  onAdd,
}) => {
  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="project-toolbar">

      {/* SEARCH */}
      <div className="project-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search projects"
        />

        {search && (
          <button
            type="button"
            className="project-search-clear"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* FILTER AND CREATE */}
      <div className="project-toolbar-actions">

        <div className="project-filter">
          <SlidersHorizontal size={17} />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter projects by status"
          >
            <option value="all">All Projects</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="pending">Not Started</option>
          </select>
        </div>

        <button
          type="button"
          className="project-add-button"
          onClick={onAdd}
        >
          <Plus size={18} />
          <span>New Project</span>
        </button>

      </div>
    </div>
  );
};

export default ProjectToolbar;
