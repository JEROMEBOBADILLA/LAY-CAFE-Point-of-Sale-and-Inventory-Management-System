import ValidationError from './ValidationError.js';
// A checkout must explicitly select its service type.
export function validateOrderType(value) {
  if (value === 'dine_in' || value === 'take_out')
    return value;
  throw new ValidationError(400, 'Choose Dine In or Take Out before payment.');
}
