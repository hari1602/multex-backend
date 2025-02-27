import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsModule } from './tenants/tenants.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ClientsModule } from './clients/clients.module';
import { ReposModule } from './repos/repos.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ProjectsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      // host: 'postgres',
      host: 'multex.cbac8osi8jre.us-east-1.rds.amazonaws.com',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'development',
      synchronize: true,
      autoLoadEntities: true,
      namingStrategy: new SnakeNamingStrategy(),
      ssl: { rejectUnauthorized: false }, // should be removed, testing purpose
      logging: true,
      entities: [`${__dirname}/src/**/entities/*.entity.ts`],
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TenantsModule,
    ClientsModule,
    ReposModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
