import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: any) {
    const result = (await super.canActivate(context)) as boolean;
    await super.logIn(context.switchToHttp().getRequest());
    return result;
  }
}
