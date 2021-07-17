const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const catchErrors = require('../utils/catchErrors');

exports.getAll = (Model, filter = false) =>
  catchErrors(async (req, res, next) => {
    const filterObj = filter ? { author: `${req.user.username}` } : {};

    const features = new APIFeatures(Model.find(filterObj), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const docs = await features.query.explain();
    const docs = await features.query;

    res.status(200).send(docs);
  });

exports.getOne = (Model) =>
  catchErrors(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).send(doc);
  });

exports.getWithSlug = (Model) =>
  catchErrors(async (req, res, next) => {
    const doc = await Model.findOne({ slug: req.params.slug });

    if (!doc) {
      return next(new AppError('No document found with that SLUG', 404));
    }

    res.status(200).send(doc);
  });

exports.createOne = (Model) =>
  catchErrors(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).send(doc);
  });

exports.updateOne = (Model) =>
  catchErrors(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).send(doc);
  });

exports.deleteOne = (Model) =>
  catchErrors(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).send(doc);
  });
