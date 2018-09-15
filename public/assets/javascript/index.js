$(document).ready(function () {

  var articleContainer = $(".article-container");
  $(document).on("click", ".btn.save", handleArticleSave);
  $(document).on("click", ".scrape-new", handleArticleScrape);

  initPage();

  function initPage() {
    articleContainer.empty();
    $.get("/api/headlines?saved=false")
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
        "<a class='text-dark' href=' " + article.url+ "'>",
        article.headline,
        "<a class='btn btn-sm py-0 px-1 float-right btn-warning save'>",
        "Save",
        "</a>",
        "</h6>",
        "</div>",
        "<div class='card-body p-1'>",
        "<p class='mb-1 summary'>",
        "<img class='float-left mr-1' src='"+article.image+ "' width='150px'>",
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
        "<h4>No new articles</h4>",
        "<div class='card>",
        "<div class='card-header text-center'>",
        "<h5>What would you like to do?</h5>",
        "</div>",
        "<div class card-body text-center>",
        "<h6><a href='/' class='scrape-new'>Fresh Scrape</a></h6>",
        "<h6><a href='/saved'>View Saved</a></h6>",
        "</div>",
        "</div>",
        "</div>"
      ].join(""));
    articleContainer.append(emptyAlert)
  }

  function handleArticleSave(){
    var articleToSave = $(this).parents(".card").data();
    articleToSave.saved = true;
    $.ajax({
      method: "PATCH",
      url: "/api/headlines",
      data: articleToSave
    })
    .then(function(data){
      if(data.ok){
        initPage();
      }
    });
  }

  function handleArticleScrape(){
    $.get("/api/fetch")
    .then(function(data){
      initPage();
      bootbox.alert("<h3 class='text-center'>" + data.message + "</h3>")
    })
  }
})