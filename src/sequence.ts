import {AuthenticateFn, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {FindRoute, InvokeMethod, ParseParams, Reject, RequestContext, Send, SequenceActions, SequenceHandler} from '@loopback/rest';
import {LoggerBindings} from './keys';
import {ILogger} from './providers/logger.provider';

export class MySequence implements SequenceHandler {

  constructor(@inject(LoggerBindings.LOGGER) private logger: ILogger,
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS)
    protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD)
    protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(AuthenticationBindings.AUTH_ACTION)
    private authenticate: AuthenticateFn
  ) {
  }
  async handle(context: RequestContext): Promise<void> {
    try {
      const {request, response} = context;
      this.logger.logInfo(`Request ${request.method} ${request.url
        } started at ${Date.now().toString()}.
      Request Details
      Referer = ${request.headers.referer}
      User-Agent = ${request.headers['user-agent']}`)

      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      await this.authenticate(request);
      const result = await this.invoke(route, args);
      this.send(response, result);
      this.logger.logInfo(`Request end time:- ${new Date().toISOString()}`)
    } catch (e) {
      this.logger.logError(JSON.stringify(e));
      this.reject(context, e);
    }
  }


}
