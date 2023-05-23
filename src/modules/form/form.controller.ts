import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Express } from 'express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { extname } from 'path';
import { FastifyFileInterceptor } from '../../interceptors/file.interceptor';
import { FormUploadDto } from './formUpload.dto';
import { fileMapper } from 'src/common/file-mapper';
import { FormService } from './form.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const editFileName = (req: Request, file: Express.Multer.File, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const xmlFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback,
) => {
  if (!file.originalname.match(/\.(xml)$/)) {
    return callback(new Error('Only XML files are allowed!'), false);
  }
  callback(null, true);
};
import { AddAdminHeaderInterceptor } from '../../interceptors/addAdminHeader.interceptor';
import { AddOwnerInfoInterceptor } from '../../interceptors/addOwnerInfo.interceptor';
import { AddResponseObjectInterceptor } from '../../interceptors/addResponseObject.interceptor';
import { AddROToResponseInterceptor } from '../../interceptors/addROToResponse.interceptor';

@Controller('form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @ApiConsumes('multipart/form-data')
  @Post('upload')
  @UseInterceptors(
    FastifyFileInterceptor('form', {
      storage: diskStorage({
        destination: './upload/single',
        filename: editFileName,
      }),
      fileFilter: xmlFileFilter,
    }),
    AddResponseObjectInterceptor, //sequencing matters here
    AddAdminHeaderInterceptor,
    AddOwnerInfoInterceptor,
    AddROToResponseInterceptor,
  )
  async single(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: FormUploadDto,
  ) {
    console.log(file, body);
    const response = await this.formService.uploadForm(file);
    fs.unlink(file.path, (err) => {
      console.log(err);
    });
    return response;
  }
}
