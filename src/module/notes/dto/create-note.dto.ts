import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({
    example: 'Meeting Notes',
    description: 'Title of the note',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    example: 'Discuss project architecture and MongoDB indexing strategy.',
    description: 'Content of the note',
  })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}
