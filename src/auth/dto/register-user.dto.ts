import { RegisterDto } from './register.dto';

export type RegisterUserDto = RegisterDto & {
  salt: string;
};
