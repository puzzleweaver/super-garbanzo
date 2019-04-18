// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------

// Create an empty scene
var scene = new THREE.Scene();

// Create a basic perspective camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.set(0.5, 0, 0);
camera.position.set(0, 0, 10);

// Create a renderer with Antialiasing
var cnvs = document.getElementById('cnvs');
var renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: cnvs
});

// Configure renderer clear color
renderer.setClearColor("#000000");

// Configure renderer size
renderer.setSize(window.innerWidth, window.innerHeight);

// Append Renderer to DOM
document.body.appendChild(renderer.domElement);

// ------------------------------------------------
// FUN STARTS HERE
// ------------------------------------------------

function createBoxWithRoundedEdges(width, height, depth, radius0, smoothness) {
    let shape = new THREE.Shape();
    let eps = 0.00001;
    let radius = radius0 - eps;
    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
    shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
    let geometry = new THREE.ExtrudeBufferGeometry(shape, {
        amount: depth - radius0 * 2,
        bevelEnabled: true,
        bevelSegments: smoothness * 2,
        steps: 1,
        bevelSize: radius,
        bevelThickness: radius0,
        curveSegments: smoothness
    });

    geometry.center();

    return geometry;
}

// Create a Cube Mesh with basic material
var arr = undefined, lights = [];
function init_gfx() {
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );//createBoxWithRoundedEdges(1, 1, 1, 0.3, 5);
    var material = new THREE.MeshLambertMaterial({
        color: "#ff00ff"
    });
    var cube = new THREE.Mesh(geometry, material);
    for(var i = 0; i < 4; i++)
        lights.push(new THREE.PointLight(0xffffff, 1, 1000));
    lights[0].position.set(0, 0, 20);
    lights[1].position.set(50, 0, 20);
    lights[2].position.set(0, 50, 20);
    lights[3].position.set(50, 50, 20);
    for(var i = 0; i < lights.length; i++)
        scene.add(lights[i]);
    arr = [];
    for (var i = 0; i < BOARD_WIDTH; i++) {
        arr[i] = [];
        for (var j = 0; j < BOARD_HEIGHT; j++) {
            arr[i][j] = cube.clone();
            arr[i][j].position.set(i, j, 0);
            arr[i][j].material = new THREE.MeshLambertMaterial({
                color: ("hsl(" + Math.floor(Math.random() * 360) + ", 100%, 50%)")
            });
        }
    }
}

function get_x(x, i) {
    return (ps[i].lx - ps[i].x) * ps[i].t / tick + x;
}

function get_y(y, i) {
    return (ps[i].ly - ps[i].y) * ps[i].t / tick + y;
}
// Render Loop
var render = function() {
    requestAnimationFrame(render);

    while (scene.children.length > lights.length) {
        scene.remove(scene.children[scene.children.length-1]);
    }


    if(ps != undefined) {
        console.log("ran");

        camera.position.set(get_x(ps[id].x, id), get_y(ps[id].y, id)-5, 8);

        for (var i = 0; i < BOARD_WIDTH; i++) {
            for (var j = 0; j < BOARD_HEIGHT; j++) {
                if (board[i][j] == -1)
                    continue;
                scene.add(arr[i][j]);
                if (board[i][j] == 0)
                    arr[i][j].material = new THREE.MeshLambertMaterial({
                        color: 'white'
                    });
                else if (ps[board[i][j]] != undefined)
                    arr[i][j].material = new THREE.MeshLambertMaterial({
                        color: ('hsl(' + ps[board[i][j]].color * 360 + ', 100%, 50%)')
                    });
                var ba = boardAssoc[i][j];
                if (ba == undefined || ps[ba] == undefined)
                    arr[i][j].position.set(i, j, 0);
                else {
                    arr[i][j].position.set(get_x(i, ba), get_y(j, ba), 0);
                    if (get_x(i, ba) == i && get_y(j, ba) == j)
                        boardAssoc[i][j] = undefined; // reset things that are done moving
                }
            }
        }
    }

    renderer.render(scene, camera);
};

render();
