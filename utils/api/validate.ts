import { plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { validate, ValidationError } from 'class-validator';

/**
 * Small helper to validate plain objects using a class with
 *     [class-validator](https://github.com/typestack/class-validator) decorators.
 * Returns the object as an instance of the given class and any validation errors
 * If invalid, object will be false
 */
export async function validateObject<T, V>(
  cls: ClassType<T>,
  object: V
): Promise<[T, false] | [false, ValidationError[]]> {
  const instance = plainToClass(cls, object);
  const validationErrors = await validate(instance, {
    forbidUnknownValues: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (validationErrors.length === 0) {
    return [instance, false];
  } else {
    console.log(JSON.stringify(validationErrors));
    return [false, validationErrors];
  }
}
