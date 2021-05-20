// Uncomment these imports to begin using these cool features!


import {inject} from '@loopback/context';
import {getJsonSchemaRef, post, requestBody} from '@loopback/openapi-v3';
import {repository} from '@loopback/repository';
import {PasswordHasherBindings, TokenServiceBindings, UserBindings} from '../keys';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {JWTService} from '../services/jwt.service';
import {PasswordHasher} from '../services/password.hasher';
import {MyUserService} from '../services/user.service';
import {validate} from '../services/validator';

export interface Creds {
  email: string;
  password: string;
}


export class UserController {

  constructor(
    @repository(UserRepository) private userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) private hasher: PasswordHasher,
    @inject(UserBindings.USER_SERVICE) private userService: MyUserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE) private jwtService: JWTService

  ) { }

  @post('/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          schema: getJsonSchemaRef(User)
        }
      }
    }
  })
  async signup(@requestBody() userData: User) {
    validate(userData);
    userData.password = await this.hasher.createHash(userData.password);
    let user = await this.userRepository.create(userData);
    let returnUser = {...user}
    returnUser.password = '';
    return returnUser;
  }

  @post('/login')
  async login(@requestBody() creds: Creds) {
    validate(creds);
    const user = await this.userService.verifyCredentials(creds);
    const token = await this.jwtService.generateToken(user);
    return {token}
  }
}
