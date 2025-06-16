/**
 * Applies common schema transformations to all Mongoose schemas.
 *
 * - Removes MongoDB's default `__v` version key from output
 * - Converts `_id` to a more frontend-friendly `id`
 * - Preserves virtual fields in output
 *
 * Note: Uses a shallow clone of the return object to avoid ESLint no-param-reassign errors.
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
}
module.exports = applyBaseSchemaDefaults;
