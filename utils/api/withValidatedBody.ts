import { ClassType } from 'class-transformer/ClassTransformer';
import { ValidationError } from 'class-validator';
import { NextApiHandler } from 'next';
import { validateObject } from './validate';

export default function withValidatedBody<BodyType>(
  cls: ClassType<BodyType>,
  generateHandler: (validatedBody: BodyType) => NextApiHandler
): NextApiHandler {
  return async (req, res) => {
    try {
      const [validatedBody, validationError] = await validateObject(
        cls,
        req.body
      );
      if (!validatedBody) {
        res.status(400).json(validationError as ValidationError[]);
        return;
      }
      return generateHandler(validatedBody)(req, res);
    } catch (e) {
      console.error(e, req.body, typeof req.body);
      res.status(400).send('Body was invalid JSON');
    }
  };
}
