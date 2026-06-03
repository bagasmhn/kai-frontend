import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T extends { id: number }> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  loading?: boolean;
}

export default function DataTable<T extends { id: number }>({ columns, data, onEdit, onDelete, loading }: Props<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();

    return data.filter((r) => {
      // Prefer a fast JSON stringify of the row (covers nested fields like gerbong.nama)
      try {
        return JSON.stringify(r).toLowerCase().includes(q);
      } catch {
        // Fallback: check individual column raw values and rendered text when primitive
        return columns.some((c) => {
          const raw = (r as Record<string, unknown>)[c.key as string];
          if (raw !== null && raw !== undefined) {
            if (String(raw).toLowerCase().includes(q)) return true;
          }
          if (c.render) {
            try {
              const rendered = (c.render as any)(r);
              if (typeof rendered === "string" || typeof rendered === "number") {
                if (String(rendered).toLowerCase().includes(q)) return true;
              }
            } catch {
              // ignore render errors
            }
          }
          return false;
        });
      }
    });
  }, [data, query, columns]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (page > totalPages) setPage(totalPages);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-rail-400/30 border-t-rail-400 rounded-full animate-spin" />
    </div>
  );

  if (!data.length) return (
    <div className="text-center py-16 text-white/30 text-sm">
      <div className="text-4xl mb-3">🚂</div>
      Belum ada data
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-white/5">
        <div className="text-sm text-white/40">{total} item</div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            placeholder="Cari..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-transparent border border-white/10 rounded-xl text-white text-sm w-full sm:w-48"
          />
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-3 py-2 bg-transparent border border-white/10 rounded-xl text-white text-sm">
            <option value={6}>6 / halaman</option>
            <option value={12}>12 / halaman</option>
            <option value={24}>24 / halaman</option>
            <option value={48}>48 / halaman</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-black/20 sticky top-0">
              {columns.map((c) => (
                <th key={String(c.key)} className="px-3 py-2 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                  {c.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-3 py-2 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row) => (
              <tr key={row.id} className="border-b border-white/5 hover:bg-white/3 transition-colors group">
                {columns.map((c) => (
                  <td key={String(c.key)} className="px-3 py-2 text-white/80">
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key as string] ?? "")}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(row)} className="p-1.5 rounded-lg hover:bg-rail-600/30 text-white/40 hover:text-rail-300 transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(row)} className="p-1.5 rounded-lg hover:bg-red-600/20 text-white/40 hover:text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 mt-3 px-4 py-3">
        <div className="text-sm text-white/40">Halaman {page} / {totalPages}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded-xl bg-white/5 text-white/60 hover:bg-white/10">Prev</button>
          <div className="text-sm text-white/40">{Math.min((page - 1) * pageSize + 1, total)} - {Math.min(page * pageSize, total)} dari {total}</div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded-xl bg-white/5 text-white/60 hover:bg-white/10">Next</button>
        </div>
      </div>
    </div>
  );
}
