// Show and hide the sidebar containeing the search bar and locations list
function toogleMenu() {
	var media = window.matchMedia("(min-width: 501px)");
	var elements = document.getElementsByClassName("hide");
	if (getComputedStyle(elements[0]).display != "none") {
		for (var item of elements) {
			item.style.display = "none";
		}
		document.getElementById("menu").style.display = "none";
		document.getElementById("map").style.width = "100%";
	}
	else {
		for (var item of elements) {
			item.style.display = "flex";
		}
		if (media.matches) {
			document.getElementById("menu").style.display = "block";
			document.getElementById("map").style.width = "75%";
		} else {
			document.getElementById("menu").style.display = "block";
			document.getElementById("map").style.width = "45%";
		}
		
	}
}