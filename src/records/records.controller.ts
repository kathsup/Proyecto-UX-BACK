import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { UpsertRecordDto } from './dto/upsert-record.dto';
import { RangeQueryDto } from './dto/range-query.dto';
import { ProgressQueryDto } from './dto/progress-query.dto';
import { MatrixQueryDto } from './dto/matrix-query.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('records')
@UseGuards(JwtAuthGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Put()
  upsert(@Body() dto: UpsertRecordDto, @CurrentUser() user: any) {
    return this.recordsService.upsert(dto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.recordsService.findAllByUser(user.id);
  }

  @Get('matrix')
  getMatrix(@Query() query: MatrixQueryDto, @CurrentUser() user: any) {
    return this.recordsService.getMatrix(user.id, query);
  }

  @Get('habit/:habitId')
  findByHabit(
    @Param('habitId') habitId: string,
    @Query() query: RangeQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.recordsService.findByHabit(habitId, user.id, query);
  }

  @Get('habit/:habitId/progress')
  getProgress(
    @Param('habitId') habitId: string,
    @Query() query: ProgressQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.recordsService.getProgress(habitId, user.id, query);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.recordsService.remove(id, user.id);
  }
}
