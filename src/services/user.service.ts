import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {Creds} from '../controllers';
import {PasswordHasherBindings} from '../keys';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {PasswordHasher} from './password.hasher';


export class MyUserService implements UserService<User, Creds>{


  constructor(
    @repository(UserRepository)
    private userRepo: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    private hasherService: PasswordHasher
  ) {
    console.log("User service called");

  }

  async verifyCredentials(credentials: Creds): Promise<User> {
    console.log("Coming into this function")
    const foundUser = await this.userRepo.findOne({
      where: {
        email: credentials.email
      }
    });

    if (!foundUser) {
      throw new HttpErrors.NotFound("User not found");
    }

    const matched = await this.hasherService.comparePassword(credentials.password, foundUser.password);
    if (!matched) {
      throw new HttpErrors.Unauthorized("Incorrect password");
    }
    return foundUser
  }

  convertToUserProfile(user: User): UserProfile {
    throw new Error('Method not implemented.');
  }

}
