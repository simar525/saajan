const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

// Sample endpoint to return markdown
app.post('/api/v1/prediction', (req, res) => {
    const question = req.body.question;
    // Fake Markdown response for testing:
    const markdownResponse = `
**This is bold text**

- Here is a list item
- Another list item

1. Numbered item one
2. Numbered item two

# Header 1
## Header 2

[Link](https://www.example.com)
    `;

    res.json({ text: markdownResponse });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});