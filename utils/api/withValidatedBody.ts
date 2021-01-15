import { ClassType } from 'class-transformer/ClassTransformer';
import { ValidationError } from 'class-validator';
import { NextApiHandler } from 'next';
import { validateObject } from './validate';

export default function withValidatedBody<
  T,
  U,
  N extends NextApiHandler<U>,
  M extends NextApiHandler<U | ValidationError[]>
>(cls: ClassType<T>, handler: N): M {
  return (async (req, res) => {
    const [validatedBody, validationError] = await validateObject(
      cls,
      JSON.parse(req.body)
    );
    if (!validatedBody) {
      res.status(400).json(validationError as ValidationError[]);
      return;
    }
    req.body = validatedBody;
    return handler(req, res);
  }) as M;
}
