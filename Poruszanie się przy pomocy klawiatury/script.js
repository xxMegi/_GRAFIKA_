console.error('works');

vertexShaderTxt = `
precision mediump float;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProjection;

attribute vec3 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

void main() {
    fragColor = vertColor;
    gl_Position = mProjection * mView * mWorld * vec4(vertPosition, 1.0);  
}
`
const fragmentShaderTxt = `
precision mediump float;

varying vec3 fragColor;

void main() {
    gl_FragColor = vec4(fragColor, 1.0);
}
`

const mat4 = glMatrix.mat4;


const generateBox = (position, size) => {
    const [x, y, z] = position;
    const s = size / 2;

    const boxVertices =
        [
            -s, s, -s,
            -s, s, s,
            s, s, s,
            s, s, -s,
            -s, -s, s,
            -s, -s, -s,
            s, -s, s,
            s, -s, -s,
        ];

    for (let i = 0; i < boxVertices.length; i += 3) {
        boxVertices[i] += x;
        boxVertices[i + 1] += y;
        boxVertices[i + 2] += z;
    }
    return boxVertices;
}

const Triangle = function ()
{
    const canvas = document.getElementById('main-canvas');
    const gl = canvas.getContext('webgl');
    let canvasColor = [1.0, 0.75, 0.8];

    checkGl(gl);

    gl.clearColor(...canvasColor, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderTxt);
    gl.shaderSource(fragmentShader, fragmentShaderTxt);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    checkShaderCompile(gl, vertexShader);
    checkShaderCompile(gl, fragmentShader);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    checkLink(gl, program);

    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);

    gl.validateProgram(program);

    const boxIndices =
        [
            // Top
            0, 1, 2,
            0, 2, 3,

            // Left
            4, 1, 5,
            5, 1, 0,

            // Right
            2, 6, 7,
            2, 7, 3,

            // Front
            6, 2, 4,
            1, 4, 2,

            // Back
            3, 7, 5,
            3, 5, 0,

            // Bottom
            4, 5, 6,
            6, 5, 7,
        ];

    let colors = [
        1.0, 0.0, 1.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        1.0, 1.0, 1.0,

        1.0, 0.0, 1.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        1.0, 1.0, 1.0,

        1.0, 0.0, 1.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        1.0, 1.0, 1.0,

        1.0, 0.0, 1.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        1.0, 1.0, 1.0,

        1.0, 0.0, 1.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        1.0, 1.0, 1.0,

        1.0, 0.0, 1.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        1.0, 1.0, 1.0,
    ]

    const position = [0.0, 0.0, 0.0];
    const boxVertices = generateBox(position, 2.0);

    const boxVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    const boxIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    const posAttrLoc = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(
        posAttrLoc,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.enableVertexAttribArray(posAttrLoc);

    const triangleColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const colorAttrLoc = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
        colorAttrLoc,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.enableVertexAttribArray(colorAttrLoc);

    // render time

    gl.useProgram(program);

    const worldMatLoc = gl.getUniformLocation(program, 'mWorld');
    const viewMatLoc = gl.getUniformLocation(program, 'mView');
    const projMatLoc = gl.getUniformLocation(program, 'mProjection');

    const worldMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const projMatrix = mat4.create();

    let cameraPos = [0, 0, -4];
    mat4.lookAt(viewMatrix, cameraPos, [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(90), canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(worldMatLoc, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(viewMatLoc, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(projMatLoc, gl.FALSE, projMatrix);

    const identityMat = mat4.create();
    const translationMat = mat4.create();
    const rotationMat = mat4.create();

    document.addEventListener('keydown', function(event) {
        const cameraSpeed = 0.1;
        switch(event.key) {
            case 'ArrowUp':
                cameraPos[1] += cameraSpeed;
                break;
            case 'ArrowDown':
                cameraPos[1] -= cameraSpeed;
                break;
            case 'ArrowLeft':
                cameraPos[0] -= cameraSpeed;
                break;
            case 'ArrowRight':
                cameraPos[0] += cameraSpeed;
                break;
        }
        mat4.lookAt(viewMatrix, cameraPos, [0, 0, 0], [0, 1, 0]);
        gl.uniformMatrix4fv(viewMatLoc, gl.FALSE, viewMatrix);
    });

    const loop = function () {
        angle = performance.now() / 1000 / 60 * 23 * Math.PI;

        mat4.identity(worldMatrix);

        mat4.translate(worldMatrix, worldMatrix, position);
        mat4.rotateY(worldMatrix, worldMatrix, angle);
        mat4.translate(worldMatrix, worldMatrix, position.map(coord => -coord));

        gl.uniformMatrix4fv(worldMatLoc, gl.FALSE, worldMatrix);

        gl.clearColor(...canvasColor, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

function checkGl(gl)
{
    if (!gl) { console.log('WebGL not supported, use another browser'); }
}

function checkShaderCompile(gl, shader)
{
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('shader not compiled', gl.getShaderInfoLog(shader));
    }
}

function checkLink(gl, program) {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
    }
}