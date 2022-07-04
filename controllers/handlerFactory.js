const { StatusCodes } = require('http-status-codes');

const NotFoundError = require('../errors/notFound');
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

    res.status(StatusCodes.OK).send(docs);
  });

exports.getOne = (Model) =>
  catchErrors(async (req, res, next) => {
    const { id: docId } = req.params;

    const doc = await Model.findById(docId);

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID → ${docId}`)
      );
    }

    res.status(StatusCodes.OK).send(doc);
  });

exports.getWithSlug = (Model) =>
  catchErrors(async (req, res, next) => {
    const { slug } = req.params;

    const doc = await Model.findOne({ slug });

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that SLUG → ${slug}`)
      );
    }

    res.status(StatusCodes.OK).send(doc);
  });

exports.createOne = (Model) =>
  catchErrors(async (req, res, next) => {
    const doc = await Model.create({ ...req.body });

    res.status(StatusCodes.CREATED).send(doc);
  });

exports.updateOne = (Model) =>
  catchErrors(async (req, res, next) => {
    const { id: docId } = req.params;

    const doc = await Model.findByIdAndUpdate(
      docId,
      { $set: { ...req.body } },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID → ${docId}`)
      );
    }

    res.status(StatusCodes.OK).send(doc);
  });

exports.deleteOne = (Model) =>
  catchErrors(async (req, res, next) => {
    const { id: docId } = req.params;

    const doc = await Model.findByIdAndDelete(docId);

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID → ${docId}`)
      );
    }

    res.status(StatusCodes.NO_CONTENT).send(doc);
  });
