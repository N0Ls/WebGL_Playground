var Primatives = {};

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