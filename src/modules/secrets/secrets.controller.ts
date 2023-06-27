import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AddAdminHeaderInterceptor } from '../../interceptors/addAdminHeader.interceptor';
import { AddOwnerInfoInterceptor } from '../../interceptors/addOwnerInfo.interceptor';
import { AddResponseObjectInterceptor } from '../../interceptors/addResponseObject.interceptor';
import { AddROToResponseInterceptor } from '../../interceptors/addROToResponse.interceptor';
import { SecretDTO } from './secret.dto';
import { SecretsService } from './secrets.service';
import { getSecretType } from './types';

@UseInterceptors(
  AddResponseObjectInterceptor,
  AddAdminHeaderInterceptor,
  AddOwnerInfoInterceptor,
  AddROToResponseInterceptor,
)
@Controller('secret')
export class SecretsController {
  constructor(private readonly secretService: SecretsService) {}

  @Post()
  async create(@Body() secretDTO: SecretDTO): Promise<any> {
    if (secretDTO.type === getSecretType(secretDTO.secretBody)) {
      await this.secretService.setSecret(
        secretDTO.ownerId + '/' + secretDTO.variableName,
        secretDTO.secretBody,
      );
    } else {
      throw new Error(
        'Type of the secret is not correct ' +
          getSecretType(secretDTO.secretBody) +
          ' detected',
      );
    }
  }

  @Get(':variableName')
  async findOne(
    @Param('variableName') variableName: string,
    @Body() body: any,
  ): Promise<any> {
    try {
      if (variableName) {
        const data = await this.secretService.getSecretByPath(
          body.ownerId + '/' + variableName,
        );
        return { [`${variableName}`]: data };
      } else {
        return this.secretService.getAllSecrets(body.ownerId);
      }
    } catch (e) {
      return {
        status: 404,
      };
    }
  }

  @Delete(':variableName')
  async deleteAll(
    @Param('variableName') variableName: string,
    @Body() body: any,
  ): Promise<any> {
    if (variableName) {
      return this.secretService.deleteSecret(body.ownerId + '/' + variableName);
    } else {
      return this.secretService.deleteAllSecrets(body.ownerId);
    }
  }
}
