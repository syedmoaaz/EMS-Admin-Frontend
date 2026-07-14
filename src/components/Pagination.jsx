const Pagination = ({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 border-t border-slate-200 bg-white">
      <p className="text-sm text-slate-500">
        Showing {start}–{end} of {total}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          className="px-3 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-slate-50"
        >
          Previous
        </button>

        <span className="text-sm font-medium px-2">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
          className="px-3 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-slate-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
