import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Incident } from '../monitoring/entities/incident.entity';
import { AIProviderFactory } from './providers/factory';
import { In, Repository } from 'typeorm';

@Injectable()
export class VectorService {
  private readonly logger = new Logger(VectorService.name);

  constructor(
    private readonly aiProviderFactory: AIProviderFactory,
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
  ) {}

  async generateEmbedding(text: string): Promise<number[]> {
    const provider = this.aiProviderFactory.getProvider();
    return provider.generateEmbedding(text);
  }

  async findSimilarIncidents(incident: Incident): Promise<Incident[]> {
    const embeddingArray = await this.generateEmbedding(incident.symptoms);

    // The transformer will handle saving the number[] as a BLOB.
    incident.symptomsEmbedding = embeddingArray;
    await this.incidentRepository.save(incident);

    // =================================================================
    // **THE DEFINITIVE FIX: Use Raw SQL for the Vector Query**
    // =================================================================

    // 1. Create the raw string of numbers for the VECTOR() function.
    const embeddingParam = embeddingArray.join(',');

    // 2. Define the raw SQL query to get only the IDs of similar incidents.
    // We inject the embedding string directly, which is safe as it's not user-generated.
    // We use '?' for other parameters to prevent SQL injection.
    const rawQuery = `
      SELECT
        id,
        VEC_DISTANCE_COSINE(symptoms_embedding, VECTOR(${embeddingParam})) as score
      FROM incidents
      WHERE status = ? AND id != ?
      ORDER BY score ASC
      LIMIT 5;
    `;

    // 3. Execute the raw query.
    const similarIncidentIds: { id: number }[] = await this.incidentRepository.query(
      rawQuery,
      ['resolved', incident.id],
    );

    if (similarIncidentIds.length === 0) {
      return [];
    }

    // 4. Extract just the IDs.
    const ids = similarIncidentIds.map((r) => r.id);

    // 5. Use TypeORM's reliable `findByIds` to fetch the full entities.
    // This correctly hydrates the objects and their relations.
    return this.incidentRepository.find({
      where: { id: In(ids) },
      relations: ['database'],
    });
  }
}
