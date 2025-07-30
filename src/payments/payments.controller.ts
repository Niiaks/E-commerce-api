import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { RolesGuard } from 'src/auth/guard/roleGuard';
import { Role } from 'src/users/entities/user.entity';
import { AuthGuard } from 'src/auth/guard/HybridGuard';
import { Payment } from './entities/payment.entity';

const { ADMIN } = Role;

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  verifyPayment(@Query('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Get()
  @UseGuards(AuthGuard, new RolesGuard(ADMIN))
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard, new RolesGuard(ADMIN))
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
  //   return this.paymentsService.update(+id, updatePaymentDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.paymentsService.remove(+id);
  // }
}
