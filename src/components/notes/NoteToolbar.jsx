
import {
  Search,
  X,
  Plus,
  Grid2X2,
  List
} from "lucide-react";

const categories = ["All", "Work", "Personal", "Ideas", "Study", "Other"];

function NotesToolbar({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  view,
  setView,
  onCreate
}) {
  return (
    <div className="notes-toolbar">

      <div className="notes-search">
        <Search size={17} />

        <input
          type="text"
          placeholder="Search your notes..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="notes-toolbar-controls">

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter by category"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "All" ? "All Categories" : category}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          aria-label="Sort notes"
        >
          <option value="updated">Recently Updated</option>
          <option value="oldest">Oldest First</option>
          <option value="title">Title A–Z</option>
        </select>

        <div className="notes-view-toggle">
          <button
            className={view === "grid" ? "active" : ""}
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <Grid2X2 size={17} />
          </button>

          <button
            className={view === "list" ? "active" : ""}
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List size={18} />
          </button>
        </div>

        <button
          className="notes-toolbar-add"
          onClick={onCreate}
        >
          <Plus size={17} />
        </button>

      </div>
    </div>
  );
}

export default NotesToolbar;
