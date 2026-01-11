import { Injectable, Logger } from '@nestjs/common';
import { Incident } from '../monitoring/entities/incident.entity';
import { VectorService } from './vector.service';
import { AIProviderFactory } from './providers/factory';
import { ActionsService } from '../actions/actions.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly vectorService: VectorService,
    private readonly aiProviderFactory: AIProviderFactory,
    private readonly actionsService: ActionsService,
  ) {}

  async startIncidentAnalysis(incident: Incident) {
    this.logger.log(`Starting analysis for incident ${incident.id}`);

    const similarIncidents = await this.vectorService.findSimilarIncidents(
      incident,
    );

    const provider = this.aiProviderFactory.getProvider();
    const analysis = await provider.analyzeIncident(
      incident,
      similarIncidents,
    );

    if (
      analysis.should_auto_execute &&
      analysis.confidence >=
        (process.env.ACTION_CONFIDENCE_THRESHOLD || 85)
    ) {
      this.logger.log(`Executing action for incident ${incident.id}`);
      await this.actionsService.executeAction(incident, analysis);
    } else {
      this.logger.log(
        `Action for incident ${incident.id} requires manual review`,
      );
    }
  }
}
