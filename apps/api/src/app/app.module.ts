import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MatchesModule } from '../matches/matches.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { StatsModule } from '../stats/stats.module';
import { LeaguesModule } from '../leagues/leagues.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MatchesModule,
    SchedulingModule,
    StatsModule,
    LeaguesModule,
  ],
})
export class AppModule {}
