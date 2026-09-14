import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.validatePassword(email, pass);
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user as any;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, roleId: user.roleId };
    return {
      access_token: this.jwtService.sign(payload),
      user: this.toProfile(user)
    };
  }

  /** Strips sensitive fields before sending a user to clients. */
  toProfile(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...profile } = user as any;
    return profile;
  }
}
