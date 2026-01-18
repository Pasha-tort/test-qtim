import { Global, Module } from '@nestjs/common';
import { AtStrategy, RtStrategy } from './strategies';

@Global()
@Module({
  providers: [AtStrategy, RtStrategy],
  exports: [AtStrategy, RtStrategy],
})
export class GuardsModule {}
