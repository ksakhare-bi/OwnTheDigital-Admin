import { Schema, models, model, type InferSchemaType } from "mongoose";

const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type AdminDocument = InferSchemaType<typeof adminSchema> & {
  _id: Schema.Types.ObjectId;
};

export const AdminModel = models.Admin || model("Admin", adminSchema);
