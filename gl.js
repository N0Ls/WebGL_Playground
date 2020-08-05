function GLInstance(canvasID){
	var canvas = document.getElementById(canvasID);
	var gl = canvas.getContext("webgl2");

	if(!gl){console.error("Web GL context is not available."); return null;}

	//Setup
	gl.clearColor(1.0,1.0,1.0,1.0);

	//Methods
	gl.fClear = function(){this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT); return this;}

	//Setters - Getters

	//Set size of canvas
	gl.fSetSize = function(w,h){
		this.canvas.style.width = w + "px";
		this.canvas.style.height = h + "px";
		this.canvas.width = w ;
		this.canvas.height = h;

		//reseting the viewport is important so the resolution change
		this.viewport(0,0,w,h); 
		return this;
	}
	return gl;
}
