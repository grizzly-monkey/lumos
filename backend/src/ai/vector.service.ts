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

    // The transformer correctly handles saving the number[] as a BLOB for INSERT/UPDATE.
    incident.symptomsEmbedding = embeddingArray;
    await this.incidentRepository.save(incident);

    // **THE DEFINITIVE FIX**: Manually construct the hex literal for the SELECT query.
    const buffer = Buffer.alloc(embeddingArray.length * 4);
    embeddingArray.forEach((val, index) => {
      buffer.writeFloatLE(val, index * 4);
    });
    const hexLiteral = `x'${buffer.toString('hex')}'`;

    const similarIncidents = await this.incidentRepository
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.database', 'database')
      // Directly inject the hex literal into the function call.
      // This bypasses the incorrect parameter binding.
      .addSelect(
        `VEC_DISTANCE_COSINE(incident.symptoms_embedding, ${hexLiteral})`,
        'score',
      )
      .where('incident.status = :status', { status: 'resolved' })
      .andWhere('incident.id != :id', { id: incident.id })
      // We no longer use .setParameter for the embedding.
      .orderBy('score', 'ASC')
      .limit(5)
      .getMany();

    return similarIncidents;
  }
}
