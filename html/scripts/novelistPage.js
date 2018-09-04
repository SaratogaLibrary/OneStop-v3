var novelist_recommendations = [];
var novelist_update_timer = null;
var recommendation_index = 0;

loadNovelistStylesheet();

function populateRecommendations() {
	// Request updated Novelist recommendations
	var url = '/selfCheck?action=getRecommendations';
	ajaxRequest(url, processRecommendations, null, "GET", null);

	// Act on any recommendations that have already been received
	var novelist_container = document.getElementById("novelist_container");
	var recommendations_container = document.getElementById("novelist_recommendations");
	var recommend_title_container = document.getElementById("n_recommend_container");
	if (novelist_container && recommendations_container && novelist_recommendations.length) {
		$("#novelist_recommendations").empty();
		$("#novelist_recommendations").html('<div class="n_text">Click or Touch any title for more info</div>');
		var count = Math.min(3, novelist_recommendations.length);
		for (var x = 0; x < count; ++x) {
			if ((recommendation_index + 1) >= novelist_recommendations.length) {
				recommendation_index = 0;
			} else {
				++recommendation_index;
			}
			var book = novelist_recommendations[recommendation_index];
			var item = document.createElement("a");
			item.onclick = function(b) { return function() { showRecommendationDetails(b); } }(book);
			item.innerHTML = '<div class="n_book">'
				+ '<div class="n_book_image">'
				+ '<img height="50" width="30" src="' + book.bookjacketUrl + '">'
				+ '</div>'
				+ '<div class="n_book_title">' + book.title + '</div>'
                + '</div>';
			$("#novelist_recommendations").append(item);
		}
		
		var poweredTextItem = document.getElementById("powered_text");
		if (poweredTextItem == null)
		{	
			poweredTextItem = document.createElement("div");
			poweredTextItem.className = "n_inner_container_footer";
			poweredTextItem.id = "powered_text";
			poweredTextItem.innerHTML = "Powered by NoveList";
			$("#novelist_recommendations").append(poweredTextItem);
		}
		
		$("#novelist_container").show();
	} else {
		$("#novelist_container").hide();
	}
}

function processRecommendations(content) {
	var xmlContent = getXMLContent(content, "RECOMMENDATIONS");
	if (xmlContent[0] == null)
		return;
	
	novelist_recommendations = [];
	var recommendations = xmlContent[0].getElementsByTagName("RECOMMENDATION");
	for (var i = 0; i < recommendations.length; ++i) {
		var id = getNodeValue(recommendations[i], 'UNIQUE_ID');
		var title = getNodeValue(recommendations[i], 'TITLE');
		var fullTitle = getNodeValue(recommendations[i], 'FULL_TITLE');
		var author = getNodeValue(recommendations[i], 'AUTHOR');
		var fullAuthor = getNodeValue(recommendations[i], 'FULL_AUTHOR');
		var primaryIsbn = getNodeValue(recommendations[i], 'PRIMARY_ISBN');
		var rating = getNodeValue(recommendations[i], 'RATING');
		var description = getNodeValue(recommendations[i], 'DESCRIPTION');
		var bookjacketUrl = getNodeValue(recommendations[i], 'BOOKJACKET_URL');
		novelist_recommendations.push({
			id: id,
			title: fullTitle || title,
			author: fullAuthor || author,
			isbn: primaryIsbn,
			rating: rating,
			description: description,
			bookjacketUrl: bookjacketUrl
		});
	}
}

function hideRecommendationDetails() {
	$(".novelist_overlay").hide();
}

function showRecommendationDetails(item) {
	$("#recommended_title").text(item.title);
	$("#recommended_title").data("isbn", item.isbn);
	$("#recommended_author").text(item.author);
	$("#recommended_description").text(item.description);
	$("#recommended_bookjacket_url").attr("src", item.bookjacketUrl.replace(/\&amp;/ig, '&'));
	$(".novelist_overlay").show();
}

function saveRecommendation() {
	var isbn = $("#recommended_title").data("isbn");
	if (isbn) {
		var url = '/selfCheck?action=saveRecommendation&isbn=' + isbn + '&nextPage=savedRecommendations.xml&errorPage=error.xml';
		ajaxRequest(url, showSavedRecommendation, null, "GET", null);
	}
}

function showSavedRecommendation(content) {
	var xmlContent = getXMLContent(content, "error");
	if (xmlContent[0] == null) {
		$("#saved_recommendation_result").text("The recommendation was saved and will print on your receipt.");
	} else {
		var code = getNodeValue(xmlContent[0], "code");
		var description = getNodeValue(xmlContent[0], "description");
		
		var msg = "The recommendation could not be saved.  " + description;
		$("#saved_recommendation_result").text(msg);
	}
	$("#show_saved_recommendation_div").modal();
}

function closeSavedRecommendation() {
	$(".novelist_overlay").hide();
}