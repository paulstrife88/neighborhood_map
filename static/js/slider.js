function toogleMenu() {
	var elements = document.getElementsByClassName("hide");
	if (getComputedStyle(elements[0]).display != "none") {
		for (var item of elements) {
			item.style.display = "none";
		}
		document.getElementById("menu").style.width = "5%";
		document.getElementById("map").style.width = "95%";
	}
	else {
		for (var item of elements) {
			item.style.display = "flex";
		}
		document.getElementById("menu").style.width = "30%";
		document.getElementById("map").style.width = "70%";
	}
}