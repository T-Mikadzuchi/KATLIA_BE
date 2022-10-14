import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto/auth.dto';
import { PrismaService } from './../prisma/prisma.service';
import { ForbiddenException, Injectable } from "@nestjs/common";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';

@Injectable({})
export class AuthService{
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) {}
    async signup(dto: AuthDto) {
        try {
            //generate password hash
            const hash = await argon.hash(dto.password)
            //save new user in db
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hash,
                }
            })
            delete user.password
            return this.signToken(user.id, user.email)
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException(
                        'Credentials taken'
                    )
                }
            }
        }
        
    }

    async signin(dto: AuthDto) {
        //find user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        //if user not exist throw
        if (!user) {
            throw new ForbiddenException(
                "User's not exist"
            )
        }
        //compare password
        const pwMatches = await argon.verify(user.password, dto.password)
        //if password incorrect throw
        if (!pwMatches) 
            throw new ForbiddenException(
                'Password incorrect'
            )
        //send back user
        delete user.password
        return this.signToken(user.id, user.email)
    }

    async signToken(
        userId: string,
        email: string
    ) {
        const payload = {
            sub: userId,
            email
        }
        const secret = this.config.get('JWT_SECRET')

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '30m',
            secret: secret
        })
        return {
            access_token: token
        }
    }

}