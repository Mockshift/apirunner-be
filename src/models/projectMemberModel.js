const mongoose = require('mongoose');
const applyBaseSchemaDefaults = require('../utils/baseModel');
const { PROJECT_ROLE } = require('../constants/common');

const projectMemberSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required'],
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  projectRole: {
    type: String,
    enum: {
      values: Object.values(PROJECT_ROLE),
      message: 'Role must be one of: owner, editor, viewer',
    },
    required: [true, 'Role is required'],
  },
  active: {
    type: Boolean,
    default: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Sets `joinedAt` to the current timestamp if missing during document creation.
 */
projectMemberSchema.pre('save', function setJoinedAtIfMissing(next) {
  if (this.isNew && !this.joinedAt) {
    this.joinedAt = Date.now();
  }
  next();
});

/**
 * Filters only active project members in all find queries.
 */
projectMemberSchema.pre(/^find/, function filterActiveProjectMembers(next) {
  this.find({ active: true });
  next();
});

applyBaseSchemaDefaults(projectMemberSchema);
const ProjectMember = mongoose.model('ProjectMember', projectMemberSchema);

module.exports = ProjectMember;
