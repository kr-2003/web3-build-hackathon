const https = require("https");

const projectId = "2RgtShLnYN1K9bzP3PU1yFsrNZU";
const projectSecret = "98957defd4dd78566739b74eb9d7eb18";

const options = {
  host: "ipfs.infura.io",
  port: 5001,
  path: "/api/v0/pin/add?arg=QmeGAVddnBSnKc1DLE7DLV9uuTqo5F7QbaveTjr45JUdQn",
  method: "POST",
  auth: projectId + ":" + projectSecret,
};

let req = https.request(options, (res) => {
  let body = "";
  res.on("data", function (chunk) {
    body += chunk;
  });
  res.on("end", function () {
    console.log(body);
  });
});
req.end();