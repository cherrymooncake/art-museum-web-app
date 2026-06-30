import { Injectable, Inject, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { User } from './user.entity';
import { UserDto } from './dto/user.dto';
import { USER_REPOSITORY } from '../../core/constants';
import * as bcrypt from 'bcrypt';
import { Ticket } from '../tickets/ticket.entity';
import { UpdateUserDto } from './dto/update_user.dto';
import { ChangePasswordDto } from './dto/change_password_dto';

@Injectable()
export class UsersService {
    constructor(@Inject(USER_REPOSITORY) private readonly userRepository: typeof User) { }

    async create(userDto: UserDto): Promise<User> {
        try {
            // tslint:disable-next-line:no-console
            console.log('UsersService.create: Пароль до хеширования:', userDto.password);
            const hashedPassword = await bcrypt.hash(userDto.password, 10);
            // tslint:disable-next-line:no-console
            console.log('UsersService.create: Пароль после хеширования:', hashedPassword);

            const userToSave = {
                ...userDto,
                password: hashedPassword,
            };

            const createdUser = await this.userRepository.create<User>(userToSave);
            return createdUser;
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new BadRequestException('Пользователь с таким email уже существует');
            }
            // tslint:disable-next-line:no-console
            console.error('Ошибка в UsersService.create:', error);
            throw new InternalServerErrorException('Произошла ошибка при создании пользователя');
        }
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.findAll<User>();
    }

    async findOneByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne<User>({ where: { email } });
    }

    async findOneById(id: number): Promise<User> {
        return await this.userRepository.findOne<User>({ where: { id } });
    }

    async update(id: number, data: UserDto): Promise<[number, User[]]> {
        return await this.userRepository.update(data, {
            where: { id },
            returning: true,
        });
    }

    async delete(id: number): Promise<number> {
        return await this.userRepository.destroy({ where: { id } });
    }

    async updateProfile(id: number, dto: UpdateUserDto): Promise<User> {
        const [count, [updated]] = await this.userRepository.update(dto, {
            where: { id },
            returning: true,
        });
        if (!count) { throw new NotFoundException('Пользователь не найден'); }
        return this.getSafeUser(updated);
    }

    async changePassword(id: number, dto: ChangePasswordDto): Promise<void> {
        const user = await this.findOneById(id);

        const ok = await bcrypt.compare(dto.currentPassword, user.password);
        if (!ok) { throw new BadRequestException('Текущий пароль неверен'); }

        const hash = await bcrypt.hash(dto.newPassword, 10);
        await this.userRepository.update(
          { password: hash },
          { where: { id } },
        );
    }

    private getSafeUser(user: User): User {
        const { password, ...safe } = user.get({ plain: true });
        return safe as unknown as User;
    }

}
