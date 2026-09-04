import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('records')
@UseGuards(JwtAuthGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  create(@Body() createRecordDto: CreateRecordDto, @CurrentUser() user: any) {
    return this.recordsService.create(createRecordDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.recordsService.findAllByUser(user.id);
  }

  @Get('habit/:habitId')
  findByHabit(@Param('habitId') habitId: string, @CurrentUser() user: any) {
    return this.recordsService.findByHabit(habitId, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recordsService.remove(id);
  }
}
