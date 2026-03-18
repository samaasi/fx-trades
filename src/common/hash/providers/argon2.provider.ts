import { IHashProvider } from '../IHashProvider';
import * as argon2 from 'argon2';

export class Argon2Provider implements IHashProvider {
  async hash(value: string): Promise<string> {
    return argon2.hash(value);
  }

  async verify(hash: string, value: string): Promise<boolean> {
    return argon2.verify(hash, value);
  }
}
