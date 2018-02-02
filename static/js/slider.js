function toogleMenu() {
	var element = document.getElementsByClassName("list-content")[0];
	if (getComputedStyle(element).display == "none") {
		document.getElementsByClassName("list-content")[0].style.display = "initial";
		document.getElementById("map").style.height = "calc(100% - 450px)";
	}
	else {
	document.getElementsByClassName("list-content")[0].style.display = "none";
	document.getElementById("map").style.height = "calc(100% - 150px)";
	}
}