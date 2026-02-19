// libs/common/src/user/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../database/schemas/user.schema'; 

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }

    async create(data: any) {
        const newUser = new this.userModel(data);
        return newUser.save();
    }

    async findByEmail(email: string) {
        return this.userModel.findOne({ email });
    }
}