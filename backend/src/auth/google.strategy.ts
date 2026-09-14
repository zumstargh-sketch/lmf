import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private usersService: UsersService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      scope: ['email', 'profile']
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const email = profile.emails && profile.emails[0].value;
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      // create user with googleId
      const role = await this.usersService['prisma'].role.findFirst();
      const roleId = role ? role.id : undefined;
      user = await this.usersService.createUser({ email, name: profile.displayName, googleId: profile.id, roleId });
    }
    const payload = { id: user.id, email: user.email, roleId: user.roleId };
    done(null, payload);
  }
}
