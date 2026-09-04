import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('habits')
@UseGuards(JwtAuthGuard) // protege TODAS las rutas de este controller
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  create(@Body() createHabitDto: CreateHabitDto, @CurrentUser() user: any) {
    return this.habitsService.create(createHabitDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.habitsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.habitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHabitDto: UpdateHabitDto) {
    return this.habitsService.update(id, updateHabitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.habitsService.remove(id);
  }
}
