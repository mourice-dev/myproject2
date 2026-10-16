/** @format */

console.log("Hi nshuti maurice!");

const express = require("express");
const cors = require("cors");
const server = express(cors());
server.use((req, res) => {
    res.send("Hello worlds");
})

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
