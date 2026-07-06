import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigifyModule } from '@itgorillaz/configify';
import { AppConfig } from 'src/lib/config';
import { PlatformAdminController } from './platform-admin.controller';
import { PlatformAdminService } from './platform-admin.service';
import { PlatformAdminGuard } from 'src/lib/guards/platform-admin.guard';

@Module({
    imports: [
        ConfigifyModule.forRootAsync(),
        JwtModule.registerAsync({
            inject: [AppConfig],
            useFactory: (config: AppConfig) => ({
                secret: config.JWT_SECRET,
                signOptions: { expiresIn: config.JWT_EXPIRES_IN },
            }),
        }),
    ],
    controllers: [PlatformAdminController],
    providers: [PlatformAdminService, PlatformAdminGuard],
})
export class PlatformAdminModule { }
