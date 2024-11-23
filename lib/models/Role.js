import mongoose from 'mongoose';

const FieldSchema = new mongoose.Schema({
  fieldId: Number,
  permissionType: [String],
});

const SectionSchema = new mongoose.Schema({
  sectionId: Number,
  view: Boolean,
  fields: [FieldSchema],
});

const TabSchema = new mongoose.Schema({
  tabId: Number,
  view: Boolean,
  sections: [SectionSchema],
});

const FormPermissionSchema = new mongoose.Schema({
  pageId: String,
  pagePath: String,
  tabs: [TabSchema],
});

const ReportPermissionSchema = new mongoose.Schema({
  reportId: String,
  reportName: String,
});

const RoleSchema = new mongoose.Schema({
  roleId: Number,
  role: String,
  permissions: {
    menuPermission: [String],
    formPermission: [FormPermissionSchema],
    reportPermission: [ReportPermissionSchema],
    workflowPermission: [String],
  },
});

export default mongoose.models.Role || mongoose.model('Role', RoleSchema);
