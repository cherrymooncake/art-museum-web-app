import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { USER_REPOSITORY } from '../../core/constants';

import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

@Injectable()
export class DefaultDataService implements OnApplicationBootstrap {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: typeof User,
  ) {}

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async onApplicationBootstrap() {
    // tslint:disable-next-line:no-console
    console.log('проверка существования админа');
    const adminCheck = await this.userRepository.findOne({where: {role: 'admin'}});
    // tslint:disable-next-line:no-console
    console.log(adminCheck);

    if (!adminCheck) {

      const adminFile = path.join(__dirname, '..', '..', '..', 'src', 'seed', 'admins.json');

      // tslint:disable-next-line:no-console
      console.log('путь ', path);
      const adminData = JSON.parse(fs.readFileSync(adminFile, 'utf-8'));

      for (const admin of adminData) {
        const pass = await this.hashPassword(admin.password);

        const a = {
          name: admin.name,
          email: admin.email,
          password: pass,
          gender: admin.gender,
          role: admin.role,
        };

        // tslint:disable-next-line:no-console
        console.log('админ ', admin);
        await this.userRepository.create(a as User);
      }
      // tslint:disable-next-line:no-console
      console.log('admins');
    }

  }
}
