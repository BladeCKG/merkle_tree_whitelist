const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

const detailsAPI = require('./merkleTree.js');

const port = 8080;
const app = express();
app.get('/', (req, res) => {
    res.status(200).send(`Hello, WORLD!`);
  });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
// app.use(
//   cors({
//       origin: [
//           "http://localhost:3000",
//           "https://localhost:3000",
//       ],
//       credentials: true,
//       preflightContinue: false,
//   }),
// );
// app.use(
//     cors({
//         origin: '*',

//         methods: [
//           'GET',
//           'POST',
//         ],
      
//         allowedHeaders: [
//           'Content-Type',
//         ],      
//         origin: [],
//         credentials: true,
//         preflightContinue: false,
//     }),
// );

app.set('trust proxy', 1);

// app.use('/loginApis/', loginApi);
app.use('/apis/merkleTree/', detailsAPI);

app.listen(port, () => {
    console.log(`listening to the port ${port}`);
});
