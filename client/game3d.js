// set up three.js
var scene = new THREE.Scene();
var aspect_ratio = 1.5;
var camera;
var cnvs = document.getElementById('cnvs');
var renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: cnvs
});
renderer.setClearColor("#000000");

window.onresize = function(event) {
    var width = window.innerWidth, height = window.innerHeight;
    if(width/height > aspect_ratio) {
        width = height*aspect_ratio;
    }else {
        height = width/aspect_ratio;
    }
    camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
    camera.rotation.set(0.5, 0, 0);
    renderer.setSize(width, height);
    var spcr = document.getElementById("spcr");
    spcr.style.minHeight = ""+Math.floor((window.innerHeight-height)/2) + "px";
};
window.onresize(undefined);
document.body.appendChild(renderer.domElement);

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

function addhh(xof, yof, mesh) {
    mesht = mesh.clone();
    mesht.position.set(mesht.position.x + xof, mesht.position.y + yof, mesht.position.z);
    scene.add(mesht);
}
function addh(xof, yof, mesh) {
    addhh(xof, yof, mesh);
    addhh(xof, yof-BOARD_HEIGHT, mesh);
    addhh(xof, yof+BOARD_HEIGHT, mesh);
    addhh(xof, yof-2*BOARD_HEIGHT, mesh);
}

function add(mesh) {
    addh(0, 0, mesh);
    addh(BOARD_WIDTH, 0, mesh);
    addh(-BOARD_WIDTH, 0, mesh);
}

// Create a Cube Mesh with basic material
var arr = undefined,
    light;

function set_cam(x, y) {
    camera.position.set(x, y-5, 8);
    light.position.set(x, y-3, 10);
}

function init_gfx() {
    //new THREE.BoxGeometry( 1, 1, 1 );//
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );//createBoxWithRoundedEdges(1, 1, 1, 0.3, 5);
    var material = new THREE.MeshLambertMaterial({
        color: "#ff00ff"
    });
    var cube = new THREE.Mesh(geometry, material);

    light = new THREE.PointLight( 0xffffff, 0.8 );
    scene.add( light );

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
    geometry = new THREE.BoxGeometry(BOARD_WIDTH * 3, BOARD_HEIGHT * 3, 1);
    material = new THREE.MeshLambertMaterial({
        color: "#ff00ff"
    });
    cube = new THREE.Mesh(geometry, material);
    cube.position.set((BOARD_WIDTH - 1) / 2, (BOARD_HEIGHT - 1) / 2, -1);
    scene.add(cube);
}

function get_x(x, i) {
    return (ps[i].lx - ps[i].x) * ps[i].t / tick + x;
}

function get_y(y, i) {
    return (ps[i].ly - ps[i].y) * ps[i].t / tick + y;
}

var render = function() {
    requestAnimationFrame(render);

    while (scene.children.length > 2) {
        scene.remove(scene.children[scene.children.length - 1]);
    }

    if (ps != undefined) {

        set_cam(get_x(ps[id].x, id), get_y(ps[id].y, id));

        for (var i = 0; i < BOARD_WIDTH; i++) {
            for (var j = 0; j < BOARD_HEIGHT; j++) {
                if (board[i][j] == -1)
                    continue;
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
                add(arr[i][j]);
            }
        }
    }

    renderer.render(scene, camera);
};

render();
