import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get('status')
  getStatus() {
    return this.apiService.getStatus();
  }

  @Get('databases')
  getDatabases() {
    return this.apiService.getDatabases();
  }

  @Get('metrics/:databaseId')
  getMetrics(
    @Param('databaseId') databaseId: number,
    @Query('range') range: string,
  ) {
    return this.apiService.getMetricsForDatabase(databaseId, range);
  }

  @Get('incidents')
  getIncidents(@Query('status') status: string) {
    return this.apiService.getRecentIncidents(status);
  }

  @Get('actions')
  getActions() {
    return this.apiService.getRecentActions();
  }

  @Get('action-history')
  getActionHistory() {
    return this.apiService.getActionHistory();
  }
}
