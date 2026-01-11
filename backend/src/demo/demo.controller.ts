import { Server } from 'socket.io';
import { Repository } from 'typeorm';
import { Metric } from '../monitoring/entities/metric.entity';
import { MonitoringService } from '../monitoring/monitoring.service';

export class DemoController {
  constructor(
    private readonly server: Server,
    private readonly metricsRepository: Repository<Metric>,
    private readonly monitoringService: MonitoringService,
  ) {}

  async slowQueryScenario() {
    this.emitStep('Injecting anomalous metrics for a slow query...');
    // 1. Manually create and save a metric that would trigger the anomaly
    // await this.metricsRepository.save(anomalousMetric);

    this.emitStep('Triggering monitoring cycle to detect the issue...');
    // 2. Directly call the monitoring service's main method
    await this.monitoringService.handleCron();
    // This will detect the anomaly, create an incident, and trigger the AI service.
    // The rest of the flow (AI analysis, action execution) will proceed automatically.

    this.emitStep('Monitoring the resolution...');
    // The frontend will see the incident, the AI's decision, and the action being executed via the normal WebSocket events.
  }

  private emitStep(message: string) {
    this.server.emit('demo_step', { message });
  }

  trigger(scenario: string) {
    switch (scenario) {
      case 'slow_query':
        this.slowQueryScenario();
        break;
      default:
        console.log(`Unknown demo scenario: ${scenario}`);
    }
  }
}
