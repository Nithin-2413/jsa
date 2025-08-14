import { pgTable, text, timestamp, uuid, varchar, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const writtenHug = pgTable("written_hug", {
  id: uuid("id").primaryKey().defaultRandom(),
  Name: text("Name"),
  Date: timestamp("Date", { withTimezone: true }).defaultNow(),
  "Recipient's Name": text("Recipient's Name"),
  Status: varchar("Status"),
  "Email Address": varchar("Email Address"),
  "Phone Number": doublePrecision("Phone Number"),
  "Type of Message": varchar("Type of Message"),
  "Message Details": varchar("Message Details"),
  Feelings: varchar("Feelings"),
  Story: varchar("Story"),
  "Specific Details": varchar("Specific Details"),
  "Delivery Type": varchar("Delivery Type"),
});

export const hugReplies = pgTable("hug_replies", {
  id: uuid("id").primaryKey().defaultRandom(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  hugid: uuid("hugid").references(() => writtenHug.id, { onDelete: "cascade" }),
  sender_type: text("sender_type"), // 'admin' or 'client'
  sender_name: text("sender_name"),
  message: text("message"),
  is_read: text("is_read").default("false"), // Add missing column
  email_sent: text("email_sent").default("false"), // Add missing column
});

export const adminLoginLogs = pgTable("admin_login_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  username: text("username"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  city: text("city"),
  country: text("country"),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
});

export const insertWrittenHugSchema = createInsertSchema(writtenHug).omit({
  id: true,
  Date: true,
});

export const insertHugReplySchema = createInsertSchema(hugReplies).omit({
  id: true,
  created_at: true,
});

export type InsertWrittenHug = z.infer<typeof insertWrittenHugSchema>;
export type WrittenHug = typeof writtenHug.$inferSelect;
export type InsertHugReply = z.infer<typeof insertHugReplySchema>;
export type HugReply = typeof hugReplies.$inferSelect;