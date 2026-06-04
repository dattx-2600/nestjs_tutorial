import { Expose, Transform } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  constructor(partial: Partial<any>) {
    Object.assign(this, partial);
  }
}