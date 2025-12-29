const requiredEnvVars = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
};

// Validate that all required environment variables are present
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
}

// Validate that all values are not empty strings
const emptyVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => value?.trim() === "")
  .map(([key]) => key);

if (emptyVars.length > 0) {
  throw new Error(
    `Required environment variables cannot be empty: ${emptyVars.join(", ")}`
  );
}

const authConfig = {
  secret: requiredEnvVars.JWT_SECRET as string,
  expiresIn: requiredEnvVars.JWT_EXPIRES_IN as string,
  refresh_secret: requiredEnvVars.JWT_REFRESH_SECRET as string,
  refresh_expiresIn: requiredEnvVars.JWT_REFRESH_EXPIRES_IN as string,
};

export default authConfig;
