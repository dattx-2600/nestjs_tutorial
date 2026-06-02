import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'Nguyen Van A' })
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @IsString()
    @MinLength(3, { message: 'Tên phải từ 3 ký tự trở lên' })
    name: string;

    @ApiProperty({ example: 'vanna@gmail.com' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email: string;
}
