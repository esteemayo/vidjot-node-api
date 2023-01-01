/* eslint-disable */
import { StatusCodes } from 'http-status-codes';

import NotFoundError from '../errors/notFound.js';
import APIFeatures from '../utils/apiFeatures.js';
import catchErrors from '../utils/catchErrors.js';

export const getAll = (Model, filter = false) =>
  catchErrors(async (req, res, next) => {
    const filterObj = filter ? { author: `${req.user.username}` } : {};

    const features = new APIFeatures(Model.find(filterObj), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const docs = await features.query.explain();
    const docs = await features.query;

    res.status(StatusCodes.OK).json(docs);
  });

export const getOne = (Model) =>
  catchErrors(async (req, res, next) => {
    const { id: docId } = req.params;

    const doc = await Model.findById(docId);

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID → ${docId}`)
      );
    }

    res.status(StatusCodes.OK).json(doc);
  });

export const getWithSlug = (Model) =>
  catchErrors(async (req, res, next) => {
    const { slug } = req.params;

    const doc = await Model.findOne({ slug });

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that SLUG → ${slug}`)
      );
    }

    res.status(StatusCodes.OK).json(doc);
  });

export const createOne = (Model) =>
  catchErrors(async (req, res, next) => {
    const doc = await Model.create({ ...req.body });

    res.status(StatusCodes.CREATED).json(doc);
  });

export const updateOne = (Model) =>
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

    res.status(StatusCodes.OK).json(doc);
  });

export const deleteOne = (Model) =>
  catchErrors(async (req, res, next) => {
    const { id: docId } = req.params;

    const doc = await Model.findByIdAndDelete(docId);

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID → ${docId}`)
      );
    }

    res.status(StatusCodes.NO_CONTENT).json(doc);
  });
