import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Body,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '@app/shared/guards/jwt.auth.guard';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { USER_SERVICE } from '@app/shared/constants/constants';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  public constructor(
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
  ) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users found' })
  public async getAllUsers() {
    return this.userClient.send({ cmd: 'get-all-users' }, {});
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'User found' })
  public async getUserById(@Param('id') id: string) {
    return this.userClient.send({ cmd: 'get-user-by-id' }, id);
  }

  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  public async createUser(@Body() user: CreateUserDto) {
    return this.userClient.send({ cmd: 'create-user' }, user);
  }

  @Put(':id')
  @ApiBody({ type: UpdateUserDto })
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  public async updateUser(
    @Param('id') id: string,
    @Body() user: UpdateUserDto,
  ) {
    return this.userClient.send({ cmd: 'update-user' }, { id, ...user });
  }
}
