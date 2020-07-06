const path = require('path');
const express = require('express');
const app = express();

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

const PORT = process.env.PORT || 3000;

app.listeb(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})