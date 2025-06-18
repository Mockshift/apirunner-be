/**
 * Applies common schema transformations to all Mongoose schemas.
 *
 * - Removes MongoDB's default `__v` version key from output
 * - Converts `_id` to a more frontend-friendly `id`
 * - Preserves virtual fields in output
 *
 *
 * @param {mongoose.Schema} schema - The Mongoose schema to apply transformations to
 */
function applyBaseSchemaDefaults(schema) {
  const transform = (_doc, ret) => {
    const transformed = { ...ret };

    transformed.id = transformed._id;
    delete transformed._id;
    delete transformed.__v;

    return transformed;
  };

  schema.set('toJSON', { virtuals: true, transform });
  schema.set('toObject', { virtuals: true, transform });
  schema.set('timestamps', true);
}
module.exports = applyBaseSchemaDefaults;
