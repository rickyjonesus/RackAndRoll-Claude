import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'player@example.com' })
  email!: string;

  @ApiProperty({ example: 'hunter2', minLength: 8 })
  password!: string;

  @ApiProperty({ example: 'CueBall99' })
  displayName!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'player@example.com' })
  email!: string;

  @ApiProperty({ example: 'hunter2' })
  password!: string;
}

export class TokenResponseDto {
  @ApiProperty()
  accessToken!: string;
}
