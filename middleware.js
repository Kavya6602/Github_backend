const express = require('express');

const logRequest = (req,res,next) => {
    console.log(`[${new Date().toISOString()}]  Method: ${req.method}, URL: ${req.url}`);
    next(); 
}

const validateQueryParams = (req,res,next) => {
    const { limit, offset } = req.query;
    if (!limit || !offset || limit < 0 || offset < 0) {
      return res.status(400).send({ message: 'Invalid limit or offset values' });
    }
    next();
}

module.exports = {logRequest,validateQueryParams};