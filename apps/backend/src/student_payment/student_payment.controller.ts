import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { StudentPaymentService } from './student_payment.service';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';
import { LatestPaymentsQueryDto, StudentPaymentDto, UpdatePaymentDto } from './dto/student_payment.dto';
import { RolesGuard } from 'src/lib/guards/roles.guard';
import { Roles } from 'src/lib/shared/decorators/roles';

@Controller('student-payment')
export class StudentPaymentController {
  constructor(private readonly studentPaymentService: StudentPaymentService) { }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Get('all')
  async getAllPayments(@Query() query: PaginationDto) {
    return this.studentPaymentService.getAllPayments(query);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Get('latest-per-student')
  async getLatestPaymentsPerStudent(@Query() query: LatestPaymentsQueryDto) {
    return this.studentPaymentService.getLatestPaymentsPerStudent(query);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Get("payment-by-id/:paymentId")
  async getPaymentById(@Param('paymentId') paymentId: string) {
    return this.studentPaymentService.getPaymentById(paymentId)
  }

  @Get("student-payments/:studentId")
  async getStudentPayments(@Query() query: PaginationDto, @Param("studentId") studentId: string) {
    return this.studentPaymentService.getStudentPayments(studentId, query);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Get("group-payments/:groupId")
  async getGroupPayments(@Query() query: PaginationDto, @Param("groupId") groupId: string) {
    return this.studentPaymentService.getGroupPayments(groupId, query);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Put("update-payment/:paymentId")
  async updatePayment(@Param("paymentId") paymentId: string, @Body() dto: UpdatePaymentDto) {
    return this.studentPaymentService.updatePayment(dto, paymentId)
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Delete("delete-payment/:paymentId")
  async deletePaymentById(@Param("paymentId") paymentId: string) {
    return this.studentPaymentService.deletePaymentById(paymentId)
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Post("create-payment/:studentId/:groupId")
  async createPayment(@Param("studentId") studentId: string, @Param("groupId") groupId: string, @Body() dto: StudentPaymentDto) {
    return this.studentPaymentService.createPayment(dto, studentId, groupId)
  }
}
