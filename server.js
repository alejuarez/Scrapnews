var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');

// our scrapping tools
var axios = require('axios');
var cheerio = require('cheerio');

// require all models
var db = require('./models');

var exphbs = require('express-handlebars');

// initialize Express
var app = express();

var PORT = process.env.PORT || 3000;

// configure middleware
// use morgan logger for logging requests
app.use(logger('dev'));
// parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// make public a static folder
app.use(express.static('public'));
//setting up handlebars middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// connect to Mongoose
mongoose.connect(
  'mongodb://localhost/scrapnews',
  { useNewUrlParser: true }
);

// Routes
// A GET route for scraping the New York Times website
app.get('/', (req, res) => {
  db.Article.find({})
    .then(article => res.render('index', { article }))
    .catch(err => res.json(err));
});

app.get('/scrape', function(req, res) {
  // First, we grab the body of the html with axios
  var result = [];
  axios.get('https://www.nytimes.com/section/world').then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // An empty array to save the data that we'll scrape
    // var result = [];
    // NewArticle for the total of scrape articles
    var newArticle = 0;
    // Select each element in the HTML body from which you want information
    $('#latest-panel article.story.theme-summary').each((i, element) => {
      var nytlink = $(element)
        .find('.story-body>.story-link')
        .attr('href');
      var h2title = $(element)
        .find('h2.headline')
        .text()
        .trim();

      var addRow = true;
      // var result = [];
      if (h2title !== '' && nytlink !== '') {
        // Save these results in an object that we'll push into the results array we defined earlier
        console.log('title = ', h2title);
        //  first check if there are already articles in the database
        db.Article.findOne({ title: h2title }).then(data => {
          console.log('data =', data);
          addRow = false;
          if (!data) {
            db.Article.create({ title: h2title, link: nytlink })
              .then(function(article) {
                //res.render('index', article);
                newArticle = newArticle + 1;
                console.log('new art =', newArticle);
                result.push(article);
              })
              .catch(function(err) {
                // return res.json(err);
                return res.redirect('/');
              });
            console.log('total articles = ', newArticle);
          }
        });
        console.log('addRow = ', addRow);
      }
    });
  });
  return res.redirect('/home');
});

app.get('/home', (req, res) => {
  db.Article.find({})
    .then(article => res.render('index', { article }))
    .catch(err => res.json(err));
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get('/articles/:id', function(req, res) {
  db.Article.find({ _id: req.params.id })
    .then(response => res.json(response))
    .catch(err => res.json(err));
});

// Route for saving/updating an Article's associated Note
app.post('/saved', function(req, res) {
  db.Article.create(req.body).then(function(dbArticle) {
    return db.Article.findOneAndUpdate(
      {},
      { $push: { articles: dbArticle.id } }
    );
  });
});

// Route for creating a Note
app.post('/note/:id', (req, res) => {
  var id = req.params.id;
  db.Note.create(req.body)
    .then(newNote => {
      db.Article.findOneAndUpdate(
        { _id: id },
        { $push: { notes: newNote._id } },
        { new: true }
      )
        .then(() => res.json(newNote))
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

// Route for deleting all articles
app.put('/delete', (req, res) => {
  console.log('delete ');
  db.Article.deleteMany({})
    .then(article => res.render('index', { article }))
    .catch(err => res.json(err));
});

// Start the server
app.listen(PORT, function() {
  console.log('App running on port ' + PORT + '!');
});
