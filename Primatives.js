var Primatives = {};

Primatives.GridAxis = class{
	static createMesh(gl){
		var verts = [0,0.5,0,0,  0,-0.5,0,1];

		var attrColorLoc =4,
		strideLen,
		mesh = {drawMode:gl.LINES, vao:gl.createVertexArray()};

		mesh.vertexComponentLen =4;
		mesh.vertexCount = verts.lenght / mesh.vertexComponentLen;
		strideLen = Float32Array.BYTES_PER_ELEMENT * mesh.vertexComponentLen;

		mesh.bufVertices = gl.createBuffer();
		gl.bindVertexArray(mesh.vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bufVertices);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIc_DRAW);
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
	}
}