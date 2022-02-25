import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(authDto: AuthDto) {
    // generate thes password hash
    const hash = await argon.hash(authDto.password);
    // save the new user in the db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: authDto.email,
          hash,
        },
      });
      delete user.hash;
      // return the saved user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signin() {
    return { msg: 'signin' };
  }
}
