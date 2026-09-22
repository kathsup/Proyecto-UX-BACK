import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { HeatmapQueryDto } from './dto/heatmap-query.dto';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  getDashboard(@Query() query: DashboardQueryDto, @CurrentUser() user: any) {
    return this.statisticsService.getDashboard(user.id, query.date);
  }

  @Get('overview')
  getOverview(@Query() query: DashboardQueryDto, @CurrentUser() user: any) {
    return this.statisticsService.getOverview(user.id, query.date);
  }

  @Get('heatmap')
  getHeatmap(@Query() query: HeatmapQueryDto, @CurrentUser() user: any) {
    return this.statisticsService.getHeatmap(user.id, query.days ?? 90);
  }
}
