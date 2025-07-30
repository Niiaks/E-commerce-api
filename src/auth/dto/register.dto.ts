import { Exclude } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(3, { message: 'name must be three or more characters' })
  @IsNotEmpty()
  @IsString({ message: 'character expected' })
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsStrongPassword(
    {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    },
    {
      message: (args) => {
        if (args.value.length < 8) {
          return 'Password must be at least 8 characters long';
        }
        if (!/[A-Z]/.test(args.value)) {
          return 'Password must contain at least one uppercase letter';
        }
        if (!/[0-9]/.test(args.value)) {
          return 'Password must contain at least one number';
        }
        if (!/[^A-Za-z0-9]/.test(args.value)) {
          return 'Password must contain at least one symbol';
        }
        return 'Password is too weak';
      },
    },
  )
  password: string;

  @IsBoolean()
  isAdmin: boolean;
}
