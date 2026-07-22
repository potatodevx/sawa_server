import type { User } from '@prisma/client';
export declare class UserRepository {
    findByPhone(phone: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findByEntityId(coupleId: string): Promise<User[]>;
    upsertByPhone(phone: string, coupleId: string, role: 'primary' | 'partner'): Promise<User>;
    markVerified(phone: string): Promise<User>;
    saveRefreshTokenHash(userId: string, hash: string): Promise<void>;
    clearRefreshToken(userId: string): Promise<void>;
    findByIdWithRefreshToken(userId: string): Promise<User | null>;
    update(id: string, data: Partial<User>): Promise<User>;
}
export declare const userRepository: UserRepository;
//# sourceMappingURL=user.repository.d.ts.map