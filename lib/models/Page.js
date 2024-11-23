import mongoose from 'mongoose';

const FieldSchema = new mongoose.Schema({
  fieldId: Number,
  fieldName: String,
  fieldElement: String,
  permissionType: [String],
});

const SectionSchema = new mongoose.Schema({
  sectionId: Number,
  sectionName: String,
  sectionDescription: String,
  fields: [FieldSchema],
});

const TabSchema = new mongoose.Schema({
  tabId: Number,
  tabName: String,
  tabDescription: String,
  sections: [SectionSchema],
});

const PageSchema = new mongoose.Schema({
  pageId: String,
  pageName: String,
  pageDescription: String,
  tabs: [TabSchema],
});

export default mongoose.models.Page || mongoose.model('Page', PageSchema);
