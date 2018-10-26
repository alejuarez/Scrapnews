$(document).ready(function() {
  //function to post a note to server

  $(document).on('click', '.scrape-new', function(e) {
    e.preventDefault();

    $.ajax({
      url: '/scrape',
      type: 'get',
      success: function(res) {
        if (res) {
          // window.location.replace('/');
        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  });

  $(document).on('click', '.clear', function(e) {
    e.preventDefault();
    $.ajax({
      url: '/delete',
      type: 'GET',
      success: function(res) {
        if (res) {
          console.log('scraped articles cleared');
          $('.article-container').empty();
        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  });

  $(document).on('click', '.save', function(e) {
    e.preventDefault();
    console.log('save clicked');
    var id = $(this).data('id');
    $.ajax({
      url: '/save',
      type: 'POST',
      data: { _id: id, isSaved: true },
      success: function(res) {
        if (res) {
          console.log('article saved');
          alert('article saved');
        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  });

  $(document).on('click', '.delete', function(e) {
    e.preventDefault();
    var stub = $(this).data('stub');
    var id = $(this).data('id');
    $.ajax({
      url: '/saved',
      method: 'delete',
      data: { id: id },
      success: function(res) {
        if (res) {
          $(`#${stub}-card`).remove();
        }
        console.log('article deleted');
      },
      error: function(err) {
        console.log(err);
      }
    });
  });
});
