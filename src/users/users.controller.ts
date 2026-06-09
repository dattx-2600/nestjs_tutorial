import { Controller, Get, Body, Patch, UseGuards, Req, Param, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard'; // Import AuthGuard
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users CRUD')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. API Lấy thông tin người dùng hiện tại để hiển thị lên trang Settings
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findOne(req.user.sub);

    return new UserResponseDto(user);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);

    return new UserResponseDto(user);
  }

  // 2. API Nhận dữ liệu nhấn nút "Lưu" từ trang Settings để cập nhật DB
  @Patch('profile')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  updateProfile(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.sub, updateUserDto);
  }
}