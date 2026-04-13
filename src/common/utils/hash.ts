import bcrypt from "bcrypt";

export async function hashText(value: string) {
  return bcrypt.hash(value, 10);
}

export async function compareHash(value: string, hashedValue: string) {
  return bcrypt.compare(value, hashedValue);
}