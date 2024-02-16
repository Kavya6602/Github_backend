const express = require('express');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2');
const app = express();
app.use(express.json());


const getReq = async(req,res) => {
    try {
        
    } catch (e) {
       res.status(500).send(e.message) 
    }
}