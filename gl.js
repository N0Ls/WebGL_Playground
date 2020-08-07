//Global Constants
const ATTR_POSITION_NAME	= "a_position";
const ATTR_POSITION_LOC		= 0;
const ATTR_NORMAL_NAME		= "a_norm";
const ATTR_NORMAL_LOC		= 1;
const ATTR_UV_NAME			= "a_uv";
const ATTR_UV_LOC			= 2;


function GLInstance(canvasID){
	var canvas = document.getElementById(canvasID);
	var gl = canvas.getContext("webgl2");

	if(!gl){console.error("Web GL context is not available."); return null;}

	//Setup custom properties
	gl.mMeshCache = [];

	//Setup
	gl.clearColor(1.0,1.0,1.0,1.0);

	//Methods
	gl.fClear = function(){this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT); return this;}

	gl.fCreateArrayBuffer = function(floatAry, isStatic){
		if(isStatic === undefined) isStatic = true;

		var buf = this.createBuffer();
		this.bindBuffer(this.ARRAY_BUFFER, buf);
		this.bufferData(this.ARRAY_BUFFER,floatAry, (isStatic)? this.STATIC_DRAW : this.DYNAMIC_DRAW);
		this.bindBuffer(this.ARRAY_BUFFER, null);
		return buf;
	}

	gl.fCreateMeshVAO = function(name,aryInd,aryVert,aryNorm,aryUV){
		var rtn = { drawMode:this.TRIANGLES };

		//Create and bind vao
		rtn.vao = this.createVertexArray();															
		this.bindVertexArray(rtn.vao);	//Bind it so all the calls to vertexAttribPointer/enableVertexAttribArray is saved to the vao.

		//.......................................................
		//Set up vertices
		if(aryVert !== undefined && aryVert != null){
			rtn.bufVertices = this.createBuffer();													//Create buffer...
			rtn.vertexComponentLen = 3;																//How many floats make up a vertex
			rtn.vertexCount = aryVert.length / rtn.vertexComponentLen;								//How many vertices in the array

			this.bindBuffer(this.ARRAY_BUFFER, rtn.bufVertices);
			this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryVert), this.STATIC_DRAW);		//then push array into it.
			this.enableVertexAttribArray(ATTR_POSITION_LOC);										//Enable Attribute location
			this.vertexAttribPointer(ATTR_POSITION_LOC,3,this.FLOAT,false,0,0);						//Put buffer at location of the vao
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
			this.bindBuffer(this.ELEMENT_ARRAY_BUFFER,null);
		}

		//Clean up
		this.bindVertexArray(null);					//Unbind the VAO, very Important. always unbind when your done using one.
		this.bindBuffer(this.ARRAY_BUFFER,null);	//Unbind any buffers that might be set

		this.mMeshCache[name] = rtn;
		return rtn;
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
	return gl;
}
