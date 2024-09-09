const app = require('./app');
const connectDatabase = require('./config/db');
const { serverPort } = require('./secret');

app.listen(serverPort, async () => {
    console.log(`SERVER IS RUNNING AT http://localhost:${serverPort}`);
    await connectDatabase();
});
