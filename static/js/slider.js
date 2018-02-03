// Show and hide the sidebar containeing the search bar and locations list
function toogleMenu() {
	var elements = document.getElementsByClassName("hide");
	if (getComputedStyle(elements[0]).display != "none") {
		for (var item of elements) {
			item.style.display = "none";
		}
		document.getElementById("menu").style.width = "0%";
		document.getElementById("map").style.width = "100%";
	}
	else {
		for (var item of elements) {
			item.style.display = "flex";
		}
		document.getElementById("menu").style.width = "25%";
		document.getElementById("map").style.width = "75%";
	}
}