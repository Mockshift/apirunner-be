const mongoose = require('mongoose');
const applyBaseSchemaDefaults = require('../utils/baseModel');

const projectSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required.'],
    minlength: [3, 'Name must be at least 3 characters long.'],
    maxlength: [20, 'Name must be at most 20 characters long.'],
    trim: true,
  },
  description: {
    type: String,
    required: false,
    maxlength: [300, 'Description must be at most 300 characters long.'],
  },
  ownerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

applyBaseSchemaDefaults(projectSchema);
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

// 🔐 Ek Güvenlik Notu:
// İstersen gelen istekten ownerId'yi silerek işleme al:

// js
// Kopyala
// Düzenle
// const { name, description } = req.body;

// const project = await Project.create({
//   name,
//   description,
//   ownerId: req.user.id
// });
// Bu şekilde kötü niyetli bir kullanıcının ownerId göndererek başkasının
// adına kayıt yapma riskini de ortadan kaldırırsın.
