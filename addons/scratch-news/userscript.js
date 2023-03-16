export default async function ({ addon, console, msg }) {
  const dateStrOpts = { weekday: "short", year: "numeric", month: "short", day: "numeric" };

  document.title = "Scratch - News";

  var scratchNews = await (await fetch("//api.scratch.mit.edu/news")).json(); // ?offset=3&limit=2
  /*
    - offset :
        19 * (# of times load more has been clicked)
    - limit  :
        20 * (# of times load more has been clicked)
    */

  const SAChangelog = await readSAChangelog();

  var news = [
    ...SAChangelog.map((news) => makeGeneral(news, "SA")),
    ...scratchNews.map((news) => makeGeneral(news, "Scratch")),
  ]
    .sort((a, b) => a.date < b.date)
    .splice(1, 20);
  console.log(news);

  const docContent = document.querySelector("#content");
  docContent.innerHTML = "";

  for (let newsItem of news) {
    var newsElement = document.createElement("article");
    newsElement.classList.add("SA-news-el", ...newsItem.type.map((e) => `SA-news-type-${e}`));
    newsElement.innerHTML = `
<a href="${newsItem.link}" class="SA-news-el-header-url">
    <img class="SA-news-el-img" src="${newsItem.img}" width="50">
    <b class="SA-news-el-title">${newsItem.name}</b>
    <time class="SA-news-el-time">${newsItem.date.toLocaleDateString(undefined, dateStrOpts)}</time>
</a>
<p class="SA-news-el-body">${newsItem.desc}</p>
`;
    docContent.appendChild(newsElement);
  }

  function readSAChangelog() {
    return new Promise(async (res, rej) => {
      var SAChangelog = await fetch("//api.github.com/repos/ScratchAddons/website-v2/contents/data/changelog.yml");
      SAChangelog = await SAChangelog.json();
      SAChangelog = atob(SAChangelog.content);
      SAChangelog = SAChangelog.split("- Version: ").reverse();
      SAChangelog.pop();
      res(
        SAChangelog.map((ver, ind) => {
          ver = ver.replace(/\r\n/g, "\n");
          ver = ver.replace(/\r/g, "\n");
          ver = ver.split(/\n/g);
          return {
            version: ver[0],
            index: parseInt(ver[1].split(": ")[1]),
            tag: ver[2].split(": ")[1],
            name: ver[3].split(": ")[1],
            date: new Date(ver[4].split(": ")[1]),
            entry: ver.slice(7).join("\n").replace(/    /g, ""),
          };
        })
      );
    });
  }
  function makeGeneral(news, type) {
    var entry = {
      name: null,
      date: null,
      desc: null,
      link: null,
      img: null,
      type: [],
    };
    if (type == "SA")
      entry = {
        name: msg("SA-title"),
        date: news.date,
        desc: msg("SA-desc").replace("{1}", news.version),
        link: `https://scratchaddons.com/changelog/?versionname=${news.verison}`,
        img: "https://scratchaddons.com/assets/img/icon.svg",
        type: ["SA", news.status],
      };
    else if (type == "Scratch")
      entry = {
        name: news.headline,
        date: new Date(news.stamp),
        desc: news.copy,
        link: news.url,
        img: news.image,
        type: ["Scratch"],
      };
    return entry;
  }
}
