import { auth } from "./auth";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

// Pastel tag colors
const TAG_COLORS = [
  "#dbeafe", // blue
  "#dcfce7", // green
  "#fef3c7", // yellow
  "#fce7f3", // pink
  "#e0e7ff", // indigo
  "#f3e8ff", // purple
  "#ccfbf1", // teal
  "#ffedd5", // orange
];

export function getTagColor(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

// Calculate radial position for new contacts around center
export function getRadialPosition(
  index: number,
  total: number,
  centerX: number,
  centerY: number,
  radius = 300
): { x: number; y: number } {
  const angle = (2 * Math.PI * index) / Math.max(total, 1) - Math.PI / 2;
  return {
    x: Math.round(centerX + radius * Math.cos(angle)),
    y: Math.round(centerY + radius * Math.sin(angle)),
  };
}
