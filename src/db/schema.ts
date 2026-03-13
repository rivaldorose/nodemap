import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("contact_status", [
  "active",
  "pending",
  "inactive",
]);

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  date: timestamp("date", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  company: text("company"),
  linkedin: text("linkedin"),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  status: statusEnum("status").default("active").notNull(),
  color: text("color").default("#3b82f6"),
  x: integer("x").default(0).notNull(),
  y: integer("y").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
});

export const connections = pgTable("connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  fromId: uuid("from_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  toId: uuid("to_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  dashed: boolean("dashed").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
