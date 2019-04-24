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

function add(mesh) {
    for(var x = -1; x <= 1; x++) {
        for(var y = -2; y <= 1; y++) {
            var mesht = mesh.clone();
            mesht.position.set(mesht.position.x + x*BOARD_WIDTH, mesht.position.y + y*BOARD_HEIGHT, mesht.position.z);
            scene.add(mesht);
        }
    }
}

// Create a Cube Mesh with basic material
var arr = undefined,
    light;

function set_cam(x, y) {
    camera.position.set(x, y-5, 8);
    light.position.set(x, y - 3, 10);
}

var numConstObjs = 0;
var box, rbox, sphere, wiref; // reusable meshes

function init_gfx() {

    while (scene.children.length > 0) {
        scene.remove(scene.children[scene.children.length - 1]);
    }

    light = new THREE.PointLight(0xffffff, 0.8);
    scene.add(light);
    numConstObjs++;

    var map = new THREE.TextureLoader().load('client/gust' + (Math.random() < 0.3 ? "2":"") + '.png');
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

    var lgeometry = new THREE.BoxBufferGeometry( 0.8, 0.8, 0.8 );
    var edges = new THREE.EdgesGeometry( lgeometry );
    wiref = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );

    var material = new THREE.MeshPhongMaterial();
    box = new THREE.Mesh(new THREE.BoxGeometry( 1, 1, 1 ), material);
    sphere = new THREE.Mesh(new THREE.SphereGeometry( 0.5, 35, 35 ), material);
    rbox = new THREE.Mesh(createBoxWithRoundedEdges(1, 1, 1, 0.1, 5), material);
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

        console.log(ps[id].pk);

        set_cam(get_x(ps[id].x, id), get_y(ps[id].y, id));

        for (var i = 0; i < BOARD_WIDTH; i++) {
            for (var j = 0; j < BOARD_HEIGHT; j++) {
                // if space is empty
                if (board[i][j] == -1 || (board[i][j] != 0 &&
                        ps[board[i][j]].x == i && ps[board[i][j]].y == j))
                    continue;

                // calculate offset if being pushed
                var x, y;
                var ba = boardAssoc[i][j];
                if (ba == undefined || ps[ba] == undefined) {
                    x = i;
                    y = j;
                    boardAssoc[i][j] = undefined;
                } else {
                    x = get_x(i, ba);
                    y = get_y(j, ba);
                    if (get_x(i, ba) == i && get_y(j, ba) == j)
                        boardAssoc[i][j] = undefined; // reset things that are done moving
                }

                // if space is unowned box
                if (board[i][j] == 0) {
                    box.material = new THREE.MeshPhongMaterial({
                        color: 'white',
                    });
                    box.position.set(x, y, 0);
                    add(box);
                } else if (ps[board[i][j]] != undefined) {
                    // sphere
                    sphere.material = new THREE.MeshPhongMaterial({
                        color: ('hsl(' + ps[board[i][j]].color + ', 100%, 50%)'),
                    });
                    sphere.position.set(x, y, 0);
                    add(sphere);

                    for(var a = -ps[board[i][j]].r; a <= ps[board[i][j]].r; a++) {
                        for(var b = -ps[board[i][j]].r; b <= ps[board[i][j]].r; b++) {
                            wiref.material = new THREE.LineBasicMaterial({
                                color: ('hsl(' + ps[board[i][j]].color + ', 50%, 50%)'),
                            });
                            wiref.position.set(x+a, y+b, 0);
                            wiref.rotation.set(Math.random(), Math.random(), Math.random());
                            add(wiref);
                        }
                    }
                }
            }
        }

        for(i in ps) {
            rbox.material = new THREE.MeshPhongMaterial({
                color: ('hsl(' + ps[i].color + ', 100%, 50%)'),
            });
            rbox.position.set(get_x(ps[i].x, i), get_y(ps[i].y, i), 0);
            add(rbox);
        }
    }

    renderer.render(scene, camera);
};

render();
