import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'Introduction to MongoDB Indexing',
    description: 'Title of the post',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    example: 'Indexing improves query execution speed dramatically...',
    description: 'Body content of the post',
  })
  @IsString()
  @IsNotEmpty({ message: 'Body content is required' })
  body: string;
}
