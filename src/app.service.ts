import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class AppService {
  getHello(): string {
    const i18n = I18nContext.current()!;

    return i18n.translate('user.HELLO', {
      args: { username: 'dat' },
    });
  }
}