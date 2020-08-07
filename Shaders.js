class Shader{
	constructor(gl,vertShaderSrc,fragShaderSrc){
		this.program = ShaderUtil.createProgramFromText(gl,vertShaderSrc,fragShaderSrc,true);

		if(this.program != null){
			this.gl = gl;
			gl.useProgram(this.program);
			this.attribLoc = ShaderUtil.getStandardAttribLocations(gl,this.program);
			this.uniformLoc = {};	//TODO : Replace in later lessons with get standardUniformLocations.
		}

		//Note :: Extended shaders should deactivate shader when done calling super and setting up custom parts in the constructor.
	}

	//...................................................
	//Methods
	activate(){ this.gl.useProgram(this.program); return this; }
	deactivate(){ this.gl.useProgram(null); return this; }

	//function helps clean up resources when shader is no longer needed.
	dispose(){
		//unbind the program if its currently active
		if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) this.gl.useProgram(null);
		this.gl.deleteProgram(this.program);
	}

	//...................................................
	//RENDER RELATED METHODS

	//Setup custom properties
	preRender(){} //abstract method, extended object may need need to do some things before rendering.

	//Handle rendering a modal
	renderModal(modal){
		this.gl.bindVertexArray(modal.mesh.vao);	//Enable VAO, this will set all the predefined attributes for the shader
		
		if(modal.mesh.indexCount) this.gl.drawElements(modal.mesh.drawMode, modal.mesh.indexCount, gl.UNSIGNED_SHORT, 0);
		else this.gl.drawArrays(modal.mesh.drawMode, 0, modal.mesh.vertexCount);

		this.gl.bindVertexArray(null);

		return this;
	}
}

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
		
		gl.bindAttribLocation(prog, ATTR_POSITION_LOC, ATTR_POSITION_NAME);
		gl.bindAttribLocation(prog, ATTR_NORMAL_LOC, ATTR_NORMAL_NAME);
		gl.bindAttribLocation(prog, ATTR_UV_LOC, ATTR_UV_NAME);

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

		return prog;
	}
	static domShaderProgram(gl,vectID,fragID,doValidate){
		var vShaderTxt	= ShaderUtil.domShaderSrc(vectID);								if(!vShaderTxt)	return null;
		var fShaderTxt	= ShaderUtil.domShaderSrc(fragID);								if(!fShaderTxt)	return null;
		var vShader		= ShaderUtil.createShader(gl,vShaderTxt,gl.VERTEX_SHADER);		if(!vShader)	return null;
		var fShader		= ShaderUtil.createShader(gl,fShaderTxt,gl.FRAGMENT_SHADER);	if(!fShader){	gl.deleteShader(vShader); return null; }
		
		return ShaderUtil.createProgram(gl,vShader,fShader,true);
	}

	static createProgramFromText(gl,vShaderTxt,fShaderTxt,doValidate){
		var vShader		= ShaderUtil.createShader(gl,vShaderTxt,gl.VERTEX_SHADER);		if(!vShader)	return null;
		var fShader		= ShaderUtil.createShader(gl,fShaderTxt,gl.FRAGMENT_SHADER);	if(!fShader){	gl.deleteShader(vShader); return null; }
		
		return ShaderUtil.createProgram(gl,vShader,fShader,true);
	}

	static getStandardAttribLocations(gl,program){
		return{
			position : gl.getAttribLocation(program, ATTR_POSITION_NAME),
			norm : gl.getAttribLocation(program, ATTR_NORMAL_NAME),
			uv : gl.getAttribLocation(program, ATTR_UV_NAME)
		};
	}
}