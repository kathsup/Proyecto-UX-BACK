import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { signToken } from './jwt.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const salt = await genSalt(10);
      const hashedPassword = await hash(registerDto.password, salt);
      const payload: RegisterUserDto = {
        ...registerDto,
        email: registerDto.email.toLowerCase(),
        password: hashedPassword,
        salt,
      };
      return this.authService.register(payload);
    } catch {
      throw new BadRequestException('Failed to register user');
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const hashedPassword = await hash(loginDto.password, user.salt);
    if (hashedPassword !== user.password) {
      throw new BadRequestException('Invalid password');
    }

    const token = signToken(
      { email: user.email, name: user.name, id: user.id },
      'supersecret',
      { expiresIn: '1h' },
    );

    return { message: 'Login successful', token };
  }
}
