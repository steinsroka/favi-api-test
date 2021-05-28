import { ErrorString } from '../const/error-string';
import { Message } from './message';

export class ErrorMessage extends Message {
  constructor(message: string, error: ErrorString) {
    super(message);
    this.error = error;
  }

  error: string;
}
