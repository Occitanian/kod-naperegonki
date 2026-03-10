
// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";

runOnStartup(async runtime =>
{
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime)
{
	// Добавляем случайный параметр к URL при каждой загрузке
	/*
	if (window.location.search.indexOf("nocache") === -1) {
		// Если параметра nocache ещё нет - добавляем
		var newUrl = window.location.href + 
					(window.location.search ? "&" : "?") + 
					"nocache=" + Date.now();
		window.location.replace(newUrl);
	
}*/
	
	runtime.addEventListener("tick", () => Tick(runtime));
}

function Tick(runtime)
{
	// Code to run every tick
}
