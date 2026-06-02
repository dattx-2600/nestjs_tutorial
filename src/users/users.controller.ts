import { Controller, Get, Body, Patch, UseGuards, Req, Param, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard'; // Import AuthGuard
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users CRUD')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. API Lấy thông tin người dùng hiện tại để hiển thị lên trang Settings
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  getProfile(@Req() req: any) {
    return this.usersService.findOne(req.user.sub);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // 2. API Nhận dữ liệu nhấn nút "Lưu" từ trang Settings để cập nhật DB
  @Patch('profile')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  updateProfile(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.sub, updateUserDto);
  }
}