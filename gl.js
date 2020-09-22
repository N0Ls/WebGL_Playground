//Global Constants
const ATTR_POSITION_NAME	= "a_position";
const ATTR_POSITION_LOC		= 0;
const ATTR_NORMAL_NAME		= "a_norm";
const ATTR_NORMAL_LOC		= 1;
const ATTR_UV_NAME			= "a_uv";
const ATTR_UV_LOC			= 2;

class GlUtil{
	static rgbArray(){
		if(arguments.length == 0) return null;
		var rtn = [];

		for(var i=0,c,p; i < arguments.length; i++){
			if(arguments[i].length < 6) continue;
			c = arguments[i];		//Just an alias(copy really) of the color text, make code smaller.
			p = (c[0] == "#")?1:0;	//Determine starting position in char array to start pulling from

			rtn.push(
				parseInt(c[p]	+c[p+1],16)	/ 255.0,
				parseInt(c[p+2]	+c[p+3],16)	/ 255.0,
				parseInt(c[p+4]	+c[p+5],16)	/ 255.0
			);
		}
		return rtn;
	}
}

function GLInstance(canvasID){
	var canvas = document.getElementById(canvasID);
	var gl = canvas.getContext("webgl2");

	if(!gl){console.error("Web GL context is not available."); return null;}

	//Setup custom properties
	gl.mMeshCache = [];
	gl.mTextureCache = [];

	//
	gl.cullFace(gl.BACK);								//Back is also default
	gl.frontFace(gl.CCW);								//Dont really need to set it, its ccw by default.
	gl.enable(gl.DEPTH_TEST);							//Shouldn't use this, use something else to add depth detection
	gl.enable(gl.CULL_FACE);							//Cull back face, so only show triangles that are created clockwise
	gl.depthFunc(gl.LEQUAL);							//Near things obscure far things
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	//Setup default alpha blending

	//Setup
	gl.clearColor(1.0,1.0,1.0,1.0);

	//Methods
	gl.fClear = function(){this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT); return this;}

	gl.fCreateArrayBuffer = function(floatAry,isStatic){
		if(isStatic === undefined) isStatic = true; //So we can call this function without setting isStatic

		var buf = this.createBuffer();
		this.bindBuffer(this.ARRAY_BUFFER,buf);
		this.bufferData(this.ARRAY_BUFFER, floatAry, (isStatic)? this.STATIC_DRAW : this.DYNAMIC_DRAW );
		this.bindBuffer(this.ARRAY_BUFFER,null);
		return buf;
	}

	gl.fCreateMeshVAO = function(name,aryInd,aryVert,aryNorm,aryUV, vertLen){
		var rtn = { drawMode:this.TRIANGLES };

		//Create and bind vao
		rtn.vao = this.createVertexArray();															
		this.bindVertexArray(rtn.vao);	//Bind it so all the calls to vertexAttribPointer/enableVertexAttribArray is saved to the vao.

		//.......................................................
		//Set up vertices
		if(aryVert !== undefined && aryVert != null){
			rtn.bufVertices = this.createBuffer();													//Create buffer...
			rtn.vertexComponentLen = vertLen || 3;													//How many floats make up a vertex
			rtn.vertexCount = aryVert.length / rtn.vertexComponentLen;								//How many vertices in the array

			this.bindBuffer(this.ARRAY_BUFFER, rtn.bufVertices);
			this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryVert), this.STATIC_DRAW);		//then push array into it.
			this.enableVertexAttribArray(ATTR_POSITION_LOC);										//Enable Attribute location
			//this.vertexAttribPointer(ATTR_POSITION_LOC,3,this.FLOAT,false,0,0);						//Put buffer at location of the vao\
			this.vertexAttribPointer(ATTR_POSITION_LOC,rtn.vertexComponentLen,this.FLOAT,false,0,0);						//Put buffer at location of the vao
		}

		//.......................................................
		//Setup normals
		if(aryNorm !== undefined && aryNorm != null){
			rtn.bufNormals = this.createBuffer();
			this.bindBuffer(this.ARRAY_BUFFER, rtn.bufNormals);
			this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryNorm), this.STATIC_DRAW);
			this.enableVertexAttribArray(ATTR_NORMAL_LOC);
			this.vertexAttribPointer(ATTR_NORMAL_LOC,3,this.FLOAT,false, 0,0);
		}

		//.......................................................
		//Setup UV
		if(aryUV !== undefined && aryUV != null){
			rtn.bufUV = this.createBuffer();
			this.bindBuffer(this.ARRAY_BUFFER, rtn.bufUV);
			this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryUV), this.STATIC_DRAW);
			this.enableVertexAttribArray(ATTR_UV_LOC);
			this.vertexAttribPointer(ATTR_UV_LOC,2,this.FLOAT,false,0,0);	//UV only has two floats per component
		}

		//.......................................................
		//Setup Index.
		if(aryInd !== undefined && aryInd != null){
			rtn.bufIndex = this.createBuffer();
			rtn.indexCount = aryInd.length;
			this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, rtn.bufIndex);  
			this.bufferData(this.ELEMENT_ARRAY_BUFFER, new Uint16Array(aryInd), this.STATIC_DRAW);
			//this.bindBuffer(this.ELEMENT_ARRAY_BUFFER,null); //TODO REMOVE THIS AND ADD TO CLEANUP
		}

		//Clean up
		this.bindVertexArray(null);					//Unbind the VAO, very Important. always unbind when your done using one.
		this.bindBuffer(this.ARRAY_BUFFER,null);	//Unbind any buffers that might be set
		if(aryInd != null && aryInd !== undefined)  this.bindBuffer(this.ELEMENT_ARRAY_BUFFER,null);
		
		this.mMeshCache[name] = rtn;
		return rtn;
	}
	
	gl.fLoadTexture = function(name,img,doYFlip){
		var tex = this.createTexture();
		if(doYFlip == true) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true);	//Flip the texture by the Y Position, So 0,0 is bottom left corner.

		this.bindTexture(this.TEXTURE_2D, tex);														//Set text buffer for work
		this.texImage2D(this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, img);			//Push image to GPU.
		
		this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR);					//Setup up scaling
		this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR_MIPMAP_NEAREST);	//Setup down scaling
		this.generateMipmap(this.TEXTURE_2D);	//Precalc different sizes of texture for better quality rendering.

		this.bindTexture(this.TEXTURE_2D,null);									//Unbind
		this.mTextureCache[name] = tex;											//Save ID for later unloading
		
		if(doYFlip == true) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false);	//Stop flipping textures
		return tex;		
	}
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

	gl.fFitScreen = function(wp,hp){ return this.fSetSize(window.innerWidth * (wp||1), window.innerHeight* (hp||1));}
	
	gl.fLoadCubeMap = function(name,imgAry){
		if(imgAry.length != 6)return null;

		var tex = this.createTexture();
		this.bindTexture(this.TEXTURE_CUBE_MAP,tex);

		for(var i=0; i < 6; i++){
			this.texImage2D(this.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, imgAry[i]);
		}

		this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MAG_FILTER, this.LINEAR);	//Setup up scaling
		this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MIN_FILTER, this.LINEAR);	//Setup down scaling
		this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);	//Stretch image to X position
		this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);	//Stretch image to Y position
		this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_R, this.CLAMP_TO_EDGE);	//Stretch image to Z position
		//this.generateMipmap(this.TEXTURE_CUBE_MAP);

		this.bindTexture(this.TEXTURE_CUBE_MAP,null);
		this.mTextureCache[name] = tex;
		return tex;
	}

	return gl;
}
