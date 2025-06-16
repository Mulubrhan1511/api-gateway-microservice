import { Controller, Get, Headers, Param, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthsService } from './auths.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authsService: AuthsService, // ✅ Inject AuthService
  ) {}

  @Get(':id')
  async getUser(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }
    const token = authHeader.split(' ')[1];
    // ✅ Validate token using AuthService
    const isValid = await this.authsService.validateToken(token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }

    // ✅ Then forward to UserService
    return this.usersService.getUser(id);
  }

}
