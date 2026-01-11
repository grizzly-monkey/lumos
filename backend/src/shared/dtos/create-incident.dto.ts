import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  issueType: string;

  @IsEnum(['low', 'medium', 'high', 'critical'])
  severity: string;

  @IsString()
  @IsNotEmpty()
  symptoms: string;
}
