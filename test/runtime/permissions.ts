// ## { COMPILED__WRITE_COMPILED_HERE } ## \\

/**
 * - этот файл автоматически сгенерирован compiler
 * - если вы нашли несоответствия: https://github.com/FOCKUSTY/bit-field/issues
 */
export const permissions = {
  user: {
    /** @value 1 */ userView: 1n << 0n,
    /** @value 2 */ userCreate: 1n << 1n,
    /** @value 4 */ userEdit: 1n << 2n,
    /** @value 8 */ userDelete: 1n << 3n
  } as const,

  content: {
    /** @value 16 */ contentView: 1n << 4n,
    /** @value 32 */ contentPublish: 1n << 5n,
    /** @value 64 */ contentArchive: 1n << 6n,
    /** @value 128 */ contentDelete: 1n << 7n
  } as const,

  admin: {
    /** @value 256 */ adminViewLogs: 1n << 8n,
    /** @value 512 */ adminManageRoles: 1n << 9n,
    /** @value 1024 */ adminSystemSettings: 1n << 10n
  } as const
} as const;
// ## { COMPILED__WRITE_COMPILED_HERE } ## \\
// ## { COMPILED__WRITE_VALUES_HERE } ## \\

// ## { COMPILED__WRITE_VALUES_HERE } ## \\
// ## { COMPILED__WRITE_EXPORT_HERE } ## \\

export type Keys = keyof typeof permissions;
export type Permissions<T extends Keys> = (typeof permissions)[T];
export type PermissionsKeys<T extends Keys> = keyof Permissions<T>;

export default permissions;

// ## { COMPILED__WRITE_EXPORT_HERE } ## \\