import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { createTestingModule, mockUser } from '../../../test/setup';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module = await createTestingModule(
      [AuthController],
      [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    );

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      const signupDto = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      };

      const expectedResponse = {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.signUp.mockResolvedValue(expectedResponse);

      const result = await authController.signUp(signupDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.signUp).toHaveBeenCalledWith(signupDto);
    });

    it('should throw ConflictException if user already exists', async () => {
      const signupDto = {
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Existing User',
      };

      mockAuthService.signUp.mockRejectedValue(
        new ConflictException('El email ya está registrado'),
      );

      await expect(authController.signUp(signupDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('signIn', () => {
    it('should authenticate user successfully', async () => {
      const signinDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.signIn.mockResolvedValue(expectedResponse);

      const result = await authController.signIn(signinDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(signinDto);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const signinDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      mockAuthService.signIn.mockRejectedValue(
        new UnauthorizedException('Credenciales inválidas'),
      );

      await expect(authController.signIn(signinDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const userId = mockUser.id;

      const expectedResponse = {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
        },
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(expectedResponse);

      const result = await authController.refresh(userId);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(userId);
    });

    it('should throw UnauthorizedException for invalid user', async () => {
      const userId = 'invalid-user-id';

      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Usuario no válido'),
      );

      await expect(authController.refresh(userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getMe', () => {
    it('should return user profile', async () => {
      const user = {
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        currency: mockUser.currency,
        locale: mockUser.locale,
      };

      const result = await authController.getMe(user);

      expect(result).toEqual(user);
    });
  });
});
