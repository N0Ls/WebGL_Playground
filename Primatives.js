var Primatives = {};

Primatives.Quad = class {
	static createModal(gl){ return new Modal(Primatives.Quad.createMesh(gl)); }
	static createMesh(gl){
		var aVert = [ -0.5,0.5,0, -0.5,-0.5,0, 0.5,-0.5,0, 0.5,0.5,0 ],
			aUV = [ 0,0, 0,1, 1,1, 1,0 ],
			aIndex = [ 0,1,2, 2,3,0 ];
		var mesh = gl.fCreateMeshVAO("Quad",aIndex,aVert,null,aUV);
		mesh.noCulling = true;
		mesh.doBlending = true;

		return mesh;
	}
}

Primatives.MultiQuad = class {
	static createModal(gl){ return new Modal(Primatives.MultiQuad.createMesh(gl)); }
	static createMesh(gl){
		var	aIndex = [ ], //0,1,2, 2,3,0
			aUV = [ ], //0,0, 0,1, 1,1, 1,0 
			aVert = [];		

		for(var i=0; i < 10; i++){
			//Calculate a random size, y rotation and position for the quad
			var size = 0.2 + (0.8* Math.random()),		//Random Quad Size in the range of 0.2 - 1.0
				half = size * 0.5,						//Half of size, this is the radius for rotation
				angle = Math.PI * 2 * Math.random(),	//Random angle between 0 - 360 degrees in radians
				dx = half * Math.cos(angle),			//Calc the x distance, used as an offset for the random position
				dy = half * Math.sin(angle),			//Calc the y distance, for same offset but used in z 
				x = -2.5 + (Math.random()*5),			//Random position between -2.5 - 2.5
				y = -2.5 + (Math.random()*5),			
				z = 2.5 - (Math.random()*5),
				p = i * 4;								//Index of the first vertex of a quad

			//Build the 4 points of the quad
			aVert.push(x-dx, y+half, z-dy);		//TOP LEFT
			aVert.push(x-dx, y-half, z-dy);		//BOTTOM LEFT
			aVert.push(x+dx, y-half, z+dy);		//BOTTOM RIGHT			
			aVert.push(x+dx, y+half, z+dy);		//TOP RIGHT

			aUV.push(0,0, 0,1, 1,1, 1,0);		//Quad's UV
			aIndex.push(p,p+1,p+2, p+2,p+3,p);	//Quad's Index
		}

		var mesh = gl.fCreateMeshVAO("MultiQuad",aIndex,aVert,null,aUV);
		mesh.noCulling = true;
		mesh.doBlending = true;
		return mesh;
	}
}

Primatives.GridAxis = class{
	static createModal(gl, inclAxis){ return new Modal(Primatives.GridAxis.createMesh(gl, inclAxis)); }
	static createMesh(gl, inclAxis){
		//Dynamiclly create a grid
		var verts = [],
			size = 1.8,			// W/H of the outer box of the grid, from origin we can only go 1 unit in each direction, so from left to right is 2 units max
			div = 10.0,			// How to divide up the grid
			step = size / div,	// Steps between each line, just a number we increment by for each line in the grid.
			half = size / 2;	// From origin the starting position is half the size.

				var p;	//Temp variable for position value.
		
		for(var i=0; i <= div; i++){
			//Vertical line
			p = -half + (i * step);
			verts.push(p);		//x1
			verts.push(0);		//y1 verts.push(half);
			verts.push(half);	//z1 verts.push(0);
			verts.push(0);		//c2

			verts.push(p);		//x2
			verts.push(0);		//y2 verts.push(-half);
			verts.push(-half);	//z2 verts.push(0);	
			verts.push(0);		//c2 verts.push(1);

			//Horizontal line
			p = half - (i * step);
			verts.push(-half);	//x1
			verts.push(0);		//y1 verts.push(p);
			verts.push(p);		//z1 verts.push(0);
			verts.push(0);		//c1

			verts.push(half);	//x2
			verts.push(0);		//y2 verts.push(p);
			verts.push(p);		//z2 verts.push(0);
			verts.push(0);		//c2 verts.push(1);
		}

		if(inclAxis){
			//x axis
			verts.push(-1.1);	//x1
			verts.push(0);		//y1
			verts.push(0);		//z1
			verts.push(1);		//c2

			verts.push(1.1);	//x2
			verts.push(0);		//y2
			verts.push(0);		//z2
			verts.push(1);		//c2

			//y axis
			verts.push(0);//x1
			verts.push(-1.1);	//y1
			verts.push(0);		//z1
			verts.push(2);		//c2

			verts.push(0);		//x2
			verts.push(1.1);	//y2
			verts.push(0);		//z2
			verts.push(2);		//c2

			//z axis
			verts.push(0);		//x1
			verts.push(0);		//y1
			verts.push(-1.1);	//z1
			verts.push(3);		//c2

			verts.push(0);		//x2
			verts.push(0);		//y2
			verts.push(1.1);	//z2
			verts.push(3);		//c2
		}

		var attrColorLoc = 4,
		strideLen,
		mesh = {drawMode:gl.LINES, vao:gl.createVertexArray()};

		mesh.vertexComponentLen = 4;
		mesh.vertexCount = verts.length / mesh.vertexComponentLen;
		strideLen = Float32Array.BYTES_PER_ELEMENT * mesh.vertexComponentLen;

		mesh.bufVertices = gl.createBuffer();
		gl.bindVertexArray(mesh.vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bufVertices);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(ATTR_POSITION_LOC);
		gl.enableVertexAttribArray(attrColorLoc);

		gl.vertexAttribPointer(
			ATTR_POSITION_LOC
			,3
			,gl.FLOAT
			,false
			,strideLen
			,0
		);

		gl.vertexAttribPointer(
			attrColorLoc
			,1
			,gl.FLOAT
			,false
			,strideLen
			,Float32Array.BYTES_PER_ELEMENT * 3
		);

		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.mMeshCache["grid"] = mesh;

		return mesh;
	}
}