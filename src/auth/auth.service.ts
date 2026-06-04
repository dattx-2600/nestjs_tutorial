import {BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private readonly i18n: I18nService,
    ) {}

    // ĐĂNG KÝ
    async register(registerDto: RegisterDto) {
        const { email, password, name } = registerDto;

        const isEmailExist = await this.userRepository.findOneBy({ email });
        if (isEmailExist) throw new BadRequestException(this.i18n.t('auth.email_in_use'));

        // Băm mật khẩu bằng Bcrypt trước khi lưu vào DB
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = this.userRepository.create({ name, email, password: hashedPassword });
        let savedUser;
        try {
            savedUser = await this.userRepository.save(newUser);
        } catch (error) {
            throw new InternalServerErrorException(this.i18n.t('auth.register_failed'));
        }
        const userResponse = { ...savedUser };
        delete (userResponse as any).password;

        return userResponse;
    }

    // ĐĂNG NHẬP
    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Ép TypeORM phải lấy ra cột password (vì mặc định cột này bị ẩn)
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne();

        if (!user) throw new UnauthorizedException(this.i18n.t('auth.invalid_credentials'));

        // So sánh mật khẩu client gửi lên với mật khẩu băm trong MySQL
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) throw new UnauthorizedException(this.i18n.t('auth.invalid_credentials'));

        const payload = { sub: user.id, email: user.email };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: { id: user.id, name: user.name, email: user.email },
        };
    }
}