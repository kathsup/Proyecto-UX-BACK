import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HabitsModule } from './habits/habits.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, HabitsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
