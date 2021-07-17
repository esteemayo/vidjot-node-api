module.exports = () => {
  if (!process.env.JWT_SECRET) {
    console.error("ERROR 🔥");
    process.exit(1);
  }
};
