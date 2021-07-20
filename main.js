// import express from "express";
// import ptp from "pdf-to-printer";
// import fs from "fs";
// import path from "path";

const express = require('express');
const ptp = require('pdf-to-printer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

ptp
  .getPrinters()
  .then(console.log)
  .catch(console.error);

ptp.print('202100000002-13.pdf', {printer: "EPSON_L3150_Series_2"});
