import { Injectable } from '@nestjs/common';
import { parse } from 'dotenv';
import * as fs from 'fs';
import { resolve } from 'path';

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    const env = process.env.NODE_ENV || 'development';
    const fileEnv = env === 'production' ? 'production' : 'development';
    const envFilePath = resolve(process.cwd(), `.env.${fileEnv}`);
    if (!fs.existsSync(envFilePath)) {
      throw new Error(`No se encontró el archivo de configuración: ${envFilePath}`);
    }

    this.envConfig = parse(fs.readFileSync(envFilePath));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
