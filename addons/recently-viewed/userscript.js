export default async function ({ addon, console }) {
	const XToken = await addon.auth.fetchXToken();
	
	if (XToken === null)
		return;

	const Username = await addon.auth.fetchUsername();
	const RecentlyViewedProjects = await (await fetch(
		`https://api.scratch.mit.edu/users/${Username}/recentlyviewed`,
		{
			headers: {
				"X-Token": XToken
			}
		}
	)).json();

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
	console.log(RecentlyViewedProjects)

	const MediaList = document.querySelector("ul.media-list");

	RecentlyViewedAnchor.addEventListener("click", OpenRecentlyViewedTab);

	function OpenRecentlyViewedTab(ProjectObject) {
		const href = `/projects/${ProjectObject.id}/`;


		const Holder = document.createElement("li");
		Holder.classList.add("media-item-content");
		
		const MediaThumbnailHolder = document.createElement("div");
		MediaThumbnailHolder.classList.add("media-thumb");
		const MediaThumbnailAnchor = document.createElement("a")
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
		MediaInfoDate.innerText = ``;


	}
}
