$(document).ready(function () {

  var articleContainer = $(".article-container");
  $(document).on("click", ".btn.delete", handleArticleDelete);
  $(document).on("click", ".btn.notes", handleArticleNotes);
  $(document).on("click", ".btn.save", handleNoteSave);
  $(document).on("click", ".btn.note-delete", handleNoteDelete);

  initPage();

  function initPage() {
    articleContainer.empty();
    $.get("/api/headlines?saved=true")
      .then(function (data) {
        if (data && data.length) {
          renderArticles(data);
        }
        else {
          renderEmpty();
        }
      });
  }

  function renderArticles(articles) {
    var articleCards = [];
    for (var i = 0; i < articles.length; i++) {
      articleCards.push(createCard(articles[i]));
    }

    articleContainer.append(articleCards)
  }

  function createCard(article) {
    var card =
      $(["<div class='card mb-2'>",
        "<div class='card-header p-1'>",
        "<h6>",
        "<a class='text-dark' href=' " + article.url + "'>",
        article.headline,
        "<a class='btn btn-sm mr-1 px-1 py-0 float-right text-light btn-danger delete'>",
        "Delete",
        "</a>",
        "<a class='btn btn-sm mr-1 px-1 py-0 float-right text-dark btn-warning notes'>",
        "Notes",
        "</a>",
        "</h6>",
        "</div>",
        "<div class='card-body p-1'>",
        "<p class='mb-1 summary'>",
        "<img class='float-left mr-1' src='" + article.image + "' width='150px'>",
        article.summary,
        "</p>",
        "</div>",
        "</div>"
      ].join(""));

    card.data("_id", article._id);
    return card;
  }

  function renderEmpty() {
    var emptyAlert =
      $(["<div class='alert alert-dark text-center'>",
        "<h4>No Saved Articles</h4>",
        "<div class='card>",
        "<div class='card-header text-center'>",
        "</div>",
        "<div class card-body text-center>",
        "<h6><a href='/' class='scrape-new'>Home</a></h6>",
        "</div>",
        "</div>",
        "</div>"
      ].join(""));
    articleContainer.append(emptyAlert)
  }

  function renderNotesList(data) {
    console.log(data)
    var notesToRender = [];
    var currentNote;
    if (!data.notes.length) {
      currentNote = [
        "<li class='list-group-item mb-3'>",
        "No notes yet, be the first!",
        "</li>"
      ].join("");
      notesToRender.push(currentNote);
    }
    else {
      for (var i = 0; i < data.notes.length; i++) {
        currentNote = $([
          "<li class='list-group-item note mb-3'>",
          data.notes[i].noteText,
          "<button class='btn btn-sm btn-danger rounded-0 float-right note-delete'>x</button>",
          "</li>"
        ].join(""));
        currentNote.children("button").data("_id", data.notes[i]._id);
        notesToRender.push(currentNote);
      }
    }

    $(".note-container").append(notesToRender)
  }

  function handleArticleDelete() {
    var articleToDelete = $(this).parents(".card").data();
    $.ajax({
      method: "DELETE",
      url: "/api/headlines/" + articleToDelete._id
    })
      .then(function (data) {
        if (data.ok) {
          initPage();
        }
      });
  }

  function handleArticleNotes() {
    var currentArticle = $(this).parents(".card").data();
    $.get("/api/notes/" + currentArticle._id).then(function (data) {
      var modalText = [
        "<div class='container-fluid mod m-0 p-0 text-center'>",
        "<h6>Notes For Article: ",
        currentArticle._id,
        "</h6>",
        "<hr />",
        "<ul class='list-group note-container'>",
        "</ul>",
        "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
        "<button class='btn btn-sm btn-warning save'>Save Note</button>",
        "</div>"
      ].join("");

      bootbox.dialog({
        message: modalText,
        closeButton: true
      });
      var noteData = {
        _id: currentArticle._id,
        notes: data || []
      };

      $(".btn.save").data("article", noteData);

      renderNotesList(noteData)
    })
  }

  function handleNoteSave (){
    var noteData;
    var newNote = $(".bootbox-body textarea").val().trim();

    if (newNote) {
      noteData = {
        _id: $(this).data("article")._id,
        noteText: newNote
      };
      $.post("/api/notes", noteData)
        .then(function () {
          bootbox.hideAll();
        })
    }
  }
  function handleNoteDelete () {
    var noteToDelete = $(this).data("_id");

    $.ajax({
      url: "/api/notes/" + noteToDelete,
      method: "DELETE"
    })
      .then(function() {
        bootbox.hideAll()
      });
  }
});