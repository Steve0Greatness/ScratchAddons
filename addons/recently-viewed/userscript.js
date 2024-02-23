export default async function ({ addon, console }) {
  const XToken = await addon.auth.fetchXToken();

  if (XToken === null) return;

  const Username = await addon.auth.fetchUsername();
  const RecentlyViewedProjects = await (
    await fetch(`https://api.scratch.mit.edu/users/${Username}/projects/recentlyviewed?limit=20&offset=0`, {
      headers: {
        "X-Token": XToken,
      },
    })
  ).json();

  const Tabs = document.querySelector("#tabs");

  const RecentlyViewed = "recently-viewed";

  const RecentlyViewedTab = document.createElement("li");
  RecentlyViewedTab.classList.add("sub-list");
  RecentlyViewedTab.dataset.tab = RecentlyViewed;

  const RecentlyViewedAnchor = document.createElement("a");
  RecentlyViewedAnchor.href = "#" + RecentlyViewed;

  const RecentlyViewedCountHolder = document.createElement("span");
  RecentlyViewedCountHolder.dataset.content = RecentlyViewed + "-count";

  RecentlyViewedAnchor.append("Recently Viewed (", RecentlyViewedCountHolder, ")");
  RecentlyViewedTab.appendChild(RecentlyViewedAnchor);
  Tabs.appendChild(RecentlyViewedTab);

  RecentlyViewedCountHolder.innerText = RecentlyViewedProjects.length;
  console.log(RecentlyViewedProjects);

  const MediaListHolder = await addon.tab.waitForElement(".media-list[data-content]");

  const MediaList = document.createElement("ul");
  MediaList.classList.add("media-list");

  RecentlyViewedAnchor.addEventListener("click", OpenRecentlyViewedTab);

  function OpenRecentlyViewedTab() {
    console.log("Wipping previous medialist");
    MediaListHolder.innerHTML = "";
    MediaListHolder.appendChild(MediaList);
    for (let index = 0; index < RecentlyViewedProjects.length; index++) {
      const ProjectObject = RecentlyViewedProjects[index];
      const MediaItem = CreateMediaItem(ProjectObject);
      MediaList.append(MediaItem);
    }
  }

  /**
   * Creates a li element for ul.media-list in mystuff
   * @param {Object} ProjectObject
   */
  function CreateMediaItem(ProjectObject) {
    const href = `/projects/${ProjectObject.id}/`;
    const modified = new Date(ProjectObject.history.modified);

    const Holder = document.createElement("li");
    Holder.classList.add("media-item-content");

    const MediaThumbnailHolder = document.createElement("div");
    MediaThumbnailHolder.classList.add("media-thumb");
    const MediaThumbnailAnchor = document.createElement("a");
    MediaThumbnailAnchor.href = href;
    const MediaThumbnail = document.createElement("img");
    MediaThumbnail.src = ProjectObject.images["100x80"];
    MediaThumbnailAnchor.appendChild(MediaThumbnail);
    MediaThumbnailHolder.appendChild(MediaThumbnailAnchor);

    const MediaInfo = document.createElement("div");
    MediaInfo.classList.add("media-info");

    const MediaInfoTitleHolder = document.createElement("span");
    MediaInfoTitleHolder.classList.add("media-item-info", "title");
    const MediaInfoTitle = document.createElement("a");
    MediaInfoTitle.href = href;
    MediaInfoTitle.innerText = ProjectObject.title;
    MediaInfoTitleHolder.appendChild(MediaInfoTitle);

    const MediaInfoDate = document.createElement("span");
    MediaInfoDate.classList.add("media-info-item", "date", "shortDateFormat");
    MediaInfoDate.innerText = GetShortestTimeDiff(modified);

    MediaInfo.append(MediaInfoTitleHolder, MediaInfoDate);
    Holder.append(MediaThumbnailHolder, MediaInfo);

    return Holder;
  }

  /**
   * Gets the difference between 2 dates
   * @param {Date} Date0
   * @param {Date} Date1
   * @param {String} locale
   */
  function GetShortestTimeDiff(Date0, Date1 = new Date(Date.now()), locale = "en") {
    const RTF = new Intl.RelativeTimeFormat(locale, { numeric: "always", style: "short" });

    const DiffYears = Date1.getFullYear() - Date0.getFullYear();
    const DiffMonths = Date1.getMonth() - Date0.getMonth();
    const DiffDate = Date1.getDate() - Date0.getDate();
    const DiffHours = Date1.getHours() - Date0.getHours();
    const DiffMinutes = Date1.getMinutes() - Date0.getMinutes();
    const DiffSeconds = Date1.getSeconds() - Date0.getSeconds();

    if (DiffYears !== 0) return RTF.format(DiffYears * -1, "year");
    if (DiffMonths !== 0) return RTF.format(DiffMonths * -1, "month");
    if (DiffDate !== 0) return RTF.format(DiffDate * -1, "day");
    if (DiffHours !== 0) return RTF.format(DiffHours * -1, "hours");
    if (DiffMinutes !== 0) return RTF.format(DiffMinutes * -1, "minute");
    return RTF.format(DiffSeconds * -1, "seconds");
  }
}
