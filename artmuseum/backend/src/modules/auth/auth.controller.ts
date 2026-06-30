import { Controller, Body, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { SignupDto } from '../users/dto/signup.dto';
import { DoesUserExist } from '../../core/guards/doesUserExist.guard';
import {UserDto} from '../../modules/users/dto/user.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        // tslint:disable-next-line:no-console
        console.log('КОНТРОЛЛЕР LOGIN: req.user:', JSON.stringify(req.user));
        return await this.authService.login(req.user);
    }

    @UseGuards(DoesUserExist)
    @Post('signup')
    async signUp(@Body() user: SignupDto) {
        // tslint:disable-next-line:no-console
        console.log('КОНТРОЛЛЕР SIGNUP: Получен user DTO:', JSON.stringify(user));
        // tslint:disable-next-line:no-console
        console.log('КОНТРОЛЛЕР SIGNUP: Пароль из DTO (в кавычках): "' + user.password + '"');
        // tslint:disable-next-line:no-console
        console.log('КОНТРОЛЛЕР SIGNUP: Длина пароля из DTO:', user.password.length);
        // tslint:disable-next-line:no-console
        console.log('КОНТРОЛЛЕР SIGNUP: Email из DTO (в кавычках): "' + user.email + '"');
        const fullUser = { ...user, role: 'visitor' };
        return await this.authService.create(fullUser);
    }
}
