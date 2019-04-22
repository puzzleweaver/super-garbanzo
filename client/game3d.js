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
    var width = window.innerWidth,
        height = window.innerHeight;
    if (width / height > aspect_ratio) {
        width = height * aspect_ratio;
    } else {
        height = width / aspect_ratio;
    }
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.rotation.set(0.5, 0, 0);
    renderer.setSize(width, height);
    var spcr = document.getElementById("spcr");
    spcr.style.minHeight = "" + Math.floor((window.innerHeight - height) / 2) + "px";
};
window.onresize(undefined);
document.body.appendChild(renderer.domElement);

function addhh(xof, yof, mesh) {
    mesht = mesh.clone();
    mesht.position.set(mesht.position.x + xof, mesht.position.y + yof, mesht.position.z);
    scene.add(mesht);
}

function addh(xof, yof, mesh) {
    addhh(xof, yof, mesh);
    addhh(xof, yof - BOARD_HEIGHT, mesh);
    addhh(xof, yof + BOARD_HEIGHT, mesh);
    addhh(xof, yof - 2 * BOARD_HEIGHT, mesh);
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
    light.position.set(x, y - 3, 10);
}

var numConstObjs = 0;

function init_gfx() {

    light = new THREE.PointLight(0xffffff, 0.8);
    scene.add(light);
    numConstObjs++;

    var map = new THREE.TextureLoader().load('client/gust.png');
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    var plane_geometry = new THREE.PlaneGeometry(BOARD_WIDTH, BOARD_HEIGHT, 10, 10);
    var plane_material = new THREE.MeshPhongMaterial({
        map: map
    });
    plane_material.anisotropy = renderer.capabilities.getMaxAnisotropy();
    plane_material.map.minFilter = THREE.LinearFilter;
    for(var i = -1; i <= 1; i++) {
        for(var j = -1; j <= 1; j++) {
            var plane = new THREE.Mesh(plane_geometry, plane_material);
            plane.position.set(BOARD_WIDTH*i + (BOARD_WIDTH-1)/2, BOARD_HEIGHT*j + (BOARD_HEIGHT-1)/2, -1/2);
            scene.add(plane);
            numConstObjs++;
        }
    }

    // var lgeometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    // var edges = new THREE.EdgesGeometry( lgeometry );
    // var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { linewidth:5,color: 0xffffff } ) );
    // scene.add( line );
    // numConstObjs++;

    // var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // var geometry = new THREE.SphereGeometry( 0.5, 35, 35 );
    var geometry = createBoxWithRoundedEdges(1, 1, 1, 0.1, 5);
    var material = new THREE.MeshPhongMaterial();
    var cube = new THREE.Mesh(geometry, material);
    arr = [];
    for (var i = 0; i < BOARD_WIDTH; i++) {
        arr[i] = [];
        for (var j = 0; j < BOARD_HEIGHT; j++) {
            arr[i][j] = cube.clone();
            arr[i][j].position.set(i, j, 0);
            arr[i][j].material = new THREE.MeshPhongMaterial();
        }
    }
}

function get_x(x, i) {
    return (ps[i].lx - ps[i].x) * ps[i].t / tick + x;
}

function get_y(y, i) {
    return (ps[i].ly - ps[i].y) * ps[i].t / tick + y;
}

var render = function() {
    requestAnimationFrame(render);

    while (scene.children.length > numConstObjs) {
        scene.remove(scene.children[scene.children.length - 1]);
    }

    if (ps != undefined) {

        set_cam(get_x(ps[id].x, id), get_y(ps[id].y, id));

        for (var i = 0; i < BOARD_WIDTH; i++) {
            for (var j = 0; j < BOARD_HEIGHT; j++) {
                if (board[i][j] == -1)
                    continue;
                if (board[i][j] == 0)
                    arr[i][j].material = new THREE.MeshPhongMaterial({
                        color: 'white',
                    });
                else if (ps[board[i][j]] != undefined)
                    arr[i][j].material = new THREE.MeshPhongMaterial({
                        color: ('hsl(' + ps[board[i][j]].color + ', 100%, 50%)'),
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
