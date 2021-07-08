import *as THREE from '../three/three.module.js';
import {GLTFLoader} from '../three/GLTFLoader.js';
import {OrbitControls} from '../three/OrbitControls.js';
import {GUI} from '../three/dat.gui.module.js';
import {RGBELoader} from '../three/RGBELoader.js';

let camera, scene, renderer, controls;

// light

let ambientLight, dirLight;

// plane

let plane, grid;

// animation

let object, mixer, clock, action;
let actions = [];
let check1 = false;

// loading

let progressBarDiv;

// raycast
let raycaster,mouse;
// // let raycaster = new THREE.Raycaster();

// let mouse = new THREE.Vector2();

let group, objt;
let count = 1;

let selectedObject = null;
let defaulseColor = null;
// gui

var gui = new GUI();
let params, folder,folder1,textureColor,texturePattern;

// url file glb/gltf
var urlGlb = {
    glb1: "../data/glb/chair.glb",
    glb2: "../data/gltf/2CylinderEngine/2CylinderEngine.gltf",
    glb3: "../data/gltf/CesiumMan/CesiumMan.gltf",
    glb4: "../data/glb/School_Chair.glb",
    glb5: "../data/gltf/uploads_files_2784986_sofa.gltf",
    glb6: "../data/gltf/chair.glb",
    glb7: "../data/glb/uploads_files_2886033_LasVegas.glb",
    glb8: "../data/gltf/vans/vans.gltf",
    glb9: "../data/gltf/vans/blue_sneaker.gltf",
    glb10: "../data/gltf/MaterialsVariantsShoe.gltf",
}
//localhost:3000/data/gltf/vans.gltf
// url panorama cubemap
const urlCube = {
    cube1: '../../data/panorama/cube/cube1/',
    cube2: '../../data/panorama/cube/cube2/',
    cube3: '../../data/panorama/cube/cube3/',

    format: '.jpg',
}

// url panorama equirectangular

var urlEquirectangular = {
    equi1: '../../data/panorama/equirectangular/equi1.jpg',
    equi2: '../../data/panorama/equirectangular/equi2.jpg',
    equi3: '../../data/panorama/equirectangular/equi3.png',
}

// url environment

var urlHdr = {
    hdr1: '../../data/hdr/hdr1.hdr',
    hdr2: '../../data/hdr/hdr2.hdr',
    hdr3: '../../data/hdr/hdr3.hdr',
    hdr4: '../../data/hdr/hdr4.hdr',
};

// url texture

var urlTexture = {
    texture1: '../data/texture/texture1',
    texture2: '../data/texture/texture2',
    texture3: '../data/texture/texture3',
    texture4: '../data/texture/1',
    texture5: '../data/texture/2',
    texture6: '../data/texture/15',
    texture7: '../data/texture/4',
    texture8: '../data/texture/5',
    texture9: "../data/texture/camo",
    texture10: "../data/texture/ghost",
    texture11: "../data/texture/checkerboard",

    format1: '.jpg',
    format2: '.png',
}

// path file gltf

var path = window.location.pathname;
const urlParams = new URLSearchParams(window.location.search);
const filePathUrl = urlParams.get('url');
const filePathName = urlParams.get('file');
const filePathFormat = urlParams.get('format');

var pathGltf = '../data/gltf/' + filePathUrl + '/' + filePathName + filePathFormat;

console.log(path, filePathUrl, filePathName, filePathFormat)

init()
animate();

function init() {
    _initGp();

    window.addEventListener( "mousemove", _mouseMove, false );
    
    window.addEventListener( "mouseup", _mouseup, false );

    window.addEventListener( 'resize', onWindowResize, false );

    progressBarDivs();

    _loadGLTF();

}

function _initGp() {

    // Creating the scene

    scene = new THREE.Scene();
    scene.background = new THREE.Color('white');

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(0, 0.5, 1);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    clock = new THREE.Clock();

    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    _light();
    _orbitControl();
    _plane();
}

function _light() {

    // Creating the ambient light

    ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
    scene.add(ambientLight)

    // Creating the directional light
    
    dirLight = new THREE.DirectionalLight( '#ffffff', 1.5 );
    dirLight.castShadow = true;
    dirLight.shadow.radius = 4;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40; 

    scene.add(dirLight);
}

function _orbitControl() {

    // OrbitControls

    controls = new OrbitControls( camera, renderer.domElement );
}

function _mouseMove ( event ) {
    group = [];
    group.push(object);

    // console.log(defaulseColor)

    if ( selectedObject ) {

        selectedObject.material.color.set( defaulseColor );
        selectedObject = null;

    }
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( group, true );

    if ( intersects.length > 0 ) {

        const res = intersects.filter( function ( res ) {

            return res && res.object;

        } )[ 0 ];

        if ( res && res.object ) {

            defaulseColor = '#' + res.object.material.color.getHexString()
            // console.log(defaulseColor)

            selectedObject = res.object;
            selectedObject.material.color.set( '#cfedd5' );

        }


    }    
}

function _mouseup( event ) {    
    group = [];
    group.push(object);

    if ( selectedObject ) {

        selectedObject = null;

    }

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both component
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( group, true );

    if ( intersects.length > 0 ) {

        const res = intersects.filter( function ( res ) {

            return res && res.object;

        } )[ 0 ];

        if ( res && res.object ) {

            selectedObject = res.object;
            _addGuiMaterial(selectedObject)
        }
    }
}

function _plane() {
    
    // Creating the plan and grid
    const planeGeo = new THREE.PlaneBufferGeometry(3, 3);
    const planeMat = new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } );
    plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = - Math.PI / 2;
    plane.position.y = - 0.5;
    plane.receiveShadow = true;
    plane.visible = false;
    scene.add(plane);

    grid = new THREE.GridHelper( 3,3, 0x000000, 0x000000 );
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    grid.visible = false;
    scene.add( grid );
}
function centralize (object) {

    // center object
    let boundingBox = new THREE.Box3().setFromObject(object);

    let size = new THREE.Vector3();
    boundingBox.getSize(size);

    let scale = Math.max(size.x, size.y, size.z);
    object.scale.set(1/scale, 1/scale, 1/scale);

    let centerbox = new THREE.Vector3();
    boundingBox.setFromObject(object);

    let _centerbox = boundingBox.getCenter(centerbox);
    object.position.sub(_centerbox);
}

function progressBarDivs() {
    
    // Creating the div 'Loading'
    progressBarDiv = document.createElement( 'div' );
    progressBarDiv.innerText = "Loading...";
    progressBarDiv.style.fontSize = "3em";
    progressBarDiv.style.color = "#888";
    progressBarDiv.style.display = "block";
    progressBarDiv.style.position = "absolute";
    progressBarDiv.style.top = "50%";
    progressBarDiv.style.width = "100%";
    progressBarDiv.style.textAlign = "center";
}

function _loadGLTF() {

    updateProgressBar( 0 );
    showProgressBar();

    // load file gltf
    var loader = new GLTFLoader();

    // path file gltf
    // var pathGltf = '../../upload/gltf/' + filePathUrl + '/' + filePathName + filePathFormat;
    // ../../upload/gltf/glb/test1.1.glb
    // urlGlb.glb8

    loader.load(pathGltf, 
        (gltf) => {
            object = gltf.scene;
            centralize(object);

            object.traverse((obj) => {
                if(obj.isMesh) {         
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                }
            })

            
            _guiPlane();
            _guiLight();

            _guiPanorama(); 
            
            scene.add(object);

            hideProgressBar();

        },

        // called while loading is progressing
        onProgress,

        // called when loading has errors
        onError,
    );

}

function _addGuiMaterial (obj) {
    
    // console.log(folder1)
    let _name = 'Material ' + obj.name
    // console.log( folder.name)
    if ( folder1 ) {
        _removeGui()
        gui.removeFolder(folder1);
        folder1 = null;
    }

    _guiMaterial(obj);
    folder1.open()

}

function _removeGui() {
    // console.log(texturePattern)
    if (texturePattern) {
        folder1.remove(texturePattern)
        texturePattern = null
    }

    if (textureColor) {
        folder1.remove(textureColor);
        textureColor = null;
    }
}

function _guiMaterial(obj) {
    _removeGui()
    // console.log(obj)
    params = {
        color : '#ffffff',
        texture: 'null',
    }

    folder1 = gui.addFolder('Material ' + obj.name);
    
    textureColor = folder1.addColor(params, 'color').onChange( function(colorValue) {
        obj.material.color.set(colorValue);
    });

    texturePattern = folder1.add(params, 'texture', 
    ['texture1', 'texture2', 'texture3', 'texture4', 'texture5',
     'texture6', 'texture7', 'texture8', 'texture9', 'texture10', 'texture11'])
    .onChange((value) => {
        switch(value) {
            case 'texture1':
                obj.material = new THREE.MeshStandardMaterial( {
                    map: loadTexture(urlTexture.texture1, urlTexture.format1),
                })
                break;
            case 'texture2':
                obj.material = new THREE.MeshStandardMaterial({
                    map : loadTexture(urlTexture.texture2, urlTexture.format1),
                })
                break;
            case 'texture3':
                obj.material = new THREE.MeshStandardMaterial({
                    map : loadTexture(urlTexture.texture3, urlTexture.format1),
                })
                break;
            case 'texture4':
                obj.material = new THREE.MeshStandardMaterial({
                    map : loadTexture(urlTexture.texture4, urlTexture.format1),
                })
                break;
            case 'texture5':
                obj.material = new THREE.MeshStandardMaterial({
                    map : loadTexture(urlTexture.texture5, urlTexture.format1),
                })
                break;
            case 'texture6':
                obj.material = new THREE.MeshStandardMaterial({
                    map : loadTexture(urlTexture.texture6, urlTexture.format1),
                })
                break;
            case 'texture7':
                obj.material = new THREE.MeshStandardMaterial({
                    map : loadTexture(urlTexture.texture7, urlTexture.format1),
                })
                break;
            case 'texture8':
                obj.material = new THREE.MeshStandardMaterial({
                    map : loadTexture(urlTexture.texture8, urlTexture.format1),
                })
                break; 
            case 'texture9':
                obj.material = new THREE.MeshStandardMaterial({
                    map : loadTexture(urlTexture.texture9, urlTexture.format1),
                })
                break;        
            case 'texture10':
                obj.material = new THREE.MeshStandardMaterial({
                    map : loadTexture(urlTexture.texture10, urlTexture.format1),
                })
                break;         
            case 'texture11':
            obj.material = new THREE.MeshStandardMaterial({
                map : loadTexture(urlTexture.texture11, urlTexture.format1),
            })
            break; 
        }
    })
}

function _guiAnimation() {
    
    // add gui pause/continue animation
    params = {
        'pause/continue': pauseContinue,
    }

    folder = gui.addFolder('Pausing/Continue');

    folder.add(params, ('pause/continue'));

}

function _guiPlane() {

    // add gui plane
    params = {
        Plane: 'Disable plane',
        Grid: 'Disable grid',

        planex: -1,
        planey: -1,
        planez: -1,

        gridx: -1,
        gridy: -1,
        gridz: -1,
    }

    folder = gui.addFolder('Plane');

    folder.add(params, 'Plane', ['Enable plane', 'Disable plane']).onChange(updatePlane);
    folder.add(params, 'Grid', ['Enable grid', 'Disable grid']).onChange(updatePlane);

    folder = gui.addFolder('Plane direction');

    folder.add(params, 'planex', -1, 1).name('plane direction x').onChange( (value) => {
        plane.position.x = value;
    } );

    folder.add(params, 'planey', -1, 1).name('plane direction y').onChange( (value) => {
        plane.position.y = value;
    } );

    folder.add(params, 'planez', -1, 1).name('plane direction z').onChange( (value) => {
        plane.position.z = value;
    } );

    folder.add(params, 'gridx', -1, 1).name('grid direction x').onChange( (value) => {
        grid.position.x = value;
    } );

    folder.add(params, 'gridy', -1, 1).name('grid direction y').onChange( (value) => {
        grid.position.y = value;
    } );

    folder.add(params, 'gridz', -1, 1).name('grid direction z').onChange( (value) => {
        grid.position.z = value;
    } );
}

function _guiLight() {

    // add gui light
    params = {
        lightX: - 1,
        lightY: - 1,
        lightZ: - 1,

        color: '#ffffff',

        intensity_d: dirLight.intensity,
        intensity_a: ambientLight.intensity,
    }

    folder = gui.addFolder('Light color');

    folder.add(params, 'intensity_d', -0.5, 2).name('intensity_d').onChange((value) => {
        dirLight.intensity = value

    })

    folder.add(params, 'intensity_a', -0.5, 2).name('intensity_a').onChange((value) => {
        ambientLight.intensity = value

    })

    folder.addColor( params, 'color', -1, 1 ).name( 'Light color' ).onChange((value) => {
        dirLight.color.set(value)
    })

    folder = gui.addFolder('Light direction');

    folder.add( params, 'lightX', - 1, 1 ).name( 'light direction x' ).onChange( function ( value ) {

        dirLight.position.x = value;

    } );

    folder.add( params, 'lightY', - 1, 1 ).name( 'light direction y' ).onChange( function ( value ) {

        dirLight.position.y = value;

    } );

    folder.add( params, 'lightZ', - 1, 1 ).name( 'light direction z' ).onChange( function ( value ) {

        dirLight.position.z = value;

    } );
}

function _guiShadow() {
    
    // gui shadow
    params = {  
        radius : 4,      
        shadowTop: 2,
        shadowBottom: -2,
        shadowLeft: -2,
        shadowRight: 2,
        shadowFar: 40,
        shadowNear: 0.1,
    };

    folder = gui.addFolder('Shadow direction');

    folder.add(params, 'radius', 2, 8).onChange((value) => {
        dirLight.shadow.radius = value;
    })

    folder.add(params, 'shadowTop', -10, 10).onChange((value) => {
        dirLight.shadow.camera.top = value;
    })

    folder.add(params, 'shadowBottom', -10, 10).onChange((value) => {
        dirLight.shadow.camera.bottom  = value;
    })

    folder.add(params, 'shadowLeft', -10, 10).onChange((value) => {
        dirLight.shadow.camera.left  = value;
    })

    folder.add(params, 'shadowRight', -10, 10).onChange((value) => {
        dirLight.shadow.camera.right  = value;
    })

    folder.add(params, 'shadowFar', 10, 100).onChange((value) => {
    console.log(dirLight.shadow.camera.far)
    dirLight.shadow.camera.far = value;
    })

    folder.add(params, 'shadowNear', -1, 1).onChange((value) => {
        dirLight.shadow.camera.near = value;
    })

    console.log(dirLight.shadow.camera.far)
}

function _guiPanorama() {

    // add gui panorama
    params = {
        None: "null",
        Cube: 'null',
        Equirectangular: 'null',
        Envinronment: 'null',
    }

    folder = gui.addFolder('Panorama');

    folder.add(params, 'Cube', ['None', 'Cube1', 'Cube2', 'Cube3']).onChange(_updatePanorama);
    folder.add(params, 'Equirectangular', ['None', 'Equirectangular1', 'Equirectangular2', 'Equirectangular3']).onChange(_updatePanorama);
    folder.add(params, 'Envinronment', ['None', 'Envinronment1', 'Envinronment2', 'Envinronment3', 'Envinronment4']).onChange(_updatePanorama);
}


function _updatePanorama(value) {

    // update panorama
    switch(value) {
        case 'None': 
            panoramaNone()
            console.log(scene.background)
            break;
        case 'Cube1':
            panoramaCube(urlCube.cube1, urlCube.format);
            console.log(scene.background)
            break;
        case 'Cube2':
            panoramaCube(urlCube.cube2, urlCube.format);
            break;
        case 'Cube3':
            panoramaCube(urlCube.cube3, urlCube.format);
            break;

        case 'Equirectangular1':
            panoramaEquirectanggular(urlEquirectangular.equi1);
            break;
        case 'Equirectangular2':
            panoramaEquirectanggular(urlEquirectangular.equi2);
            break;
        case 'Equirectangular3':
            panoramaEquirectanggular(urlEquirectangular.equi3);
            break;

        case 'Envinronment1':
            environment(urlHdr.hdr1);
            break;
        case 'Envinronment2':
            environment(urlHdr.hdr2);
            break;
        case 'Envinronment3':
            environment(urlHdr.hdr3);
            break;
        case 'Envinronment4':
            environment(urlHdr.hdr4);
            break;
    }
}

function loadTexture(url, format) {

    // load texture
    var textureLoader = new THREE.TextureLoader();
    var text = textureLoader.load(url + format);
    text.encoding = THREE.sRGBEncoding;
    text.flipY = false;

    return text;
}

function panoramaNone() {
    scene.background = new THREE.Color('white');
}

function panoramaCube(url, format) {

    // panorama cubemap
    var urls = [
        url + 'posx' + format, url + 'negx' + format,
        url + 'posy' + format, url + 'negy' + format,
        url + 'posz' + format, url + 'negz' + format
    ];

    var textureCube = new THREE.CubeTextureLoader().load( urls );
    textureCube.mapping = THREE.CubeRefractionMapping;

    scene.background = textureCube;

}

function panoramaEquirectanggular(url) {

    // panorama equirectanggular
    const textureLoader = new THREE.TextureLoader();

    var textureEquirec = textureLoader.load( url );
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
    textureEquirec.encoding = THREE.sRGBEncoding;

    scene.background = textureEquirec;
}
function environment(url) {

    // environment EquirectangularShader
    var pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    var loader =  new RGBELoader();
    loader.setDataType(THREE.UnsignedByteType)
    loader.load(url, (hdrTextures) => {

        var hdrEqiTarget = pmremGenerator.fromEquirectangular(hdrTextures).texture;

        // scene.background = hdrEqiTarget
        scene.environment = hdrEqiTarget

        hdrEqiTarget .dispose();
        pmremGenerator.dispose();

    })
}

function updatePlane(value) {

    // update plane
    switch(value) {
        case 'Enable plane':
            enablePlane();
            break;
        case 'Disable plane':
            disablePlane()
            break;

        case 'Enable grid':
            enableGrid();
            break;
        case 'Disable grid':
            disableGrid();
            break;
    }
}

function enablePlane() {
    plane.visible = true;
}

function disablePlane() {
    plane.visible = false;
}

function enableGrid() {
    grid.visible = true;
}

function disableGrid() {
    grid.visible = false;
}

function pauseContinue() {

    // pause and continue animation
    if (check1) {
        check1 = false;
        unPauseAllActions();
    } else {
        if (actions[0].paused) {
            unPauseAllActions();
        } else {
            check1 = true
            pauseAllActions();
        }
    }
}

function pauseAllActions() {
    actions.forEach((act) => {
        act.paused = true;
    })
}

function unPauseAllActions() {
    actions.forEach((act) => {
        act.paused = false;
    })

}

function activateAllActions() {
    for(let i = 0; i < actions.length; i++) {
        actions[i].play();
    }
}

function onProgress( xhr ) {

    if ( xhr.lengthComputable ) {

        updateProgressBar( xhr.loaded / xhr.total );

        // console.log( Math.round( xhr.loaded / xhr.total * 100, 2 ) + '% downloaded' );

    }

}

function onError() {

    const message = "Error loading model";
    progressBarDiv.innerText = message;
    console.log( message );

}

function showProgressBar() {

    document.body.appendChild( progressBarDiv );

}

function hideProgressBar() {

    document.body.removeChild( progressBarDiv );

}

function updateProgressBar( fraction ) {

    progressBarDiv.innerText = 'Loading... ' + Math.round( fraction * 100, 2 ) + '%';

}

function onWindowResize() {

    // resize window
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    animate();
}

function render() {

    renderer.render( scene, camera );

}

function animate() {
    requestAnimationFrame( animate );

    if ( mixer ) {
        mixer.update( clock.getDelta() );
    }

    render();
}