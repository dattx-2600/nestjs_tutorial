import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RegisterDto extends CreateUserDto {
    @ApiProperty({ example: '123456' })
    @IsNotEmpty()
    @MinLength(6, { message: i18nValidationMessage('validation.password_min_length') })
    password: string;
}