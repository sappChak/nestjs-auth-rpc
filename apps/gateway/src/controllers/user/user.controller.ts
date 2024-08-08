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
  Delete,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/shared/guards/jwt.auth.guard';
import { USER_SERVICE } from '@app/shared/constants/constants';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { UpdateUserDto } from '../../dtos/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  public constructor(
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users found' })
  public async getAllUsers() {
    return this.userClient.send({ cmd: 'get-all-users' }, {});
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User found' })
  public async getUserById(@Param('id') id: string) {
    return this.userClient.send({ cmd: 'get-user-by-id' }, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  public async createUser(@Body() user: CreateUserDto) {
    return this.userClient.send({ cmd: 'create-user' }, user);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: UpdateUserDto })
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
  })
  public async updateUser(
    @Param('id') id: string,
    @Body() user: UpdateUserDto,
  ) {
    return this.userClient.send({ cmd: 'update-user' }, { id, ...user });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  public async deleteUser(@Param('id') id: string) {
    return this.userClient.send({ cmd: 'delete-user' }, id);
  }
}
