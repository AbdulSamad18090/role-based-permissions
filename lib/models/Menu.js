import mongoose from "mongoose";

// Define SubmenuSchema without recursion
const SubmenuSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  path: { type: String, required: true },
  submenus: [
    {
      id: { type: String },
      name: { type: String },
      path: { type: String },
      submenus: Array, // Allow further nesting
    },
  ],
});

// Define MenuSchema
const MenuSchema = new mongoose.Schema({
  menuId: { type: String, required: true },
  name: { type: String, required: true },
  path: { type: String, required: false, default: "" },
  submenus: [SubmenuSchema],
});

export default mongoose.models.Menu || mongoose.model("Menu", MenuSchema);
