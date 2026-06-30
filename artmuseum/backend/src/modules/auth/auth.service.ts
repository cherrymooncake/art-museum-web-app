import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
    ) { }


        async validateUser(username: string, pass: string) {
        const user = await this.userService.findOneByEmail(username);
        // tslint:disable-next-line:no-console
        console.log('[validateUser] Ищу пользователя по email:', username);
        // tslint:disable-next-line:no-console
        console.log('[validateUser] Найден:', user);
        if (!user) {
            return null;
        }
        const match = await this.comparePassword(pass, user.password);
        // tslint:disable-next-line:no-console
        console.log('[validateUser] Введённый пароль для сравнения (в кавычках): "' + pass + '"');
        // tslint:disable-next-line:no-console
        console.log('[validateUser] Длина введённого пароля для сравнения:', pass.length);
        // tslint:disable-next-line:no-console
        console.log('[validateUser] Хеш из БД для сравнения:', user.password);
        // tslint:disable-next-line:no-console
        console.log('[validateUser] Совпадает ли:', match);

        if (!match) {
            return null;
        }

        // tslint:disable-next-line: no-string-literal
        const { password, ...result } = user['dataValues'];
        return result;
    }

    public async login(user) {
        const token = await this.generateToken(user);
        return { user, token };
    }

    public async create(user) {
        // tslint:disable-next-line:no-console
        console.log('AuthService.create: Пароль, полученный для создания:', user.password);

        const newUserFromDb = await this.userService.create({
            ...user,
            role: user.role || 'visitor',
        });

        const { password, ...result } = newUserFromDb.get({ plain: true });

        const token = await this.generateToken(result);
        return { user: result, token };
    }

    private async generateToken(user) {
        const token = await this.jwtService.signAsync(user);
        return token;
    }

    private async comparePassword(enteredPassword, dbPassword) {
        const match = await bcrypt.compare(enteredPassword, dbPassword);
        return match;
    }
}
