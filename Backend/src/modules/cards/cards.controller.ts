import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto } from './dto/create-card.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCardDto,
  ) {
    return this.cardsService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('sub') userId: string) {
    return this.cardsService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.cardsService.findOne(userId, id);
  }

  @Put(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.cardsService.update(userId, id, dto);
  }

  @Delete(':id')
  delete(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.cardsService.delete(userId, id);
  }

  @Get(':id/stats')
  getStats(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.cardsService.getStats(userId, id);
  }
}
