import { IsNotEmpty, IsString } from 'class-validator';

export class EntryTestDto {
  @IsNotEmpty()
  @IsString()
  readonly question: string;

  @IsNotEmpty()
  @IsString()
  readonly correctAnswer: string;

  @IsNotEmpty()
  @IsString({ each: true })
  options: string[];

  @IsString()
  userAnswer?: string;
}
