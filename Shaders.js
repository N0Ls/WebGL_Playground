class ShaderUtil{
	//Getting shader code from page
	static domShaderSrc(elmID){
		var elm = document.getElementById(elmID);
		if(!elm || elm.text == ""){console.log(elmID + " shader not found or no text."); return null;}
		return elm.text;
	}

	//Compiling shader
	static createShader(gl,src,type){
		var shader = gl.createShader(type);
		gl.shaderSource(shader,src);
		gl.compileShader(shader);

		//Get error
		if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
			console.error("Error compiling shader : " + src, gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	}

	//Getting the shader together in a programm 
	static createProgram(gl,vShader, fShader, doValidate){

		var prog = gl.createProgram();
		gl.attachShader(prog,vShader);
		gl.attachShader(prog,fShader);
		gl.linkProgram(prog);

		//check if successful
		if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
			console.error("Error creating shader program.", gl.getProgramInfoLog(prog));
			gl.deleteProgram(prog);
			return null;
		}

		//for debugging
		if(doValidate){
			gl.validateProgram(prog);
			if(!gl.getProgramParameter(prog,gl.VALIDATE_STATUS)){
				console.error("Error validating program", gl.getProgramInfoLog(prog));
				gl.deleteProgram(prog);
				return null;
			}
		}

		gl.detachShader(prog, vShader);
		gl.detachShader(prog, fShader);
		gl.deleteShader(fShader);
		gl.deleteShader(vShader);
	}
}