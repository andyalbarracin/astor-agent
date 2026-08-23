/** Usuarios de prueba (dev). Crear con .docs/seed/seed.users.sql. */
export interface TestUser {
  label: string;
  email: string;
  password: string;
  hint: string;
}

export const TEST_USERS: TestUser[] = [
  { label: 'Juan Pérez', email: 'juan@astor.app', password: 'astor1234', hint: 'con datos de prueba' },
  { label: 'María Gómez', email: 'maria@astor.app', password: 'astor1234', hint: 'cuenta vacía' },
];
