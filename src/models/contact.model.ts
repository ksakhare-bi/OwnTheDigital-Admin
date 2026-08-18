import { Schema, models, model, type InferSchemaType } from "mongoose";

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export type ContactDocument = InferSchemaType<typeof contactSchema> & {
  _id: Schema.Types.ObjectId;
};

export const ContactModel =
  models.Contact || model("Contact", contactSchema);
