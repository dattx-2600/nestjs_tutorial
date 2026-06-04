import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'Nguyen Van B' })
    @IsOptional()
    @IsString()
    @MinLength(3)
    name?: string;

    @ApiPropertyOptional({ example: 'vanb@gmail.com' })
    @IsOptional()
    @IsEmail()
    email?: string;
}