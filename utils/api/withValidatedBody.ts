import { ClassType } from 'class-transformer/ClassTransformer';
import { ValidationError } from 'class-validator';
import { NextApiHandler } from 'next';
import { validateObject } from './validate';

export default function withValidatedBody<BodyType>(
  cls: ClassType<BodyType>,
  generateHandler: (validatedBody: BodyType) => NextApiHandler
): NextApiHandler {
  return async (req, res) => {
    const [validatedBody, validationError] = await validateObject(
      cls,
      JSON.parse(req.body)
    );
    if (!validatedBody) {
      res.status(400).json(validationError as ValidationError[]);
      return;
    }
    return generateHandler(validatedBody)(req, res);
  };
}
