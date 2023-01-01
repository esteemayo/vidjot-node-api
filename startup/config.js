/* eslint-disable */
const config = () => {
  if (!process.env.JWT_SECRET) {
    console.error('ERROR 🔥');
    process.exit(1);
  }
};

export default config;
