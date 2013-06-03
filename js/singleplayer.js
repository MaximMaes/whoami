var initSingle = function() {
	room = window.location.hash.slice(1);
	$("#answers").show();
	$("#guess").show();

	rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], room);

	// need to use Timeout cause the websocket might not open quick enough
	setTimeout(getChars, 2000);

	var questions = {
		'Is it a male?': 'male#gender',
		'Is it a female?': 'female#gender',
		'Is it human?': '1#human',
		'Does it have black hair?': 'black#haircolor',
		'Does it have blond hair?': 'blond#haircolor',
		'Does it have brown hair?': 'brown#haircolor',
		'Does it have red hair?': 'red#haircolor',
		'Does it have grey hair?': 'grey#haircolor',
		'Does it have a black skin?': 'black#skincolor',
		'Does it have a brown skin?': 'brown#skincolor',
		'Does it have a white skin?': 'white#skincolor',
		'Does it have a yellow skin?': 'yellow#skincolor',
		'Does it wear glasses?': '1#glasses',
		'Is it a TV-star?': '1#tv',
		'Is it an author?': '1#author'
	}

	$("#selectQuestion").show();

	$.each(questions, function(key, val) {
		$("#dropdownQ").append("<option value=" + val + ">" + key + "</option>");
	});

	$( "#dropdownQ" ).combobox();

	$("#btnAsk").on('click', function(e) {
		if ($("#dropdownQ").val() != -1) {
			var right = true;
			var Q = $("#dropdownQ option:selected").text();
			var val = $("#dropdownQ").val();
			var value = val.split('#')[0];
			var field = val.split('#')[1];
			
			if(character[field] == value) {
				right = true;
			} else {
				right = false;
			}

			if (!right) {
				$("#results").append("<li class='answNo'>" + Q + " No</li>");
			} else if (right) {
				$("#results").append("<li class='answYes'>" + Q + " Yes</li>");
			}
			tries -= 1;
			$("#turns").html(tries);
			if (tries == 1) {
				$("#turns").html('You must guess now!');
			}
		}
	});
}