import { Module } from '@nestjs/common';
import { ClientsModule, Transport, ClientProviderOptions } from '@nestjs/microservices';
import { join } from 'path';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthsController } from './auths.controller';
import { AuthsService } from './auths.service';
import { credentials } from '@grpc/grpc-js';
import * as fs from 'fs';

const certDir = join(__dirname, '../../cert');

const userServiceOptions: ClientProviderOptions = {
  name: 'USER_SERVICE',
  transport: Transport.GRPC,
  options: {
    package: 'user',
    protoPath: join(__dirname, '../../shared-proto-files/proto/user.proto'),
    url: 'localhost:50051',
    credentials: credentials.createSsl(
      fs.readFileSync(join(certDir, 'ca.crt')),                 // Trust server
      fs.readFileSync(join(certDir, 'server.key')),       // Client private key
      fs.readFileSync(join(certDir, 'server.crt')),       // Client certificate
    ),
  },
};

@Module({
  imports: [
    ClientsModule.register([
      userServiceOptions,
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
