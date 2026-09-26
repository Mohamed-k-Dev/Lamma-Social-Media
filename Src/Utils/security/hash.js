import { compareSync, hashSync } from "bcrypt";

export function hashData(data, salt = +process.env.SALT) {
  return hashSync(data, salt);
}

export function compareHashedData(data, hashedData) {
  return compareSync(data.toString(), hashedData);
}
