import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Metadata, status } from '@grpc/grpc-js';

interface UserService {
  GetUserById(data: { id: string }): Observable<any>; // ✅ Accept metadata
}

@Injectable()
export class UsersService implements OnModuleInit {
  private userService: UserService;

  constructor(@Inject('USER_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserService>('UserService');
  }

  async getUser(id: string) {
    try {
      const user = await firstValueFrom(
        this.userService.GetUserById({ id })
      );
      return user;
    } catch (err) {
      switch (err.code) {
        case status.NOT_FOUND:
          throw new NotFoundException(err.details || `User with ID ${id} not found`);

        case status.UNAUTHENTICATED:
          throw new UnauthorizedException(err.details || 'Unauthorized access');

        case status.INVALID_ARGUMENT:
          throw new BadRequestException(err.details || 'Invalid input');

        default:
          throw new InternalServerErrorException(err.details || 'Something went wrong');
      }
    }
  }
}
