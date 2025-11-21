export class AuthResponseDto {
  token!: string;
  user!: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

