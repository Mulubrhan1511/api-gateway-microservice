import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthsController } from './auths.controller';
import { AuthsService } from './auths.service';


@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../../shared-proto-files/proto/user.proto'),
          url: 'localhost:50051',
        },
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, '../../shared-proto-files/proto/auth.proto'),
          url: 'localhost:50052',
        },
      },
    ]),
  ],
  controllers: [UsersController, AuthsController],
  providers: [UsersService, AuthsService],
})
export class AppModule {}
