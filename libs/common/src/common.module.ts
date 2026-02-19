// libs/common/src/common.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonService } from './common.service';
import { UsersService } from './user/users.service';
import { User, UserSchema } from './user/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [CommonService, UsersService],
  exports: [CommonService, UsersService, MongooseModule] 
})
export class CommonModule {}