import mongoose, { Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  shop: string;
  announcementText: string;
  timestamp: Date;
}

const auditLogSchema = new mongoose.Schema<IAuditLog>({
  shop: { type: String, required: true },
  announcementText: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
