const express = require('express');

const homeRouter = express.Router();

homeRouter.get('/', (req, res) => {
    res.status(200).send({
        message: 'welcome to the backend Server',
    });
});

module.exports = homeRouter;
