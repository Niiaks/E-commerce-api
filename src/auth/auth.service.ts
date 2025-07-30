import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from 'src/cache/cache.service';
import {
  CACHE_KEYS,
  CACHE_TTL,
  TIME_T0_EXPIRE_MS,
} from 'src/cache/cache.constants';
const { REFRESH_TOKEN } = CACHE_KEYS;
const { VERY_VERY_LONG } = CACHE_TTL;
// const TIME_TO_EXPIRE_MS = ;
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private cacheService: CacheService,
    private jwtService: JwtService,
  ) {}

  async signup(registerDto: RegisterDto) {
    const { isAdmin = false } = registerDto;
    const user = await this.userRepository.findOne({
      where: {
        email: registerDto.email,
      },
    });
    //test idempotency -- comment next line
    if (user) throw new ConflictException('user already exists');
    const hashPassword = await bcrypt.hash(registerDto.password, 10);
    const response = await this.userRepository.save({
      email: registerDto.email,
      password: hashPassword,
      address: registerDto.address,
      name: registerDto.name,
      isAdmin,
    });
    return {
      message: 'user registered successfully',
      ...response,
      password: undefined,
    };
  }
  async signin(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: loginDto.email,
      },
    });
    if (!user) {
      throw new UnauthorizedException('invalid credentials');
    }
    const isPasswordMatch = await bcrypt.compare(
      loginDto.password ? loginDto.password : '',
      user.password,
    );
    if (!isPasswordMatch)
      throw new UnauthorizedException('invalid credentials');
    const { password, address, ...userWithoutPassword } = user;
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.storeRefreshToken(user.userId);
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        userId: id,
      },
      select: {
        role: true,
        userId: true,
        email: true,
        name: true,
      },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.cacheService.del(REFRESH_TOKEN(refreshToken));
  }

  async refreshAccessToken(refreshToken: string) {
    const userId = await this.validateRefreshToken(refreshToken);
    // console.log(userId);

    if (!userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Delete the current refresh token
    await this.cacheService.del(REFRESH_TOKEN(refreshToken));

    // Generate and store a new refresh token
    const newRefreshToken = await this.storeRefreshToken(userId);

    const user = await this.findOne(userId);
    const newAccessToken = this.generateAccessToken(user);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  private generateAccessToken(user: User) {
    return this.jwtService.sign(
      {
        sub: user.userId,
        role: user.role,
      },
      {
        expiresIn: '15m',
      },
    );
  }

  private generateRefreshToken() {
    return randomBytes(64).toString('hex');
  }

  private async storeRefreshToken(userId: string): Promise<string> {
    const refreshToken = this.generateRefreshToken();

    await this.cacheService.set(
      REFRESH_TOKEN(refreshToken),
      {
        userId,
        expiresAt: Date.now() + TIME_T0_EXPIRE_MS,
      },
      {
        ttl: VERY_VERY_LONG,
      },
    );

    return refreshToken;
  }

  private async validateRefreshToken(refreshToken: string) {
    const tokenData = await this.cacheService.get<{
      userId: string;
      expiresAt: number;
    }>(REFRESH_TOKEN(refreshToken));

    if (!tokenData || tokenData.expiresAt < Date.now()) {
      console.log('token invalid');
      return null;
    }
    return tokenData.userId;
  }
}
