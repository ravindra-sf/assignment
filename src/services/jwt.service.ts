import {inject} from '@loopback/context';
import {TokenServiceBindings} from '../keys';
import {User} from '../models';
const jwt = require('jsonwebtoken');


export class JWTService {

  @inject(TokenServiceBindings.TOKEN_SECRET)
  private readonly secret: string;

  @inject(TokenServiceBindings.TOKEN_EXPIRE_IN)
  private readonly expireIn: string;

  async generateToken(user: User | any): Promise<string> {
    const token = jwt.sign({id: user.id, name: user.name}, this.secret, {expiresIn: this.expireIn});
    return token;
  }
}
