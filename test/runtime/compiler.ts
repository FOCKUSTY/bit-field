import { Compiler } from "../../src/compiler";

import { resolve } from "path";

// permissions.config.ts
export const permissionsConfig = {
  // Права на управление пользователями
  user: ["USER_VIEW", "USER_CREATE", "USER_EDIT", "USER_DELETE"],
  // Права на управление контентом
  content: [
    "CONTENT_VIEW",
    "CONTENT_PUBLISH",
    "CONTENT_ARCHIVE",
    "CONTENT_DELETE",
  ],
  // Административные права
  admin: ["ADMIN_VIEW_LOGS", "ADMIN_MANAGE_ROLES", "ADMIN_SYSTEM_SETTINGS"],
};

const compiler = new Compiler(
  permissionsConfig,
  resolve(__dirname, "./permissions.ts"),
  {},
  {
    name: "permissions",
    writeInCompiler: true,
    defaultExportOn: true,
    jsdocs: true,
  },
);
compiler.execute();
console.log("✅ Permissions compiled successfully");
