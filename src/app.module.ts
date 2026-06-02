import { Module } from '@nestjs/common';
import * as path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HeaderResolver, I18nModule, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('FALLBACK_LANGUAGE'),
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: true,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
