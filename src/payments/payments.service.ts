import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfigService } from '@nestjs/config';
import { Paystack } from 'paystack-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { DataSource, Repository } from 'typeorm';
import { PaymentStatus } from './entities/payment.entity';
import { Order, OrderStatus } from 'src/orders/entities/order.entity';

const { COMPLETED, FAILED } = PaymentStatus;
const { PLACED } = OrderStatus;
@Injectable()
export class PaymentsService {
  private paystack: Paystack;
  constructor(
    private configService: ConfigService,
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    private dataSource: DataSource,
  ) {
    this.paystack = new Paystack(
      this.configService.get<string>('PAYSTACK_SECRET_KEY')!,
    );
  }

  private async pay(paymentDetails: CreatePaymentDto) {
    const { amount, email, userId, orderId } = paymentDetails;
    const payment = await this.paystack.transaction.initialize({
      amount,
      email,
      reference: `ODR-${Date.now()}`,
      callback_url: `${this.configService.get<string>(`API_URL`)}/success`,
      metadata: {
        userId,
        orderId,
      },
    });
    return {
      paymentUrl: payment.data?.authorization_url,
      reference: payment.data?.reference,
      payment_message: payment.message,
      payment_status: payment.status,
    };
  }
  private async verify(ref: string) {
    return await this.paystack.transaction.verify(ref);
  }
  async makePayment(paymentDetails: CreatePaymentDto) {
    return await this.pay(paymentDetails);
  }

  async verifyPayment(ref: string) {
    const response = await this.verify(ref);
    if (response.status === false) {
      throw new InternalServerErrorException('payment verification failed');
    }
    return await this.dataSource.transaction(async (entityManager) => {
      const foundOrder = await entityManager.findOne(Order, {
        where: {
          orderId: response.data?.metadata.orderId as string,
        },
      });
      if (!foundOrder) {
        throw new NotFoundException('Order not found');
      }
      //create payment and update fields
      const payment = entityManager.create(Payment, {
        //divide amount by 100 to get original amount -- convert back to cedis
        amount: response.data?.amount! / 100,
        reference: response.data?.reference,
        status: response.status === false ? FAILED : COMPLETED,
        order: foundOrder,
      });
      if (!payment) {
        throw new InternalServerErrorException('payment failed');
      }
      await entityManager.save(Payment, payment);
      const foundPayment = await entityManager.findOne(Payment, {
        where: {
          paymentId: payment.paymentId,
        },
        relations: ['order'],
      });
      //update order status to placed
      await entityManager.update(
        Order,
        {
          orderId: foundPayment?.order.orderId,
        },
        { status: PLACED },
      );
      return {
        message: 'order placed successfully',
        timeStamp: new Date().toISOString(),
      };
    });
  }

  async findAll() {
    return (await this.paymentRepository.find({})).sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }

  findOne(id: string) {
    return this.paymentRepository.findOne({
      where: {
        paymentId: id,
      },
    });
  }

  // update(id: number, updatePaymentDto: UpdatePaymentDto) {
  //   return `This action updates a #${id} payment`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} payment`;
  // }
}
