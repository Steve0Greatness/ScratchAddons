export default async function ({ addon, console }) {
	const XToken = await addon.auth.fetchXToken();
	
	if (XToken === null)
		return;

	const Username = await addon.auth.fetchUsername();
	const RecentlyViewedProjects = await (await fetch(
		`https://api.scratch.mit.edu/users/${Username}/projects/recentlyviewed?limit=20&offset=0`,
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

	//const RecentlyViewedCountHolder = document.createElement("span");
	//RecentlyViewedCountHolder.dataset.content = RecentlyViewed + "-count";

	RecentlyViewedAnchor.append("Recently Viewed");
	RecentlyViewedTab.appendChild(RecentlyViewedAnchor);
	Tabs.appendChild(RecentlyViewedTab);

	//RecentlyViewedCountHolder.innerText = RecentlyViewedProjects.length;
	//console.log(RecentlyViewedProjects)


	const MediaList = document.createElement("ul");
	MediaList.classList.add("media-list");
	

	addon.tab.addEventListener("urlChange", RunForCorrectURL);
	RunForCorrectURL();

	function OpenRecentlyViewedTab() {
		//console.log("Wipping previous medialist");
		const MainContentHolder = document.querySelector("#main-content");
		MainContentHolder.innerHTML = "";
		MainContentHolder.appendChild(InitializeMainContent());
		MainContentHolder.querySelector(".media-list").appendChild(MediaList)
		for (let index = 0; index < RecentlyViewedProjects.length; index++) {
			const ProjectObject = RecentlyViewedProjects[index];
			const MediaItem = CreateMediaItem(ProjectObject);
			MediaList.append(MediaItem);
		}
	}

	function InitializeMainContent() {
		const Holder = document.createElement("div");
		Holder.innerHTML = `<div id="main-content" class="tab-content">
	<div class="action-bar scroll">
		<div class="inner">
			<div class="dropdown radio-style button grey small">
				<span class="dropdown-toggle black" data-toggle="dropdown">
					<spam class="">Sort by</span>
					<span class="caret"></span>
				</span>
				<div class="dropdown-menu radio-style">
					<ul data-control="sort">
						<li class="selected" data-descsort="datetime_modified">Last Modified</li>
						<li data-descsort="view_count">Views</li>
						<li data-descsort="love_count">Loves</li>
						<li data-descsort="remixers_count">Remixes</li>
						<li data-ascsort="title">A-Z</li>
						<li data-descsort="title">Z-A</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<div id="alert-view"></div>
	<div class="media-list" data-content="list"></div>
</div>`;
		return Holder;
	}

	/**
	 * Creates a li element for ul.media-list in mystuff
	 * @param {Object} ProjectObject
	 */
	function CreateMediaItem(ProjectObject) {
		const href = `/projects/${ProjectObject.id}/`;
		const modified = new Date(ProjectObject.history.modified);
		const author = ProjectObject.author.username;
		

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
		MediaInfoTitleHolder.classList.add("media-info-item", "title");
		const MediaInfoTitle = document.createElement("a");
		MediaInfoTitle.href = href;
		MediaInfoTitle.innerText = ProjectObject.title;
		MediaInfoTitleHolder.appendChild(MediaInfoTitle);

		const MediaInfoDate = document.createElement("span");
		MediaInfoDate.classList.add("media-info-item", "date", "shortDateFormat");
		MediaInfoDate.innerText = "Last modified: " + GetShortestTimeDiff(modified);

		const MediaInfoAuthor = document.createElement("span");
		MediaInfoAuthor.classList.add("media-info-item", "sa-rv-author");
		const MediaInfoAuthorAnchor = document.createElement("a");
		MediaInfoAuthorAnchor.href = `/users/${author}`;
		const MediaInfoAuthorPFP = document.createElement("img");
		MediaInfoAuthorPFP.src = `https://cdn2.scratch.mit.edu/get_image/user/${ProjectObject.author.id}_20x20.png`;
		MediaInfoAuthorPFP.width = "20";
		MediaInfoAuthorPFP.height = "20";
		MediaInfoAuthorAnchor.append(MediaInfoAuthorPFP, author);
		MediaInfoAuthor.appendChild(MediaInfoAuthorAnchor)
		
		MediaInfo.append(MediaInfoTitleHolder, MediaInfoDate, MediaInfoAuthor);

		const MediaAddTo = document.createElement("div");
		MediaAddTo.outerHTML = `<div data-control="add-to" class="media-control dropdown button grey small enabled"><span data-toggle="dropdown" class="dropdown-toggle black">Add to <span class="caret"></span></span><div data-content="addto-gallery-list" data-project-id="487076566" class="dropdown-menu"></div></div>`;



		Holder.append(MediaThumbnailHolder, MediaInfo, MediaAddTo);

		return Holder;
	}

	/**
	 * Gets the difference between 2 dates
	 * @param {Date} Date0
	 * @param {Date} Date1
	 * @param {String} locale
	 */
	function GetShortestTimeDiff(Date0, Date1=new Date(Date.now()), locale="en") {
		const RTF = new Intl.RelativeTimeFormat(locale, { numeric: "always", style: "long" });

		const DiffYears = Date1.getFullYear() - Date0.getFullYear();
		const DiffMonths = Date1.getMonth() - Date0.getMonth();
		const DiffDate = Date1.getDate() - Date0.getDate();
		const DiffHours = Date1.getHours() - Date0.getHours();
		const DiffMinutes = Date1.getMinutes() - Date0.getMinutes();
		const DiffSeconds = Date1.getSeconds() - Date0.getSeconds();

		if (DiffYears !== 0)
			return RTF.format(DiffYears * -1, "year");
		if (DiffMonths !== 0)
			return RTF.format(DiffMonths * -1, "month");
		if (DiffDate !== 0)
			return RTF.format(DiffDate * -1, "day");
		if (DiffHours !== 0)
			return RTF.format(DiffHours * -1, "hours");
		if (DiffMinutes !== 0)
			return RTF.format(DiffMinutes * -1, "minute");
		return RTF.format(DiffSeconds * -1, "seconds")
	}

	function SetCorrectTab() {
		RecentlyViewedTab.classList.add("active");
		document.querySelector("[data-tab=projects]").classList.remove("active");
	};

	function RunForCorrectURL() {
		if (location.hash !== "#" + RecentlyViewed)
			return;
		SetCorrectTab();
		OpenRecentlyViewedTab();
	};
}
