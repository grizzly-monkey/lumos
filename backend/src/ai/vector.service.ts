import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Incident } from '../monitoring/entities/incident.entity';
import { AIProviderFactory } from './providers/factory';
import { Repository } from 'typeorm';

@Injectable()
export class VectorService {
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

    // The transformer handles saving the number[] as a BLOB.
    incident.symptomsEmbedding = embeddingArray;
    await this.incidentRepository.save(incident);

    // Create the raw string of numbers for the query.
    const embeddingParam = embeddingArray.join(',');

    const similarIncidents = await this.incidentRepository
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.database', 'database')
      // **THE FIX**: Directly inject the unquoted string into the VECTOR() function.
      // This is safe because the string is generated from our own embedding service.
      .addSelect(
        `VEC_DISTANCE_COSINE(incident.symptoms_embedding, VECTOR('${embeddingParam}'))`,
        'score',
      )
      .where('incident.status = :status', { status: 'resolved' })
      .andWhere('incident.id != :id', { id: incident.id })
      // No longer need .setParameter for the embedding.
      .orderBy('score', 'ASC')
      .limit(5)
      .getMany();

    return similarIncidents;
  }
}
