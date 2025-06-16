import { status } from "@grpc/grpc-js";
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { firstValueFrom, Observable } from "rxjs";

interface AuthService {
  login(data: { email: string; password: string }): Observable<{ token: string }>;
  validateToken(data: { token: string }): Observable<{ isValid: boolean }>;
}

@Injectable()
export class AuthsService implements OnModuleInit {
  private authService: AuthService;

  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  async login(email: string, password: string) {
    try {
      console.log(`Attempting to log in user: ${email}`);
      return await firstValueFrom(this.authService.login({ email, password }));
    } catch (err) {
      console.error('Login error:', err);
      switch (err.code) {
        case status.NOT_FOUND:
          throw new NotFoundException(err.details || 'User not found');
        case status.UNAUTHENTICATED:
          throw new UnauthorizedException(err.details || 'Invalid credentials');
        case status.INVALID_ARGUMENT:
          throw new BadRequestException(err.details || 'Invalid input');
        default:
          throw new InternalServerErrorException(err.details || 'Unexpected error');
      }
    }
  }

  async validateToken(token: string){
    try {
      
        console.log(`Validating token: ${token}`);
        const response = await firstValueFrom(this.authService.validateToken({ token }));
        return response.isValid;
    } catch (err) {
      console.error('Token validation error:', err);
      switch (err.code) {
        case status.UNAUTHENTICATED:
          throw new UnauthorizedException(err.details || 'Invalid token');
        case status.INVALID_ARGUMENT:
          throw new BadRequestException(err.details || 'Invalid token format');
        default:
          throw new InternalServerErrorException(err.details || 'Unexpected error during token validation');
      }
    }
  }
}
