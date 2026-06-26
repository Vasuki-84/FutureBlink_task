import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  shop: { type: String, required: true },
  announcementText: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
