"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Contact } from "./ContactCard";

function useDarkMode() {
  const subscribe = useCallback((cb: () => void) => {
    const observer = new MutationObserver(cb);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false
  );
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  dashed: boolean;
}

interface EdgeLayerProps {
  contacts: Contact[];
  connections: Connection[];
  rootX: number;
  rootY: number;
}

function getOrthogonalPath(
  fx: number,
  fy: number,
  tx: number,
  ty: number
): string {
  const midY = (fy + ty) / 2;
  return `M ${fx} ${fy} L ${fx} ${midY} L ${tx} ${midY} L ${tx} ${ty}`;
}

export default function EdgeLayer({
  contacts,
  connections,
  rootX,
  rootY,
}: EdgeLayerProps) {
  const dark = useDarkMode();
  const strokeColor = dark ? "#64748b" : "#94a3b8";
  const contactMap = new Map(contacts.map((c) => [c.id, c]));

  // Draw connections from root to each contact + inter-contact connections
  const edges: {
    id: string;
    path: string;
    dashed: boolean;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }[] = [];

  // Root to each contact (dashed)
  contacts.forEach((contact) => {
    edges.push({
      id: `root-${contact.id}`,
      path: getOrthogonalPath(rootX, rootY, contact.x, contact.y),
      dashed: true,
      fromX: rootX,
      fromY: rootY,
      toX: contact.x,
      toY: contact.y,
    });
  });

  // Inter-contact connections
  connections.forEach((conn) => {
    const from = contactMap.get(conn.fromId);
    const to = contactMap.get(conn.toId);
    if (from && to) {
      edges.push({
        id: conn.id,
        path: getOrthogonalPath(from.x, from.y, to.x, to.y),
        dashed: conn.dashed,
        fromX: from.x,
        fromY: from.y,
        toX: to.x,
        toY: to.y,
      });
    }
  });

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width: "10000px", height: "10000px", overflow: "visible" }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={strokeColor}
          />
        </marker>
      </defs>
      {edges.map((edge) => (
        <g key={edge.id}>
          <path
            d={edge.path}
            stroke={strokeColor}
            strokeWidth={1.5}
            fill="none"
            strokeDasharray={edge.dashed ? "6 4" : "none"}
            markerEnd="url(#arrowhead)"
          />
          <circle cx={edge.fromX} cy={edge.fromY} r={4} fill={strokeColor} />
        </g>
      ))}
    </svg>
  );
}
