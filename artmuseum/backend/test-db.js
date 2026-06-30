const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('artmuseumdb', 'postgres', 'nascia_2004', {
  host: 'localhost',
  port: 6666,
  dialect: 'postgres',
  logging: console.log,
});

(async () => {
  console.log('Trying to connect to DB...');

  const timeout = setTimeout(() => {
    console.error('Timeout reached. DB may be inaccessible.');
    process.exit(1);
  }, 10000);

  try {
    await sequelize.authenticate();
    clearTimeout(timeout);
    console.log('Connection established successfully.');
  } catch (error) {
    clearTimeout(timeout);
    console.error('Unable to connect to the database:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Connection closed.');
  }
})();
