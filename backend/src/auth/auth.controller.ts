import { BadRequestException, Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class RegisterDto {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  /** Donor sign-up: creates the account and returns a session token immediately. */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required.');
    }
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new UnauthorizedException('An account with this email already exists. Please sign in instead.');
    }
    const donorRole = await this.usersService.ensureRole('donor');
    const user = await this.usersService.createUser({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      phone: dto.phone,
      roleId: donorRole?.id
    });
    return this.authService.login(user);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const valid = await this.authService.validateUser(dto.email, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    return this.authService.login(valid);
  }

  /** Profile of the signed-in donor; used by the app to restore saved sessions. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    const payload = (req as Request & { user: any }).user;
    const user = await this.usersService.findById(payload?.sub);
    if (!user) {
      throw new UnauthorizedException('Account not found.');
    }
    return this.authService.toProfile(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // Successful authentication, issue JWT and redirect to app with token
    const user = (req as Request & { user: any }).user;
    const token = await this.authService.login(user);
    // In production, redirect to app deep link or return token in JSON
    res.json(token);
  }
}