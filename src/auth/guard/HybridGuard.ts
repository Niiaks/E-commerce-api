import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { User } from 'src/users/entities/user.entity';
config();

declare global {
  namespace Express {
    interface Request {
      user?: Partial<User>;
    }
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (auth) {
      try {
        const token = auth.split(' ')[1];
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.user = {
          userId: typeof decoded['sub'] === 'string' ? decoded['sub'] : '',
          role: decoded['role'],
        };
        return true;
      } catch (error) {
        throw new UnauthorizedException('unauthorized');
        // return false;
      }
    }
    throw new UnauthorizedException('unauthorized');
  }
}
