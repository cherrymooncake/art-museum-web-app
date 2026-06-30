import {
  Controller,
  Body,
  Post,
  UseGuards,
  Request,
  Get,
  NotFoundException,
  Query,
  Param,
  Put,
  Delete,
  BadRequestException,
  Req, Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/guards/roles.decorator';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update_user.dto';
import { ChangePasswordDto } from './dto/change_password_dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('search')
  async searchUser(
    @Query('email') email?: string,
    @Query('id') id?: number): Promise<User> {
    if (email) {
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        throw new NotFoundException(`User with email "${email}" not found`);
      }
      return user;
    }
    if (id) {
      const user = await this.usersService.findOneById(Number(id));
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    }
    throw new BadRequestException('Either email or id query parameter must be provided');
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post()
  async createUser(@Body() createUserDto: UserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() updateUserDto: UserDto): Promise<User> {
    const [updatedCount, [updatedUser]] = await this.usersService.update(
      id,
      updateUserDto,
    );
    if (updatedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }


  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<string> {
    const deletedCount = await this.usersService.delete(id);
    if (deletedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return 'User successfully deleted';
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Req() req) {
    const user = await this.usersService.findOneById(req.user.id);
    const { password, ...safe } = user.get({ plain: true });
    return safe;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  async updateMe(
    @Req() req,
    @Body() dto: UpdateUserDto,
  ) {
    return await this.usersService.updateProfile(req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me/password')
  async changePassword(
    @Req() req,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(req.user.id, dto);
    return { message: 'Password updated' };
  }

}
