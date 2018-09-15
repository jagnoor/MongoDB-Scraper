const request = require("request");
const cheerio = require("cheerio");

const scrape = function (cb) {

  request("https://www.theonion.com/", (error, response, html) => {
    console.log("scraped main")
    const cc = cheerio.load(html);

    const results = [];

    cc(".post-wrapper").each((i, element) => {

      // magic object notation to dry up code. Same as `var key = cc(element).find("p")...` and pushing into array
      var headline = cc(element).find(".headline").text().trim();
      var summary = cc(element).find("p").text();
      var url = cc(element).find(".js_entry-link").attr("href");
      var image = cc(element).find("source").attr("data-srcset");

      if (headline && summary && url && image) {
        var dataToAdd = {
          headline: headline,
          summary: summary,
          url: url,
          image: image
        };
        results.push(dataToAdd)
      }
    });
    cb(results)
  });
}

module.exports = scrape;