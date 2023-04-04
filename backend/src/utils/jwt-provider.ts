import dotenv from "dotenv";
import jwt, { decode } from "jsonwebtoken";

const { sign, verify } = jwt;

// Load environment variables from the .env file, where the ATLAS_URI is configured
dotenv.config();

const { SECRET_KEY } = process.env;
let secretKey = SECRET_KEY;

if (!SECRET_KEY) {
  console.error("No SECRET_KEY environment variable has been defined");
  console.log("Switching to default secret key");
  secretKey = "secret";
}

export interface UserPayload {
  id: string;
  username: string;
}

export const generateJwt = (user: UserPayload) => {
  const token = sign({
    id: user.id,
    username: user.username
  },
    secretKey,
    { expiresIn: "365d" }
  );
  return token;
}


const decodeJwt = (token: string) => {
  try {
    var decoded = decode(token, { complete: true });
    return decoded;
  } catch (err) {
    return null;
  }
};

export const validateJwt = (token: string) => {
  try {
    verify(token, secretKey);
    console.log("verify success");

    return decodeJwt(token);
  } catch (err) {
    console.log("verify null");

    return null;
  }
};
