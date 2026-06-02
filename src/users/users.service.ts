import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UsersService {
  constructor(
      @InjectRepository(User)
      private userRepository: Repository<User>,
      private readonly i18n: I18nService,
  ) {}

  // Tìm chi tiết 1 User theo ID
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(this.i18n.t('user.not_found', {args: { id: id }}));
    return user;
  }

  // Cập nhật thông tin từ trang Settings
  async updateProfile(userId: number, updateData: { name?: string; email?: string }) {
    const user = await this.findOne(userId); // Hàm findOne cũ đã có sẵn

    if (updateData.name) user.name = updateData.name;
    if (updateData.email) user.email = updateData.email;

    return await this.userRepository.save(user);
  }
}