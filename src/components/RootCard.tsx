"use client";

interface RootCardProps {
  name: string;
  description?: string | null;
  date?: string | null;
  contactCount: number;
  x: number;
  y: number;
}

export default function RootCard({
  name,
  description,
  date,
  contactCount,
  x,
  y,
}: RootCardProps) {
  return (
    <div
      className="absolute select-none"
      style={{
        left: x - 150,
        top: y - 60,
        width: 300,
      }}
    >
      <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <h3 className="font-semibold text-slate-800 text-sm truncate">
            {name}
          </h3>
        </div>
        {description && (
          <p className="text-xs text-slate-500 mb-2 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between">
          {date && (
            <span className="text-xs text-slate-400">
              {new Date(date).toLocaleDateString()}
            </span>
          )}
          <span className="text-xs text-slate-400 ml-auto">
            {contactCount} contacts
          </span>
        </div>
      </div>
    </div>
  );
}
