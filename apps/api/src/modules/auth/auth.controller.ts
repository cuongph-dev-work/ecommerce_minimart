import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ success: boolean; data: AuthResponseDto }> {
    const data = await this.authService.login(loginDto);
    return { success: true, data };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(): Promise<{ success: boolean; message: string }> {
    // For JWT, logout is handled client-side by removing the token
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any): Promise<{ success: boolean; data: any }> {
    const profile = await this.authService.getProfile(user.id);
    return {
      success: true,
      data: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
      },
    };
  }

  @Public()
  @Post('refresh')
  async refresh(): Promise<{ success: boolean; message: string }> {
    // TODO: Implement refresh token logic if needed
    return { success: true, message: 'Refresh token not implemented yet' };
  }
}

