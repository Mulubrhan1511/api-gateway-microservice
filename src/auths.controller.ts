import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthsService } from './auths.service';

@Controller('auths')
export class AuthsController {
    constructor(private readonly authsService: AuthsService) {}
    
    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        const { email, password } = body;
        return this.authsService.login(email, password);
    }
    
    @Get('validate/:token')
    async validateToken(@Param('token') token: string) {
        return this.authsService.validateToken(token);
    }
    }