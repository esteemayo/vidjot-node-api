import slugify from 'slugify';
import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add title.'],
      maxlength: [
        50,
        'An ideal title must have less or equal than 20 characters.',
      ],
      minlength: [
        10,
        'An ideal title must have more or equal than 10 characters.',
      ],
    },
    slug: String,
    details: {
      type: String,
      required: [true, 'Please add some details.'],
    },
    author: {
      type: String,
      required: [true, 'You must supply an author'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ideaSchema.index({ title: 1, slug: -1 });

ideaSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();

  this.slug = slugify(this.title, { lower: true });

  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const ideaWithSlug = await this.constructor.find({ slug: slugRegEx });

  if (ideaWithSlug.length) {
    this.slug = `${this.slug}-${ideaWithSlug.length + 1}`;
  }

  next();
});

const Idea = mongoose.models.Idea || mongoose.model('Idea', ideaSchema);

export default Idea;
