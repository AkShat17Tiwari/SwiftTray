export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: "student" | "vendor" | "admin" | "super_admin";
    };
  }
}
