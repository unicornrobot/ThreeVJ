import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
//-----------------	Bolier Plate	-----------------
import threeAnimationSystem from './BoilerPlate/threeAnimationSystem.js';
import pixelMaper from './BoilerPlate/pixelMaper.js';								
import threeSpiralTrails from './BoilerPlate/threeSpiralTrails.js';								
import threeLineSphere from './BoilerPlate/threeLineSphere.js';
import threeToroid from './BoilerPlate/threeToroid.js';								
import threeOrbitalBeams from './BoilerPlate/threeOrbitalBeams.js';
import animationObject from './BoilerPlate/animationObject.js';					
import THREEJS_Helpers from './BoilerPlate/THREEJS_Helpers.js';
import threeNovas from './BoilerPlate/threeNovas.js';
import threeOrbitalPulses from './BoilerPlate/threeOrbitalPulses.js';
import threeBoxFaces from './BoilerPlate/threeBoxFaces.js';
import threeJellyFish from './BoilerPlate/threeJellyFish.js';
import threePollyTrails from './BoilerPlate/threePollyTrails.js';

//-----------------		MIDI INPUT SET UP		-----------------
/*
REPLACE "Launch Control XL" with whatever your MIDI controller is called when you 1st load this app in the bedbug console: eg this is output from mine:

Manufacturer[Microsoft Corporation]	Name[LPX MIDI]	ID[output-1]
Manufacturer[Microsoft Corporation]	Name[MIDIOUT2 (LPX MIDI)]	ID[output-2]
Manufacturer[Microsoft Corporation]	Name[Launch Control XL]	ID[output-3]				<----- this is the one im using for all the main CC controlls
Manufacturer[Microsoft Corporation]	Name[MIDIOUT2 (Launch Control XL)]	ID[output-4]

your debug will be completely different
*/
var primaryMidiControler = ["Launch Control XL",""];		

//---------------------------------------------------------------

//Scence Set up
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 );
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );

//Set up the global DIVs for debug data to be overlaid
var mainDIv;
mainDIv = document.createElement('div');
mainDIv.setAttribute('id','mainDiv');
mainDIv.setAttribute('style','opacity: 1');
renderer.domElement.setAttribute('id','threejscanvas');
mainDIv.appendChild( renderer.domElement );
document.body.appendChild( mainDIv );

//MIDI
var MIDILEDMap = [[1,'C#-1',13],[2,'F0',29],[3,'A1',45],[4,'C#3',61],[5,'F4',77],[6,'A5',93],[7,'C#7',109],[8,'F8',125],[9,'D-1',14],[10,'F#0',30],[11,'A#1',46],[12,'D3',62],[13,'F#4',78],[14,'A#5',94],[15,'D7',110],[16,'F#8',126],[17,'D#-1',15],[18,'G0',31],[19,'B1',47],[20,'D#3',63],[21,'G4',79],[22,'B5',95],[23,'D#7',111],[24,'G8',127]];
var MIDILEDColourMap = [[12,'Off','Off'],[13,'Red','Low'],[15,'Red','Full'],[29,'Amber','Low'],[63,'Amber','Full'],[62,'Yellow','Full'],[28,'Green','Low'],[60,'Green','Full']];
var outputMIDIDevice;
//Global Websocket object for OSC
var wsObject;
//Global Websocket object for controll FeedBack
var wsHUD;
//global axis ranges
var screenRange = [800,600,300];
//mouse Tracker
var mouseLocation = [0,0];
var virtualMouse = [0,0];
var cameraLookingAt = new THREE.Vector3(0,0,0);
//Animation System
var animSys = new threeAnimationSystem();
//efects composer
const renderScene = new RenderPass( scene, camera );
const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
const bloomComposer = new EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );

const mixPass = new ShaderPass(
				new THREE.ShaderMaterial( {
					uniforms: {
						baseTexture: { value: null },
						bloomTexture: { value: bloomComposer.renderTarget2.texture }
					},
					vertexShader: document.getElementById( 'vertexshader' ).textContent,
					fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
					defines: {}
				} ), 'baseTexture'
			);
			mixPass.needsSwap = true;
let composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( mixPass );
//Bloom
const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );
const darkMaterial = new THREE.MeshLambertMaterial( { color: 'black' } );
//Orbital Controls 			
var controls = new OrbitControls( camera, renderer.domElement );
controls.update();
controls.autoRotateSpeed=1;
controls.saveState();

//App starts here HERE
setUp();


function setUp()
{	
	//Init websockets for OSC
	//initWebSockets();
	
	//Init websockets for HUD
	//initHUDWebSockets();
	
	
	//Mouse follow
	/*
	onmousemove = function(e)
	{
	  mouseLocation[0] = e.clientX;
	  mouseLocation[1] = e.clientY;			  
	};
	onmouseout = function(e)
	{
	};
	//mouse click
	onmousedown = function(e)
	{
	};
	onmouseup = function(e)
	{
	};
	*/
	
	//Camera location preset
	cameraLookingAt = camera.position;
	cameraLookingAt.z = 300;
	camera.position.set( 0, 0, cameraLookingAt.z );	
	
	document.onkeypress = function(e) 
	{
		
		//OPTIONAL USE:	Used to control and configure each animations automatic camera director
		if(String.fromCharCode( e.which )=="q")
		{
			//Adds the current camera viewpoint to the list
			animSys.cd().addPoints(camera.position);
		}
		else if(String.fromCharCode( e.which )=="c")
		{
			//clears the director
			animSys.cd().clear();
		}
		else if(String.fromCharCode( e.which )=="s")
		{
			//exports the point list to console
			console.log(animSys.cd().exportPoints());
			animSys.cd().importPoints( animSys.cd().exportPoints() );
		}		
	};
	
	//-------------------	setup all animation	-------------------
	animation_1_setup();
	animation_2_setup();
	animation_3_setup();
	animation_4_setup();
	animation_5_setup();
	animation_6_setup();
	animation_7_setup();
	animation_8_setup();
	animation_9_setup();
	animation_10_setup();
	//-------------------	sets up global controlls for all animations such as next/prev/animation shortcutts via pads etc...	-------------------
	globalControls();
	//-------------------	Goto animation 0	-------------------
	animSys.gotoIndex(camera, 9);
	renderScene.scene = animSys.scene();
	//-------------------	Init web MIDI	-------------------
	navigator.requestMIDIAccess({sysex: true}).then(onMIDISuccess, onMIDIFailure);
	//-------------------	END SETUP	-------------------
}

function animationChange()
{
	renderScene.scene = animSys.scene();
	controls.update();
}

//-----------------------------	BEGIN SETUP FUNCTIONS	-----------------------------
function animation_1_setup()
{
	var objectCounter = 0, objectCount = 1;
	
	animSys.add("One", 60, animation_1_setup, animation_1_animate, 81, 37, "S");
	setUpScene(animSys.scene(), animSys.lights());
	animSys.addGlobalVar("cameraFOV", 45);
	animSys.orbitalControls()[0] = [camera.position.x, camera.position.y, camera.position.z];
	
	animSys.midi().addItem(176, 1, "colourIncrement", 10, 3);
	animSys.midi().addItem(176, 2, "subColourIncrement", 50, 10);
	animSys.midi().addItem(176, 3, "widthScaler", 0.5, 0.1);
	animSys.midi().addItem(176, 4, "heightScaler", 0.5, 0.1);
	animSys.midi().addItem(176, 5, "depthScaler", 2, 2);
	animSys.midi().addItem(176, 6, "rotationalIncrementScaler", 2, 2);
	animSys.midi().addItem(176, 7, "trailSpacing", 10, 1);
	animSys.midi().addItem(176, 8, "trailSpacingLFO", 10, 1);

	animSys.midi().addItem(176, 9, "lineRotationSpeed", 2, 0.1);
	animSys.midi().addItem(176, 10, "trailSpeed", 10, 1);
		
	animSys.midi().addItem(176, 22, "bloomThreshold", 1, 0);
	animSys.midi().addItem(176, 23, "bloomStrength", 3, 1.6);
	animSys.midi().addItem(176, 24, "bloomRadius", 1, 1);
	
	animSys.midi().addItem(176, 17, "xRotate", 2, 0);
	animSys.midi().addItem(176, 18, "yRotate", 2, 0);
	animSys.midi().addItem(176, 19, "zRotate", 2, 0);
	
	animSys.midi().addItem(176, 31, "autoRotateSpeed", 10, 1);
	animSys.midi().addItem(176, 32, "lightIntensity", 20, 1);
	animSys.midi().addItem(176, 39, "autoRotate", 1, 0);
	animSys.midi().addItem(176, 25, "cameraMotionSpeed", 20, 20);
	animSys.midi().addItem(176, 33, "directCamera_LOCK", 1, 0);
	animSys.midi().addItem(176, 41, "directCamera", 1, 0);
	
	for(objectCounter=0; objectCounter<objectCount; objectCounter++)
	{
		animSys.objectTape().push(new threeSpiralTrails());
		animSys.objectTape()[objectCounter].dimensions = [20,30,2];
		animSys.objectTape()[objectCounter].lineOpacity = 0.05;
		animSys.objectTape()[objectCounter].trailSpacing = 1;
		animSys.objectTape()[objectCounter].lineCount = 10;
		animSys.objectTape()[objectCounter].init(animSys.scene(), 127*objectCounter);
		animSys.objectTape()[objectCounter].seed([0,0,0]);
		animSys.objectTape()[objectCounter].animate(animSys.midi().getValue("colourIncrement"), animSys.midi().getValue("subColourIncrement"), animSys.midi().getValue("trailSpeed"),[animSys.midi().getValue("xRotate"),animSys.midi().getValue("yRotate"),animSys.midi().getValue("zRotate")],animSys.midi().getValue("lineRotationSpeed"), [animSys.midi().getValue("widthScaler"),animSys.midi().getValue("heightScaler"),animSys.midi().getValue("depthScaler")], animSys.midi().getValue("rotationalIncrementScaler"), animSys.midi().getValue("trailSpacingLFO"));
	}
	
}

function animation_2_setup()
{
	var objectCounter = 0;
	
	animSys.add("Spiral Trails", 60, animation_2_setup, animation_2_animate, 82, 37, "S");
	setUpScene(animSys.scene(), animSys.lights());
	animSys.addGlobalVar("globalObjectGroup", new THREE.Object3D());
	animSys.addGlobalVar("cameraFOV", 45);
	animSys.orbitalControls()[0] = [camera.position.x, camera.position.y, camera.position.z];
		
	animSys.midi().addItem(176, 1, "colourIncrement", 10, 3);
	animSys.midi().addItem(176, 2, "subColourIncrement", 50, 10);
	animSys.midi().addItem(176, 3, "widthScaler", 2, 1.1);
	animSys.midi().addItem(176, 4, "heightScaler", 2, 1.1);
	animSys.midi().addItem(176, 5, "depthScaler", 2, 2);
	animSys.midi().addItem(176, 6, "rotationalIncrementScaler", 2, 2);
	animSys.midi().addItem(176, 7, "innerGapRadius", 5, 2.4);

	animSys.midi().addItem(176, 9, "lineRotationSpeed", 2, 0.1);
	animSys.midi().addItem(176, 10, "trailSpeed", 10, 1);
		
	animSys.midi().addItem(176, 22, "bloomThreshold", 1, 0);
	animSys.midi().addItem(176, 23, "bloomStrength", 3, 1.6);
	animSys.midi().addItem(176, 24, "bloomRadius", 1, 1);
	
	animSys.midi().addItem(176, 17, "xRotate", 2, 0);
	animSys.midi().addItem(176, 18, "yRotate", 2, 0);
	animSys.midi().addItem(176, 19, "zRotate", 2, 0);
	
	animSys.midi().addItem(176, 31, "autoRotateSpeed", 10, 1);
	animSys.midi().addItem(176, 32, "lightIntensity", 20, 1);
	animSys.midi().addItem(176, 39, "autoRotate", 1, 0);
	animSys.midi().addItem(176, 25, "cameraMotionSpeed", 20, 20);
	animSys.midi().addItem(176, 33, "directCamera_LOCK", 1, 0);
	animSys.midi().addItem(176, 41, "directCamera", 1, 0);
	animSys.midi().addItem(144, 108, "orbitReset", 1, 0);
	
			
	objectCounter=0;
	animSys.objectTape().push(new threeSpiralTrails());
	animSys.objectTape()[objectCounter].init(animSys.scene(), 127*objectCounter);
	animSys.objectTape()[objectCounter].multiObject = 1;
	animSys.objectTape()[objectCounter].screenRange[2] = 100;
	animSys.objectTape()[objectCounter].seed([0,0,-60]);
	animSys.objectTape()[objectCounter].globalObjectGroup.rotateY(180*(Math.PI/180));
	objectCounter++;
	animSys.objectTape().push(new threeSpiralTrails());
	animSys.objectTape()[objectCounter].init(animSys.scene(), 127*objectCounter);
	animSys.objectTape()[objectCounter].multiObject = 1;
	animSys.objectTape()[objectCounter].screenRange[2] = 100;
	animSys.objectTape()[objectCounter].seed([0,0,60]);
	objectCounter++;
	animSys.objectTape().push(new threeSpiralTrails());
	animSys.objectTape()[objectCounter].init(animSys.scene(), 127*objectCounter);
	animSys.objectTape()[objectCounter].multiObject = 1;
	animSys.objectTape()[objectCounter].screenRange[2] = 100;
	animSys.objectTape()[objectCounter].seed([60,0,0]);
	animSys.objectTape()[objectCounter].globalObjectGroup.rotateY(90*(Math.PI/180));
	objectCounter++;
	animSys.objectTape().push(new threeSpiralTrails());
	animSys.objectTape()[objectCounter].init(animSys.scene(), 127*objectCounter);
	animSys.objectTape()[objectCounter].multiObject = 1;
	animSys.objectTape()[objectCounter].screenRange[2] = 100;
	animSys.objectTape()[objectCounter].seed([-60,0,0]);
	animSys.objectTape()[objectCounter].globalObjectGroup.rotateY(-90*(Math.PI/180));
	objectCounter++;
	animSys.objectTape().push(new threeSpiralTrails());
	animSys.objectTape()[objectCounter].init(animSys.scene(), 127*objectCounter);
	animSys.objectTape()[objectCounter].multiObject = 1;
	animSys.objectTape()[objectCounter].screenRange[2] = 100;
	animSys.objectTape()[objectCounter].seed([0,60,0]);
	animSys.objectTape()[objectCounter].globalObjectGroup.rotateX(-90*(Math.PI/180));
	objectCounter++;
	animSys.objectTape().push(new threeSpiralTrails());
	animSys.objectTape()[objectCounter].init(animSys.scene(), 127*objectCounter);
	animSys.objectTape()[objectCounter].multiObject = 1;
	animSys.objectTape()[objectCounter].screenRange[2] = 100;
	animSys.objectTape()[objectCounter].seed([0,-60,0]);
	animSys.objectTape()[objectCounter].globalObjectGroup.rotateX(90*(Math.PI/180));
	objectCounter++;
	for(objectCounter=0; objectCounter<animSys.objectTape().length; objectCounter++)
	{
		animSys.getGlobalVar("globalObjectGroup").add( animSys.objectTape()[objectCounter].globalObjectGroup );
	}
	animSys.scene().add(animSys.getGlobalVar("globalObjectGroup"));
}

function animation_3_setup()
{
	var objectCounter = 0, objectCount=0;
	
	animSys.add("Orbital Spherical Trails", 60, animation_3_setup, animation_3_animate, 83, 37, "S");
	setUpScene(animSys.scene(), animSys.lights());
	animSys.addGlobalVar("cameraFOV", 45);
	animSys.orbitalControls()[0] = [camera.position.x, camera.position.y, camera.position.z];
			
	animSys.midi().addItem(176, 1, "colourIncrement", 10, 3);
	animSys.midi().addItem(176, 2, "subColourIncrement", 50, 10);
	animSys.midi().addItem(176, 3, "objectScale", 2, 0.25);
	animSys.midi().addItem(176, 4, "xScale", 2, 1);
	animSys.midi().addItem(176, 5, "yScale", 2, 1);

	animSys.midi().addItem(176, 9, "motionSpeed", 2, 0.1);
	animSys.midi().addItem(176, 10, "rotationSpeed", 2, 0.1);
	animSys.midi().addItem(176, 11, "radiusEnvelopIncrement", 10, 1);
	animSys.midi().addItem(176, 12, "radiusSubEnvelopIncrement", 10, 0);
	animSys.midi().addItem(176, 13, "trailSpeed", 0.1, 0.002);
		
	animSys.midi().addItem(176, 22, "bloomThreshold", 1, 0);
	animSys.midi().addItem(176, 23, "bloomStrength", 3, 1.6);
	animSys.midi().addItem(176, 24, "bloomRadius", 1, 1);
	
	
	animSys.midi().addItem(176, 31, "autoRotateSpeed", 10, 1);
	animSys.midi().addItem(176, 32, "lightIntensity", 20, 1);
	animSys.midi().addItem(176, 39, "autoRotate", 1, 0);
	animSys.midi().addItem(176, 25, "cameraMotionSpeed", 20, 1);
	animSys.midi().addItem(176, 33, "directCamera_LOCK", 1, 0);
	animSys.midi().addItem(176, 41, "directCamera", 1, 0);
	animSys.midi().addItem(144, 108, "orbitReset", 1, 0);
	
	objectCount = 3;
	for(objectCounter=0; objectCounter<objectCount; objectCounter++)
	{
		animSys.objectTape().push(new threeLineSphere());
		animSys.objectTape()[objectCounter].init(animSys.scene(), 127*objectCounter);
		animSys.objectTape()[objectCounter].radius = 100 +(objectCounter*100);
		animSys.objectTape()[objectCounter].sliceStart = (0.1)*objectCounter;
		animSys.objectTape()[objectCounter].rotationalVectors = [Math.random(), Math.random(), Math.random()];
		animSys.objectTape()[objectCounter].slices = 25;
		animSys.objectTape()[objectCounter].sliceAcuracy = 50;
		animSys.objectTape()[objectCounter].trails = 20;
		animSys.objectTape()[objectCounter].trailSpacing = 0.005;
		animSys.objectTape()[objectCounter].sliceOpacity = 0.1;
		animSys.objectTape()[objectCounter].seed([0,0,0]);
	}
	animSys.midi().setValue("objectScale", 0.25);

}

function animation_4_setup()
{
	var objectCounter = 0, objectCount=0;
	
	animSys.add("Torus", 60, animation_4_setup, animation_4_animate, 84, 37, "S");
	setUpScene(animSys.scene(), animSys.lights());
	animSys.addGlobalVar("cameraFOV", 45);
	animSys.orbitalControls()[0] = [camera.position.x, camera.position.y, camera.position.z];
			
	animSys.midi().addItem(176, 1, "colourIncrement", 40, 2);
	animSys.midi().addItem(176, 2, "subColourIncrement", 5, 5);
	animSys.midi().addItem(176, 3, "objectScale", 4, 1);
	animSys.midi().addItem(176, 4, "motionSpeed", 0.2, 0.005);
	animSys.midi().addItem(176, 5, "scaleX", 4, 1);
	animSys.midi().addItem(176, 6, "scaleY", 4, 1);

	animSys.midi().addItem(176, 9, "rotationSpeedX", 2, 0);
	animSys.midi().addItem(176, 10, "rotationSpeedY", 2, 0);
	animSys.midi().addItem(176, 11, "rotationSpeedZ", 2, 0);
		
	animSys.midi().addItem(176, 22, "bloomThreshold", 1, 0);
	animSys.midi().addItem(176, 23, "bloomStrength", 3, 1.6);
	animSys.midi().addItem(176, 24, "bloomRadius", 1, 1);

	animSys.midi().addItem(176, 31, "autoRotateSpeed", 10, 1);
	animSys.midi().addItem(176, 32, "lightIntensity", 20, 1);
	animSys.midi().addItem(176, 39, "autoRotate", 1, 0);
	animSys.midi().addItem(176, 25, "cameraMotionSpeed", 20, 1);
	animSys.midi().addItem(176, 33, "directCamera_LOCK", 1, 1);
	animSys.midi().addItem(176, 41, "directCamera", 1, 0);
	animSys.midi().addItem(144, 108, "orbitReset", 1, 0);
	
	objectCount = 1;
	for(objectCounter=0; objectCounter<objectCount; objectCounter++)
	{
		animSys.objectTape().push(new threeToroid());
		animSys.objectTape()[objectCounter].init(animSys.scene(), 0);
		animSys.objectTape()[objectCounter].sliceOpacity = 0.2;
		animSys.objectTape()[objectCounter].trailsPerSlice = 30;
		animSys.objectTape()[objectCounter].showPoints = 1;
		animSys.objectTape()[objectCounter].slices = 128;
		animSys.objectTape()[objectCounter].seed([0,0,0]);
	}
	animSys.midi().setValue("objectScale", 1);
	animSys.cd().importPoints("75.61069690295598,557.160237887611,678.1124473541555|-530.1781093758781,-594.1653900028779,376.64261719449735|96.63275371496346,131.92515941372702,-215.7856012877725|0.00011521685098749129,270.74999999986363,-0.00024502480824541514|-264.9739777604591,-55.352583718519035,-5.51770654198837|2.5603032561012142,44.903081541290234,-553.36057136262");
	animSys.cd().setMotionSpeed(1,1,1);
}

function animation_5_setup()
{
	var objectCounter = 0, oCounter=0, objectCount=0, lightZOffset = 0.2, lightingIntencity=1, lightIndex=0;
	var pointPos = [0,0];
	
	animSys.add("Pulse Beams", 60, animation_5_setup, animation_5_animate, 85, 37, "S");
	setUpScene(animSys.scene(), animSys.lights());
	animSys.addGlobalVar("pixelMap", new pixelMaper());
	animSys.addGlobalVar("cameraFOV", 100);
	animSys.orbitalControls()[0] = [camera.position.x, camera.position.y, camera.position.z];
			
	animSys.midi().addItem(176, 1, "colourIncrement", 40, 10);
	animSys.midi().addItem(176, 2, "subColourIncrement", 50, 25);
	animSys.midi().addItem(176, 3, "lineScale", 5, 0.5);
	animSys.midi().addItem(176, 4, "pointScale", 5, 1);
	animSys.midi().addItem(176, 5, "speed", 20, 1);
	
	animSys.midi().addItem(176, 9, "orbitFlux", 2, 0.5);
	animSys.midi().addItem(176, 10, "beamRotation", 5, 0.6);
	
	animSys.midi().addItem(176, 22, "bloomThreshold", 1, 0);
	animSys.midi().addItem(176, 23, "bloomStrength", 3, 1.6);
	animSys.midi().addItem(176, 24, "bloomRadius", 1, 1);

	animSys.midi().addItem(176, 31, "autoRotateSpeed", 10, 1);
	animSys.midi().addItem(176, 32, "lightIntensity", 20, 1);
	animSys.midi().addItem(176, 39, "autoRotate", 1, 0);
	animSys.midi().addItem(176, 25, "cameraMotionSpeed", 20, 20);
	animSys.midi().addItem(176, 33, "directCamera_LOCK", 1, 0);
	animSys.midi().addItem(176, 41, "directCamera", 1, 0);
	animSys.midi().addItem(144, 108, "orbitReset", 1, 0);
	

	objectCount = 32;
	for(oCounter=0; oCounter<objectCount; oCounter++)
	{
		pointPos = animSys.getGlobalVar("pixelMap").getCircularPointsRaw(0,0,400*Math.random(),Math.random()*360);
		animSys.objectTape().push( new threeOrbitalBeams() );
		animSys.objectTape()[oCounter].init(animSys.scene(), 0);
		animSys.objectTape()[oCounter].colourIndex = Math.round(((animSys.objectTape()[oCounter].colourObject._bandWidth)/objectCount)*oCounter);
		animSys.objectTape()[oCounter].beamLength = 100+(600*Math.random());
		animSys.objectTape()[oCounter].totalOrbits = 1+Math.round(Math.random()*5);
		animSys.objectTape()[oCounter].defaultFadeDelay = -1;
		animSys.objectTape()[oCounter].pointsPerOrbit = 10+(Math.random()*20);
		animSys.objectTape()[oCounter].beamLiveTime = 100+(Math.random()*900);
		animSys.objectTape()[oCounter].seed([pointPos[0],pointPos[1],0]);
	}	
}
function animation_6_setup()
{
	var yLayers = 5, zLayers=5, globalClickID=0, objectCounter = 0;
	var linesPerYLayer = 20, linesPerZLayer=10, lineCounter=0;
	var yCounter=0, zCounter=0;
	var genObject, localScreenRange=[450,150,400];
	

	animSys.add("Grid Test", 60, animation_6_setup, animation_6_animate, 86, 37, "S");
	setUpScene(animSys.scene(), animSys.lights());
	animSys.addGlobalVar("pixelMap", new pixelMaper());
	animSys.addGlobalVar("cIndex", 0);
	animSys.addGlobalVar("innerCIndex", 0);
	animSys.addGlobalVar("screenRange", [300,150,209]);
	animSys.addGlobalVar("cameraFOV", 100);
	animSys.orbitalControls()[0] = [camera.position.x, camera.position.y, camera.position.z];
	
	animSys.midi().addItem(176, 1, "colourIncrement", 50, 2);
	animSys.midi().addItem(176, 2, "subColourIncrement", 100, 25);

	animSys.midi().addItem(176, 3, "lineWidth", 3, 3);
	animSys.midi().addItem(176, 4, "upSpeedScaler", 2, 0.09);
	animSys.midi().addItem(176, 5, "forwardSpeedScaler", 2, 0.2);

	animSys.midi().addItem(176, 22, "bloomThreshold", 1, 0);
	animSys.midi().addItem(176, 23, "bloomStrength", 5, 1);
	animSys.midi().addItem(176, 24, "bloomRadius", 1, 1);
	
	animSys.midi().addItem(176, 31, "autoRotateSpeed", 10, 2);
	animSys.midi().addItem(176, 32, "lightIntensity", 5, 2);
	animSys.midi().addItem(176, 39, "autoRotate", 1, 0);
	
	animSys.midi().addItem(176, 25, "cameraMotionSpeed", 10, 0.15);
	animSys.midi().addItem(176, 33, "directCamera_LOCK", 1, 0)
	animSys.midi().addItem(176, 41, "directCamera", 1, 0);
	
	animSys.midi().addItem(176, 30, "Z_autoRotateSpeed", (Math.PI/180), 0);
	animSys.midi().addItem(176, 38, "Z_autoRotate", 1, 0);
	
	
	//Lines on the Z plane
	for(objectCounter=0; objectCounter<yLayers; objectCounter++)
	{
		genObject = new animationObject();
		genObject.objectID = globalClickID;
		genObject.position[0] = 0;
		genObject.position[1] = (localScreenRange[1]*3)-((localScreenRange[1]*6)*(objectCounter/yLayers));
		genObject.position[2] = 0;
		genObject.dimensions[0] = 1;	
		genObject.dimensions[1] = 1;	
		genObject.dimensions[2] = 4000;	
		genObject.axis = 0;		
		genObject.pollyPoints = linesPerYLayer;
		globalClickID++;
		animSys.objectTape().push(genObject);
	}
	//lines on the X plane
	for(objectCounter=0; objectCounter<zLayers; objectCounter++)
	{
		genObject = new animationObject();
		genObject.objectID = globalClickID;
		genObject.position[0] = 0;
		genObject.position[1] = (localScreenRange[1]*3)-((localScreenRange[1]*6)*(objectCounter/zLayers));
		genObject.position[2] = 0;
		genObject.dimensions[0] = 4000;	
		genObject.dimensions[1] = 1;	
		genObject.dimensions[2] = 1;	
		genObject.axis = 1;		
		genObject.pollyPoints = linesPerZLayer;
		globalClickID++;
		animSys.objectTape().push(genObject);
	}
	
	//set up 3d objects into animSys.scene()
	for(objectCounter=0; objectCounter<animSys.objectTape().length; objectCounter++)
	{
		for(yCounter=0; yCounter<animSys.objectTape()[objectCounter].pollyPoints; yCounter++)
		{
			//Add Geometry
			animSys.objectTape()[objectCounter].geometry.push( new THREE.BoxGeometry( animSys.objectTape()[objectCounter].dimensions[0], animSys.objectTape()[objectCounter].dimensions[1], animSys.objectTape()[objectCounter].dimensions[2] ) );
			//Add object material
			animSys.objectTape()[objectCounter].materials.push( new THREE.MeshLambertMaterial( { color: 0xffffff } ) );
			//Material properties
			animSys.objectTape()[objectCounter].materials[yCounter].transparent = true;
			animSys.objectTape()[objectCounter].materials[yCounter].opacity = 1;
			//Add object
			animSys.objectTape()[objectCounter].objects.push( new THREE.Mesh( animSys.objectTape()[objectCounter].geometry[yCounter], animSys.objectTape()[objectCounter].materials[yCounter] ) );
			animSys.objectTape()[objectCounter].objects[yCounter].layers.enable( 1 );
			animSys.objectTape()[objectCounter].materials[yCounter].opacity = 1;
			animSys.objectTape()[objectCounter].materials[yCounter].transparent = true;
			//positon
			if(animSys.objectTape()[objectCounter].axis==0)
			{
				animSys.objectTape()[objectCounter].objects[yCounter].position.x = -(localScreenRange[0]*4)+((localScreenRange[0]*8)*(yCounter/animSys.objectTape()[objectCounter].pollyPoints));
				animSys.objectTape()[objectCounter].objects[yCounter].position.y = animSys.objectTape()[objectCounter].position[1];
				animSys.objectTape()[objectCounter].objects[yCounter].position.z = animSys.objectTape()[objectCounter].position[2];
			}
			else if(animSys.objectTape()[objectCounter].axis==1)
			{
				animSys.objectTape()[objectCounter].objects[yCounter].position.x = animSys.objectTape()[objectCounter].position[0];
				animSys.objectTape()[objectCounter].objects[yCounter].position.y = animSys.objectTape()[objectCounter].position[1];
				animSys.objectTape()[objectCounter].objects[yCounter].position.z = (-(localScreenRange[2]*3)) + ((localScreenRange[2]*6)*(yCounter/animSys.objectTape()[objectCounter].pollyPoints));
			}
	
			//Add to animSys.scene()
			animSys.scene().add( animSys.objectTape()[objectCounter].objects[yCounter] );	
		}
	}	
	
}
function animation_7_setup()
{
	var numberOfLayers=100, numberOfPoints=10, globalClickID=0;
	var layerCounter, pointCounter, localObjectCounter;
	var minPointRadius=20, maxPointRadius = 50, pointRadius=0, pointMotionSpeed=0, pointMotionTrack=0, pointVectors = [0,0];
	var genObject, custTriangles, tempPoint;
	
	animSys.add("Flying Points", 60, animation_7_setup, animation_7_animate, 87, 37, "S");
	setUpScene(animSys.scene(), animSys.lights());
	animSys.addGlobalVar("cameraFOV", 100);
	animSys.orbitalControls()[0] = [camera.position.x, camera.position.y, camera.position.z];
	animSys.addGlobalVar("pixelMap", new pixelMaper());
	animSys.addGlobalVar("pointUtility", new THREEJS_Helpers());
	animSys.addGlobalVar("novas", new threeNovas());
	animSys.addGlobalVar("pulsers", new threeOrbitalPulses());
	animSys.addGlobalVar("cIndex", 0);
	animSys.addGlobalVar("innerCIndex", 0);
	animSys.timers().addTimer("puslerTimer");
	
	animSys.midi().addItem(176, 1, "colourIncrement", 20, 2);
	animSys.midi().addItem(176, 2, "subColourIncrement", 20, 3.6);
	animSys.midi().addItem(176, 3, "pointRadius", 5, 0.7);
	animSys.midi().addItem(176, 4, "pointSize", 5, 1);
	animSys.midi().addItem(176, 5, "pointRotationScale", 10, 1);

	animSys.midi().addItem(176, 9, "layerSpeed", 50, 11);
	animSys.midi().addItem(176, 10, "pointSpeed", 50, 0);
	
	animSys.midi().addItem(176, 22, "bloomThreshold", 1, 0);
	animSys.midi().addItem(176, 23, "bloomStrength", 3, 1.6);
	animSys.midi().addItem(176, 24, "bloomRadius", 1, 1);
	
	animSys.midi().addItem(176, 25, "cameraMotionSpeed", 10, 2);	

	animSys.midi().addItem(176, 30, "Z_autoRotateSpeed", 2*(Math.PI/180), 0);
	animSys.midi().addItem(176, 31, "autoRotateSpeed", 10, 5);
	animSys.midi().addItem(176, 32, "lightIntensity", 5, 3);
	animSys.midi().addItem(176, 33, "directCamera_LOCK", 1, 0)
	animSys.midi().addItem(176, 38, "Z_autoRotate", 1, 0);
	animSys.midi().addItem(176, 39, "autoRotate", 1, 0);
	
	animSys.midi().addItem(176, 41, "directCamera", 1, 0);
	animSys.midi().addItem(176, 48, "firePulser", 1, 0);
	
	for(layerCounter=0; layerCounter<numberOfLayers; layerCounter++)
	{
		genObject = new animationObject();
		genObject.objectID = globalClickID;
		genObject.position[0] = (-300)+(Math.random()*600);
		genObject.position[1] = (-200)+(Math.random()*400);
		genObject.position[2] = 0;
		genObject.pollyPoints = numberOfPoints;
		genObject.motionIncrements[0] = (Math.random()*2)+0.001;
		for(pointCounter=0; pointCounter<genObject.pollyPoints; pointCounter++)
		{
			pointMotionSpeed = (Math.random()*2)+0.001;
			pointMotionTrack = 0;
			pointVectors[0] = Math.random()*200;
			pointVectors[1] = Math.random()*360;
			pointRadius = 50;
			genObject.extrude.push( [pointVectors[0], pointVectors[1], pointRadius, pointMotionSpeed, pointMotionTrack] );
		}
		
		animSys.objectTape().push(genObject);
		globalClickID++
	}
	for(localObjectCounter=0; localObjectCounter<animSys.objectTape().length; localObjectCounter++)
	{
		for(pointCounter=0; pointCounter<animSys.objectTape()[localObjectCounter].pollyPoints; pointCounter++)
		{
			//Add object material
			animSys.objectTape()[localObjectCounter].materials.push( new THREE.MeshLambertMaterial( { color: 0xffffff, side: THREE.DoubleSide } ) );
			//calculate points location based on its vector and teh centre poiint of the layer
			tempPoint = animSys.getGlobalVar("pixelMap").getCircularPointsRaw(animSys.objectTape()[localObjectCounter].position[0], animSys.objectTape()[localObjectCounter].position[1], animSys.objectTape()[localObjectCounter].extrude[pointCounter][0], animSys.objectTape()[localObjectCounter].extrude[pointCounter][1]);
			custTriangles = animSys.getGlobalVar("pointUtility").returnCustomTriangle(tempPoint, animSys.objectTape()[localObjectCounter].extrude[pointCounter][2], 2, animSys.objectTape()[localObjectCounter].materials[pointCounter]);
			//Add object Geometry
			animSys.objectTape()[localObjectCounter].geometry.push( custTriangles[0] );
			//Add object
			animSys.objectTape()[localObjectCounter].objects.push( custTriangles[1] );
			animSys.objectTape()[localObjectCounter].objects[pointCounter].layers.enable( 1 );
			//Opacity
			animSys.objectTape()[localObjectCounter].materials[pointCounter].opacity = 1;
			animSys.objectTape()[localObjectCounter].materials[pointCounter].transparent = true;
			//Position
			animSys.objectTape()[localObjectCounter].objects[pointCounter].position.x = tempPoint[0];
			animSys.objectTape()[localObjectCounter].objects[pointCounter].position.z = tempPoint[1];
			animSys.objectTape()[localObjectCounter].objects[pointCounter].position.y = animSys.objectTape()[localObjectCounter].position[2];
			//rotation
			animSys.objectTape()[localObjectCounter].objects[pointCounter].rotation.x = 90*(Math.PI/180);
			animSys.scene().add( animSys.objectTape()[localObjectCounter].objects[pointCounter] );
		}
	}	
	//Import Camera director
	animSys.cd().importPoints("0,1.8369701987210297e-14,300|230.71092045628947,186.79091627872882,43.37769908564422|164.78298277135804,52.27798109830885,48.75771013929968|-397.51383165777696,-53.20930193067693,256.3775706971249|-458.12093963266625,129.2353639975564,1.166314819955641|-347.93327969777334,-4.8472565389547375,-324.8028200471077|443.9748699271191,101.0200300161541,-138.77753181438084");
	animSys.cd().setMotionSpeed(2,2,2);
	//set up novas/pulsers
	
	animSys.getGlobalVar("novas").init(animSys.scene(), 0);
	animSys.getGlobalVar("novas").defaultFadeDelay = 30000000;
	animSys.getGlobalVar("novas").maxRadius = 100;
	animSys.getGlobalVar("novas").defaultMotionIncrements = [3, 15, 0];
	animSys.getGlobalVar("novas").enableBloom = 1;
	
	animSys.getGlobalVar("pulsers").init(animSys.scene(), 0);
	animSys.getGlobalVar("pulsers").defaultFadeDelay = 3000;
	animSys.getGlobalVar("pulsers").maxRadius = 100;
	animSys.getGlobalVar("pulsers").defaultMotionIncrements = [3, 15, 0];
	animSys.getGlobalVar("pulsers").enableBloom = 1;

	animSys.timers().startTimer("puslerTimer", 3000);
	
}

function animation_8_setup()
{
	var objectCounter = 0, objectCount = 10;
	var localScreenRanges = [200, 100, 100];
	
	animSys.add("Boxed Faces", 60, animation_8_setup, animation_8_animate, 88, 37, "S");
	setUpScene(animSys.scene(), animSys.lights());
	animSys.addGlobalVar("cameraFOV", 45);
	animSys.orbitalControls()[0] = [camera.position.x, camera.position.y, camera.position.z];
	
	animSys.midi().addItem(176, 1, "colourIncrement", 10, 1);
	animSys.midi().addItem(176, 2, "subColourIncrement", 100, 3);
	animSys.midi().addItem(176, 3, "radiusScaler", 5, 2);
	
	animSys.midi().addItem(176, 9, "layerSpeed", 1, 0.01);
	animSys.midi().addItem(176, 10, "faceSpeed", 1*(Math.PI/180), 0.001);
		
	animSys.midi().addItem(176, 22, "bloomThreshold", 1, 0);
	animSys.midi().addItem(176, 23, "bloomStrength", 3, 1.6);
	animSys.midi().addItem(176, 24, "bloomRadius", 1, 1);
	
	animSys.midi().addItem(176, 17, "xRotate", 2, 0);
	animSys.midi().addItem(176, 18, "yRotate", 2, 0);
	animSys.midi().addItem(176, 19, "zRotate", 2, 0);
	
	animSys.midi().addItem(176, 31, "autoRotateSpeed", 10, 1);
	animSys.midi().addItem(176, 32, "lightIntensity", 20, 1);
	animSys.midi().addItem(176, 39, "autoRotate", 1, 0);
	animSys.midi().addItem(176, 25, "cameraMotionSpeed", 20, 20);
	animSys.midi().addItem(176, 33, "directCamera_LOCK", 1, 0);
	animSys.midi().addItem(176, 41, "directCamera", 1, 0);
	
	for(objectCounter=0; objectCounter<objectCount; objectCounter++)
	{
		animSys.objectTape().push(new threeBoxFaces());
		animSys.objectTape()[objectCounter].init(animSys.scene(), 0);
		animSys.objectTape()[objectCounter].layerOpacity = 0.1;
		//animSys.objectTape()[objectCounter].pointsPerLayer = 3+objectCounter;
		animSys.objectTape()[objectCounter].pointsPerLayer = 4;
		//animSys.objectTape()[objectCounter].radius = 50+(50*objectCounter);
		animSys.objectTape()[objectCounter].radius = 20;
		animSys.objectTape()[objectCounter].layerCount = 20;
		animSys.objectTape()[objectCounter].facesPerLayer = 5;
		animSys.objectTape()[objectCounter].faceDimensions = [5,5];
		animSys.objectTape()[objectCounter].faceOffset = (2/360);
		animSys.objectTape()[objectCounter].seed([-localScreenRanges[0]+(Math.random()*localScreenRanges[0]*2),localScreenRanges[1]-(Math.random()*localScreenRanges[1]*2),-localScreenRanges[2]+(Math.random()*localScreenRanges[2]*2)]);
		animSys.objectTape()[objectCounter].animate(animSys.midi().getValue("colourIncrement"), animSys.midi().getValue("subColourIncrement"), animSys.midi().getValue("radiusScaler"), animSys.midi().getValue("layerSpeed"), animSys.midi().getValue("faceSpeed"),[animSys.midi().getValue("xRotate"),animSys.midi().getValue("yRotate"),animSys.midi().getValue("zRotate")]);
	}
	
}
function animation_9_setup()
{
	var objectCounter = 0, objectCount = 5;
	var localScreenRanges = [200, 100, 100];
	
	animSys.add("Jelly Fish", 60, animation_9_setup, animation_9_animate, 71, 37, "S");
	setUpScene(animSys.scene(), animSys.lights());
	animSys.addGlobalVar("cameraFOV", 100);
	animSys.orbitalControls()[0] = [camera.position.x, camera.position.y, camera.position.z];
	
	animSys.midi().addItem(176, 1, "colourIncrement", 10, 1);
	animSys.midi().addItem(176, 2, "subColourIncrement", 100, 37);
	animSys.midi().addItem(176, 3, "radiusScaler", 5, 1);
	
	animSys.midi().addItem(176, 9, "layerSpeed", 2, 1.2);
	animSys.midi().addItem(176, 10, "faceSpeed", 5, 2);
	animSys.midi().addItem(176, 11, "widthScale", 10, 2);
	animSys.midi().addItem(176, 12, "heightScale", 10, 2);
		
	animSys.midi().addItem(176, 22, "bloomThreshold", 1, 0);
	animSys.midi().addItem(176, 23, "bloomStrength", 3, 1);
	animSys.midi().addItem(176, 24, "bloomRadius", 1, 1);
	
	animSys.midi().addItem(176, 17, "xRotate", 2, 0);
	animSys.midi().addItem(176, 18, "yRotate", 2, 0);
	animSys.midi().addItem(176, 19, "zRotate", 2, 0);
	
	animSys.midi().addItem(176, 31, "autoRotateSpeed", 10, 1);
	animSys.midi().addItem(176, 32, "lightIntensity", 20, 1);
	animSys.midi().addItem(176, 39, "autoRotate", 1, 0);
	animSys.midi().addItem(176, 25, "cameraMotionSpeed", 20, 2);
	animSys.midi().addItem(176, 33, "directCamera_LOCK", 1, 1);
	animSys.midi().addItem(176, 41, "directCamera", 1, 0);
	
	for(objectCounter=0; objectCounter<objectCount; objectCounter++)
	{
		animSys.objectTape().push(new threeJellyFish());
		animSys.objectTape()[objectCounter].segmentCount = 3+(3*objectCounter);
		animSys.objectTape()[objectCounter].radius = 50+(70*objectCounter)
		animSys.objectTape()[objectCounter].latheLength = 2;
		animSys.objectTape()[objectCounter].LFO1Increment = Math.random()*2;
		animSys.objectTape()[objectCounter].LFO2Increment = Math.random()*2;
		animSys.objectTape()[objectCounter].init(animSys.scene(), Math.round(Math.random()*animSys.colours()._bandWidth));
		animSys.objectTape()[objectCounter].seed([0,0,0]);
		animSys.objectTape()[objectCounter].animate(animSys.midi().getValue("colourIncrement"), animSys.midi().getValue("subColourIncrement"), [animSys.midi().getValue("widthScale"), animSys.midi().getValue("heightScale")], animSys.midi().getValue("radiusScaler"), animSys.midi().getValue("layerSpeed"), animSys.midi().getValue("faceSpeed"),[animSys.midi().getValue("xRotate"),animSys.midi().getValue("yRotate"),animSys.midi().getValue("zRotate")]);
	}
	animSys.cd().importPoints("0,3.068075607724721e-14,501.0547710345276|-392.54694499088197,-78.4967197154182,301.3321166897206|-46.27099243003022,498.09591913342524,28.554057130828397|-26.3189447639248,283.3170047656203,16.241550330882653|-87.52412221800323,228.85259363790118,-145.57135162927295|-170.49863057953885,445.8091418803376,-283.5757214746254|-417.64688322203085,213.9420764224201,296.69956638731645");
	animSys.cd().setMotionSpeed(1,1,1);
}
function animation_10_setup()
{
	var objectCounter = 0, objectCount = 1;
	var zStart = 0;
	var localScreenRanges = [200, 100, 100];
	
	animSys.add("Polly Trails", 60, animation_10_setup, animation_10_animate, 72, 37, "S");
	setUpScene(animSys.scene(), animSys.lights());
	animSys.addGlobalVar("cameraFOV", 80);
	animSys.orbitalControls()[0] = [camera.position.x, camera.position.y, camera.position.z];
	
	animSys.midi().addItem(176, 1, "colourIncrement", 10, 4);
	animSys.midi().addItem(176, 2, "subColourIncrement", 100, 4);
	animSys.midi().addItem(176, 3, "radiusScaler", 5, 1);
	animSys.midi().addItem(176, 4, "trailSpeed", 10, 1);
	animSys.midi().addItem(176, 5, "trailDensityScale", 10, 3);
	animSys.midi().addItem(176, 6, "trailLengthScale", 20, 5);
	animSys.midi().addItem(176, 7, "trailThicknessScale", 10, 3);
		
	animSys.midi().addItem(176, 9, "innerXRotate", 2, 0);
	animSys.midi().addItem(176, 10, "innerYRotate", 2, 0);
	animSys.midi().addItem(176, 11, "innerZRotate", 2, 0);
	
	animSys.midi().addItem(176, 17, "xRotate", 2, 0);
	animSys.midi().addItem(176, 18, "yRotate", 2, 0);
	animSys.midi().addItem(176, 19, "zRotate", 2, 0);

	animSys.midi().addItem(176, 22, "bloomThreshold", 1, 0);
	animSys.midi().addItem(176, 23, "bloomStrength", 3, 1);
	animSys.midi().addItem(176, 24, "bloomRadius", 1, 1);
	
	animSys.midi().addItem(176, 31, "autoRotateSpeed", 10, 1);
	animSys.midi().addItem(176, 32, "lightIntensity", 20, 1);
	animSys.midi().addItem(176, 39, "autoRotate", 1, 0);
	animSys.midi().addItem(176, 25, "cameraMotionSpeed", 20, 20);
	animSys.midi().addItem(176, 33, "directCamera_LOCK", 1, 0);
	animSys.midi().addItem(176, 41, "directCamera", 1, 0);
	
	animSys.midi().addItem(176, 42, "radiusFire", 1, 0);
	animSys.midi().addItem(176, 43, "trailDensityFire", 1, 0);
	animSys.midi().addItem(176, 44, "trailLengthFire", 1, 0);
	
	for(objectCounter=0; objectCounter<objectCount; objectCounter++)
	{
		animSys.objectTape().push(new threePollyTrails());
		animSys.objectTape()[objectCounter].init(animSys.scene(), Math.round(Math.random()*animSys.colours()._bandWidth));
		animSys.objectTape()[objectCounter].radius = 20+(10*objectCounter);
		animSys.objectTape()[objectCounter].pollyOpacity = 0;
		animSys.objectTape()[objectCounter].numberOfPollys = 80;
		animSys.objectTape()[objectCounter].pollySpacer = 5;
		animSys.objectTape()[objectCounter].pointsPerPolly = 8;
		animSys.objectTape()[objectCounter].trailDensity = 100;
		animSys.objectTape()[objectCounter].generatedirectionalVectors();
		animSys.objectTape()[objectCounter].trailMotionDirection = animSys.objectTape()[objectCounter].directionalVectors[0];
		//animSys.objectTape()[objectCounter].angularRotationsPerPolly = [360/animSys.objectTape()[objectCounter].numberOfPollys,0,0];
		
		animSys.objectTape()[objectCounter].seed([0,0,zStart-((localScreenRanges[2]/objectCount)*objectCounter) ]);
		animSys.objectTape()[objectCounter].animate(animSys.midi().getValue("colourIncrement"), animSys.midi().getValue("subColourIncrement"), animSys.midi().getValue("radiusScaler"), [animSys.midi().getValue("trailSpeed"), animSys.midi().getValue("trailDensityScale"), animSys.midi().getValue("trailLengthScale"), animSys.midi().getValue("trailThicknessScale")], [animSys.midi().getValue("xRotate"),animSys.midi().getValue("yRotate"),animSys.midi().getValue("zRotate")], [animSys.midi().getValue("innerXRotate"),animSys.midi().getValue("innerYRotate"),animSys.midi().getValue("innerZRotate")]);
	}
	animSys.lfos().addWithTimeCode("radiusFire", [100], [50], 2, 25);
	animSys.lfos().addWithTimeCode("trailDensityFire", [100], [50], 2, 25);
	animSys.lfos().addWithTimeCode("trailLengthFire", [100], [50], 2, 25);
}

//-----------------------------	END SETUP FUNCTIONS	-----------------------------
//-----------------------------	BEGIN ANIMATION FUNCTIONS	-----------------------------
function animation_1_animate()
{
	var localObjectCounter;
	
	for(localObjectCounter=0; localObjectCounter<animSys.objectTape().length; localObjectCounter++)
	{
		animSys.objectTape()[localObjectCounter].trailSpacing = animSys.midi().getValue("trailSpacing");
		animSys.objectTape()[localObjectCounter].animate(animSys.midi().getValue("colourIncrement"), animSys.midi().getValue("subColourIncrement"), animSys.midi().getValue("trailSpeed"),[animSys.midi().getValue("xRotate"),animSys.midi().getValue("yRotate"),animSys.midi().getValue("zRotate")],animSys.midi().getValue("lineRotationSpeed"), [animSys.midi().getValue("widthScaler"),animSys.midi().getValue("heightScaler"),animSys.midi().getValue("depthScaler")], animSys.midi().getValue("rotationalIncrementScaler"), animSys.midi().getValue("trailSpacingLFO"));
	}
}
function animation_2_animate()
{
	var localObjectCounter;
	var positonalArray = [[0,0,-60*animSys.midi().getValue("innerGapRadius")], [0,0,60*animSys.midi().getValue("innerGapRadius")], [60*animSys.midi().getValue("innerGapRadius"),0,0], [-60*animSys.midi().getValue("innerGapRadius"),0,0], [0,60*animSys.midi().getValue("innerGapRadius"),0],[0,-60*animSys.midi().getValue("innerGapRadius"),0]];
	
	for(localObjectCounter=0; localObjectCounter<animSys.objectTape().length; localObjectCounter++)
	{
		animSys.objectTape()[localObjectCounter].animate(animSys.midi().getValue("colourIncrement"), animSys.midi().getValue("subColourIncrement"), animSys.midi().getValue("trailSpeed"),[0,0,0],animSys.midi().getValue("lineRotationSpeed"), [animSys.midi().getValue("widthScaler"),animSys.midi().getValue("heightScaler"),animSys.midi().getValue("depthScaler")], animSys.midi().getValue("rotationalIncrementScaler"));
	}
	for(localObjectCounter=0; localObjectCounter<animSys.objectTape().length; localObjectCounter++)
	{
		animSys.objectTape()[localObjectCounter].globalObjectGroup.position.set(positonalArray[localObjectCounter][0],positonalArray[localObjectCounter][1],positonalArray[localObjectCounter][2]);
	}
	animSys.getGlobalVar("globalObjectGroup").rotateX( animSys.midi().getValue("xRotate") * (Math.PI/180) )
	animSys.getGlobalVar("globalObjectGroup").rotateY( animSys.midi().getValue("yRotate") * (Math.PI/180) )
	animSys.getGlobalVar("globalObjectGroup").rotateZ( animSys.midi().getValue("zRotate") * (Math.PI/180) )
}
function animation_3_animate()
{
	var localObjectCounter, hasChanged=0;
	
	if(animSys.midi().hasChanged("objectScale") || animSys.midi().hasChanged("xScale") || animSys.midi().hasChanged("yScale"))
	{
		hasChanged=1;
	}
	
	for(localObjectCounter=0; localObjectCounter<animSys.objectTape().length; localObjectCounter++)
	{
		animSys.objectTape()[localObjectCounter].animate(animSys.midi().getValue("colourIncrement"), animSys.midi().getValue("subColourIncrement"), animSys.midi().getValue("motionSpeed"), [animSys.midi().getValue("rotationSpeed"),animSys.midi().getValue("rotationSpeed"),animSys.midi().getValue("rotationSpeed")], animSys.midi().getValue("radiusEnvelopIncrement"),animSys.midi().getValue("radiusSubEnvelopIncrement"), animSys.midi().getValue("trailSpeed"));
		if(hasChanged==1)
		{
			animSys.objectTape()[localObjectCounter].updatePath(animSys.midi().getValue("objectScale"), animSys.midi().getValue("xScale"), animSys.midi().getValue("yScale"), animSys.midi().getValue("radiusEnvelopIncrement"),animSys.midi().getValue("radiusSubEnvelopIncrement"));
		}
	}
}
function animation_4_animate()
{
	var localObjectCounter, localPointCounter, pointVector;
	var scaleChange=0;
	
	if(animSys.midi().hasChanged("objectScale") || animSys.midi().hasChanged("scaleX") || animSys.midi().hasChanged("scaleY"))
	{
		scaleChange=1;
	}
	for(localObjectCounter=0; localObjectCounter<animSys.objectTape().length; localObjectCounter++)
	{
		animSys.objectTape()[localObjectCounter].animate( animSys.midi().getValue("colourIncrement"), animSys.midi().getValue("colourIncrement"), animSys.midi().getValue("motionSpeed"),  [animSys.midi().getValue("rotationSpeedX"),animSys.midi().getValue("rotationSpeedY"),animSys.midi().getValue("rotationSpeedZ")] ) ;
		if(scaleChange==1)
		{
			animSys.objectTape()[localObjectCounter].updatePath(animSys.midi().getValue("objectScale"), animSys.midi().getValue("scaleX"), animSys.midi().getValue("scaleY"));
		}
	}
}

function animation_5_animate()
{
	var localObjectCounter;
	var pointPos=[0,0];
	
	for(localObjectCounter=0; localObjectCounter<animSys.objectTape().length; localObjectCounter++)
	{
		animSys.objectTape()[localObjectCounter].animate([animSys.midi().getValue("speed"),1,animSys.midi().getValue("lineScale"),animSys.midi().getValue("pointScale"), animSys.midi().getValue("orbitFlux"), animSys.midi().getValue("colourIncrement"), animSys.midi().getValue("beamRotation")]);	
	}
}

function animation_6_animate()
{
	var localObjectCounter = 0, localSubObjectCounter=0;
	var upSpeed = 5*animSys.midi().getValue("upSpeedScaler"), forwardSpeed = 5*animSys.midi().getValue("forwardSpeedScaler");
	var localScreenRange = animSys.getGlobalVar("screenRange")
	
	for(localObjectCounter=0; localObjectCounter<animSys.objectTape().length; localObjectCounter++)
	{
		animSys.colours().getColour(animSys.getGlobalVar("innerCIndex")%animSys.colours()._bandWidth);
		animSys.setGlobalVar("innerCIndex", animSys.getGlobalVar("innerCIndex")+animSys.midi().getValue('subColourIncrement'))
		//upwards motion
		if(animSys.objectTape()[localObjectCounter].position[1]+upSpeed<(localScreenRange[1]*3))
		{
			animSys.objectTape()[localObjectCounter].position[1]+=upSpeed;
		}
		else
		{
			animSys.objectTape()[localObjectCounter].position[1] = -(localScreenRange[1]*3);
		}
		for(localSubObjectCounter=0; localSubObjectCounter<animSys.objectTape()[localObjectCounter].pollyPoints; localSubObjectCounter++)
		{
			//Colour
			animSys.objectTape()[localObjectCounter].materials[localSubObjectCounter].color.r = animSys.colours()._currentColour[0]/255;
			animSys.objectTape()[localObjectCounter].materials[localSubObjectCounter].color.g = animSys.colours()._currentColour[1]/255;
			animSys.objectTape()[localObjectCounter].materials[localSubObjectCounter].color.b = animSys.colours()._currentColour[2]/255;	
			//Line Thickness adjust
			if(animSys.objectTape()[localObjectCounter].axis==0)
			{
				animSys.objectTape()[localObjectCounter].objects[localSubObjectCounter].scale.x = animSys.midi().getValue("lineWidth");
				animSys.objectTape()[localObjectCounter].objects[localSubObjectCounter].scale.y = animSys.midi().getValue("lineWidth");
				animSys.objectTape()[localObjectCounter].objects[localSubObjectCounter].position.y = animSys.objectTape()[localObjectCounter].position[1];
			}
			else if(animSys.objectTape()[localObjectCounter].axis==1)
			{
				animSys.objectTape()[localObjectCounter].objects[localSubObjectCounter].scale.y = animSys.midi().getValue("lineWidth");
				animSys.objectTape()[localObjectCounter].objects[localSubObjectCounter].scale.z = animSys.midi().getValue("lineWidth");
				//upwards motion
				if(animSys.objectTape()[localObjectCounter].objects[localSubObjectCounter].position.z-forwardSpeed>-(localScreenRange[2]*3))
				{
					animSys.objectTape()[localObjectCounter].objects[localSubObjectCounter].position.z -= forwardSpeed;
				}
				else
				{
					animSys.objectTape()[localObjectCounter].objects[localSubObjectCounter].position.z = (localScreenRange[2]*3);
				}
			}
			
			
		}		
	}
	animSys.setGlobalVar("innerCIndex", animSys.getGlobalVar("cIndex"))
	animSys.setGlobalVar("cIndex", animSys.getGlobalVar("cIndex")+animSys.midi().getValue('colourIncrement'))
	
	if(animSys.midi().getValue('Z_autoRotate')==1)
	{
		var z_axis = new THREE.Vector3( 0, 0, 1 );
		var quaternion = new THREE.Quaternion;
		camera.up.applyQuaternion(quaternion.setFromAxisAngle(z_axis, animSys.midi().getValue("Z_autoRotateSpeed")));
	}
}

function animation_7_animate()
{
	var localObjectCounter, localPointCounter, tempPoint;
	var localLayerSpeedBoost=0, localPointSpeedBoost=0;
	var layerSpeedEnvelop=1, pointSpeedEnvelop=1, layerTickEnvelop=1, custTriangles, refreshObjects=0, pointLengthEnvelop=1;
	var novas = animSys.getGlobalVar("novas");
	var pulsers = animSys.getGlobalVar("pulsers");
	
	pulsers.rotationIncrements = [ animSys.midi().getValue("pointRotationScale"), animSys.midi().getValue("pointRotationScale") , animSys.midi().getValue("pointRotationScale") ];
	pulsers.animate(animSys.getGlobalVar("cIndex"), animSys.midi().getValue("subColourIncrement"), animSys.midi().getValue("pointSize"));
	if(animSys.timers().hasTimedOut("puslerTimer"))
	{
		animSys.timers().startTimer("puslerTimer", 3000);
		pulsers.seed([0,0,200]);
	}
	for(localObjectCounter=0; localObjectCounter<animSys.objectTape().length; localObjectCounter++)
	{
		localLayerSpeedBoost = ((animSys.objectTape()[localObjectCounter].motionIncrements[0]*animSys.midi().getValue("layerSpeed"))+layerSpeedEnvelop)*layerTickEnvelop;
		if( animSys.objectTape()[localObjectCounter].position[2]+localLayerSpeedBoost<500 )
		{
			animSys.objectTape()[localObjectCounter].position[2]+=localLayerSpeedBoost;
		}
		else
		{
			animSys.objectTape()[localObjectCounter].position[2]=-500;
		}
		//Colour
		animSys.colours().getColour(animSys.getGlobalVar("innerCIndex")%animSys.colours()._bandWidth );
		for(localPointCounter=0; localPointCounter<animSys.objectTape()[localObjectCounter].pollyPoints; localPointCounter++)
		{
			localPointSpeedBoost = (animSys.objectTape()[localObjectCounter].extrude[localPointCounter][3]*animSys.midi().getValue("pointSpeed"))+pointSpeedEnvelop;
			if(animSys.objectTape()[localObjectCounter].extrude[localPointCounter][0]+localPointSpeedBoost<300)
			{
				animSys.objectTape()[localObjectCounter].extrude[localPointCounter][0]+=localPointSpeedBoost;
			}
			else
			{
				animSys.objectTape()[localObjectCounter].extrude[localPointCounter][0]=0;
			}
			//calculate points location based on its vector and teh centre poiint of the layer
			tempPoint = animSys.getGlobalVar("pixelMap").getCircularPointsRaw(animSys.objectTape()[localObjectCounter].position[0], animSys.objectTape()[localObjectCounter].position[1], animSys.objectTape()[localObjectCounter].extrude[localPointCounter][0], animSys.objectTape()[localObjectCounter].extrude[localPointCounter][1]);
			//scale
			animSys.objectTape()[localObjectCounter].objects[localPointCounter].scale.y = animSys.midi().getValue("pointRadius")*pointLengthEnvelop;
			//Position
			animSys.objectTape()[localObjectCounter].objects[localPointCounter].position.x = tempPoint[0];	
			animSys.objectTape()[localObjectCounter].objects[localPointCounter].position.y = animSys.objectTape()[localObjectCounter].position[1];			
			animSys.objectTape()[localObjectCounter].objects[localPointCounter].position.z = tempPoint[1]+animSys.objectTape()[localObjectCounter].position[2];
			//colour
			animSys.objectTape()[localObjectCounter].materials[localPointCounter].color.r = animSys.colours()._currentColour[0]/255;
			animSys.objectTape()[localObjectCounter].materials[localPointCounter].color.g = animSys.colours()._currentColour[1]/255;
			animSys.objectTape()[localObjectCounter].materials[localPointCounter].color.b = animSys.colours()._currentColour[2]/255;
		}
		animSys.setGlobalVar("innerCIndex", animSys.getGlobalVar("innerCIndex")+animSys.midi().getValue('subColourIncrement'));
	} 
	animSys.setGlobalVar("cIndex", animSys.getGlobalVar("cIndex")+animSys.midi().getValue('colourIncrement'));
	animSys.setGlobalVar("innerCIndex", animSys.getGlobalVar("cIndex"));
	
	if(animSys.midi().getValue('Z_autoRotate')==1)
	{
		var z_axis = new THREE.Vector3( 0, 0, 1 );
		var quaternion = new THREE.Quaternion;
		camera.up.applyQuaternion(quaternion.setFromAxisAngle(z_axis, animSys.midi().getValue("Z_autoRotateSpeed")));
	}
}
function animation_8_animate()
{
	var localObjectCounter;
	
	for(localObjectCounter=0; localObjectCounter<animSys.objectTape().length; localObjectCounter++)
	{
		animSys.objectTape()[localObjectCounter].animate(animSys.midi().getValue("colourIncrement"), animSys.midi().getValue("subColourIncrement"), animSys.midi().getValue("radiusScaler"), animSys.midi().getValue("layerSpeed"), animSys.midi().getValue("faceSpeed"), [animSys.midi().getValue("xRotate"),animSys.midi().getValue("yRotate"),animSys.midi().getValue("zRotate")]);
	}
}
function animation_9_animate()
{
	var localObjectCounter;
	
	for(localObjectCounter=0; localObjectCounter<animSys.objectTape().length; localObjectCounter++)
	{
		animSys.objectTape()[localObjectCounter].animate(animSys.midi().getValue("colourIncrement"), animSys.midi().getValue("subColourIncrement"), [animSys.midi().getValue("widthScale"), animSys.midi().getValue("heightScale")], animSys.midi().getValue("radiusScaler"), animSys.midi().getValue("layerSpeed"), animSys.midi().getValue("faceSpeed"), [animSys.midi().getValue("xRotate"),animSys.midi().getValue("yRotate"),animSys.midi().getValue("zRotate")]);
	}
}
function animation_10_animate()
{
	var localObjectCounter, radiusEnvelop=1, trailDensityEnvelop=1, trailLengthEnvelop=1;
	
	checkTrigger("radiusFire", 1, "lfo", "radiusFire", 1, 0);
	checkTrigger("trailDensityFire", 1, "lfo", "trailDensityFire", 1, 0);
	checkTrigger("trailLengthFire", 1, "lfo", "trailLengthFire", 1, 0);
	
	
	for(localObjectCounter=0; localObjectCounter<animSys.objectTape().length; localObjectCounter++)
	{
		radiusEnvelop = runTrigger("lfo", "radiusFire", 1, 1, animSys.lfos().getTotalRunTime("radiusFire")/2, 3, 0, radiusEnvelop, 1);
		trailDensityEnvelop = runTrigger("lfo", "trailDensityFire", 1, 1, animSys.lfos().getTotalRunTime("trailDensityFire")/2, 3, 0, trailDensityEnvelop, 1);
		trailLengthEnvelop = runTrigger("lfo", "trailLengthFire", 1, 1, animSys.lfos().getTotalRunTime("trailLengthFire")/2, 3, 0, trailLengthEnvelop, 1);
		animSys.objectTape()[localObjectCounter].animate(animSys.midi().getValue("colourIncrement"), animSys.midi().getValue("subColourIncrement"), animSys.midi().getValue("radiusScaler")*radiusEnvelop, [animSys.midi().getValue("trailSpeed"), animSys.midi().getValue("trailDensityScale")*trailDensityEnvelop ,animSys.midi().getValue("trailLengthScale")*trailLengthEnvelop, animSys.midi().getValue("trailThicknessScale")], [animSys.midi().getValue("xRotate"),animSys.midi().getValue("yRotate"),animSys.midi().getValue("zRotate")], [animSys.midi().getValue("innerXRotate"),animSys.midi().getValue("innerYRotate"),animSys.midi().getValue("innerZRotate")]);
	}
}
//-----------------------------	END ANIMATION FUNCTIONS	----------------------------

//--------------	Controll Triggers for ONE SHOT LFO/ENvelops		----------------
function checkTrigger(controlName, fireOnValue, envelopType, envelopName, stateToSet, timeCodeToSet)
{
	if(animSys.midi().hasChanged(controlName))
	{
		if(animSys.midi().getValue(controlName)==fireOnValue)
		{
			if(envelopType=="envelop")
			{
				animSys.envelops().setOneShotState(envelopName, stateToSet, timeCodeToSet);
			}
			else if(envelopType=="lfo")
			{
				animSys.lfos().setOneShotState(envelopName, stateToSet, timeCodeToSet);
			}
		}
	}
}
//--------------	run rime Trigger getter based on above		--------------
function runTrigger(envelopType, envelopName, readState, increment, endWhen, endState, endTimeCode, returnResetState, boostBy)
{
	if(envelopType=="envelop")
	{
		
	}
	else if(envelopType=="lfo")
	{
		if(animSys.lfos().getOneShotState(envelopName)==readState)
		{
			if(animSys.lfos().getTimeCode(envelopName)>endWhen)
			{
				animSys.lfos().setOneShotState(envelopName, endState, endTimeCode);
				return returnResetState;
			}
			else
			{
				return boostBy*(animSys.lfos().read(envelopName, increment, 0)/100);
			}
		}
		else
		{
			return returnResetState;
		}
	}
}
//--------------------------------------------------------------------------

function setUpScene(sceneToUse, lightingToUse)
{
	//Defauult Lighting
	var numberOfLights = 6;
	var localObjectCounter = 0;
	var localCentrePoints = [0,0];
	var lightRadius = 500;	
	var pixelMap = new pixelMaper();
	
	//clear Scene
	sceneToUse.clear();

	//set up lighting around the y axis	
	for(localObjectCounter=0; localObjectCounter<numberOfLights/2; localObjectCounter++)
	{
		lightingToUse.push(new THREE.DirectionalLight( 0xffffff, 1 ));
		localCentrePoints = pixelMap.getCircularPointsRaw(0, 0, lightRadius, (360/(numberOfLights/2))*localObjectCounter);
		lightingToUse[localObjectCounter].position.x = localCentrePoints[0];
		lightingToUse[localObjectCounter].position.y = 0;
		lightingToUse[localObjectCounter].position.z = localCentrePoints[1];
		lightingToUse[localObjectCounter].castShadow = true;
		sceneToUse.add(lightingToUse[localObjectCounter]);
	}	
	//set up lighting around the x axis
	for(localObjectCounter=numberOfLights/2; localObjectCounter<numberOfLights; localObjectCounter++)
	{
		lightingToUse.push(new THREE.DirectionalLight( 0xffffff, 1 ));
		localCentrePoints = pixelMap.getCircularPointsRaw(0, 0, lightRadius, (360/(numberOfLights/2))*localObjectCounter-(numberOfLights/2));
		lightingToUse[localObjectCounter].position.x = 0;
		lightingToUse[localObjectCounter].position.y = localCentrePoints[0];
		lightingToUse[localObjectCounter].position.z = localCentrePoints[1];
		sceneToUse.add(lightingToUse[localObjectCounter]);
	}

}

const materials = {};
function darkenNonBloomed( obj ) 
{
	if ( (obj.isMesh || obj.isPoints || obj.isLine)&& bloomLayer.test( obj.layers ) === false )
	{

		materials[ obj.uuid ] = obj.material;
		obj.material = darkMaterial;
	}
}
function restoreMaterial( obj )
{
	if ( materials[ obj.uuid ] ) 
	{
		obj.material = materials[ obj.uuid ];
		delete materials[ obj.uuid ];
	}
}



function animate() 
{
	var localObjectCounter;
	
	//check globaly assigned controls
	globalControlCheck();
	
	//play animation
	animSys.functions().animate();
	
	//Light Intencity
	if(animSys.midi().hasChanged("lightIntensity"))
	{
		for(localObjectCounter=0; localObjectCounter<animSys.lights().length; localObjectCounter++)
		{
			animSys.lights()[localObjectCounter].intensity  = animSys.midi().getValue("lightIntensity");
		}	
	}	
	requestAnimationFrame( animate );
	controls.update();
	//animSys.orbitalControls()[0].update();	
	
	//render
	//scene.traverse( darkenNonBloomed );
	animSys.scene().traverse( darkenNonBloomed );
	bloomComposer.render();
	//scene.traverse( restoreMaterial );
	animSys.scene().traverse( restoreMaterial );
	// render the entire scene, then render bloom scene on top
	composer.render();						//Render via effects composer
	
	//Auto rotate
	if(animSys.midi().hasChanged("autoRotate"))
	{
		if( animSys.midi().getValue("autoRotate")==1 )
		{
			controls.autoRotate=true;
			//animSys.orbitalControls()[0].autoRotate=true;
		}
		else
		{
			controls.autoRotate=false;
			//animSys.orbitalControls()[0].autoRotate=false;
		}
		controls.autoRotateSpeed = animSys.midi().getValue("autoRotateSpeed");
		//animSys.orbitalControls()[0].autoRotateSpeed = animSys.midi().getValue("autoRotateSpeed");
	}
	//Orbit reset
	if(animSys.midi().hasChanged("orbitReset"))
	{
		
		if(animSys.midi().getValue('orbitReset')==1)
		{
			camera.position.set(animSys.orbitalControls()[0][0],animSys.orbitalControls()[0][1],animSys.orbitalControls()[0][2]);
			//camera.fov = this.getGlobalVar("cameraFOV");
			//camera.up = new THREE.Vector3(0,1,0);
			//controls.reset();
			//animSys.orbitalControls()[0].reset();
		}
	}
	//camera director	
	if(animSys.midi().getValue("directCamera")==1 || animSys.midi().getValue("directCamera_LOCK")==1)
	{
		animSys.cd().setMotionSpeed(animSys.midi().getValue("cameraMotionSpeed"), animSys.midi().getValue("cameraMotionSpeed"), animSys.midi().getValue("cameraMotionSpeed"));
		animSys.cd().go(camera);
		if(animSys.cd().completed==1)
		{
			animSys.cd().completed=0;
		}
	}
	
	//Bloom Controls
	bloomPass.threshold = animSys.midi().getValue("bloomThreshold");
	bloomPass.strength = animSys.midi().getValue("bloomStrength");
	bloomPass.radius = animSys.midi().getValue("bloomRadius");
}
animate();


//checks for global control pushes during animation
function globalControlCheck()
{
	var animationIndex=0, currentIndex=animSys.current;
	
	if(animSys.midi().hasChanged("NextAnimation"))
	{
		if(animSys.midi().getValue("NextAnimation")==1)
		{
			animSys.next(camera, true);
			animationChange();
		}
	}
	else if(animSys.midi().hasChanged("X_NextAnimation"))
	{
		if(animSys.midi().getValue("X_NextAnimation")==1)
		{
			animSys.next(camera, true);
			animationChange();
		}
	}
	
	if(animSys.midi().hasChanged("PreviousAnimation"))
	{
		if(animSys.midi().getValue("PreviousAnimation")==1)
		{
			animSys.previous(camera, true);
			animationChange();
		}
	}
	else if(animSys.midi().hasChanged("X_PreviousAnimation"))
	{
		if(animSys.midi().getValue("X_PreviousAnimation")==1)
		{
			animSys.previous(camera, true);
			animationChange();
		}
	}
	//CHecks for animation que changes from launcphad x
	for(animationIndex=0; animationIndex<animSys.animations.length; animationIndex++)
	{
		if( animSys.midi().hasChanged( animSys.animations[animationIndex].name ) )
		{
			if(animSys.midi().getValue(animSys.animations[animationIndex].name)==1)
			{
				animSys.gotoName(camera, animSys.animations[animationIndex].name, true);
				animationChange();
				/*
				if(currentIndex!=animSys.current)
				{
					animSys.midi().setValue("orbitReset", 1);
				}
				*/
			}
		}
	}
}
//sets up global controls for each animation in the system
function globalControls()
{
	var controlIndex=0, aIndex=0;
	
	for(aIndex=0; aIndex<animSys.animations.length; aIndex++)
	{
		//GLobal Animation controls
		animSys.midiControls[aIndex].addItem(176, 107, "NextAnimation", 1, 0);
		animSys.midiControls[aIndex].addItem(176, 106, "PreviousAnimation", 1, 0);
		for(controlIndex=0; controlIndex<animSys.animations.length; controlIndex++)
		{
			animSys.midiControls[aIndex].addItem(144, animSys.animations[controlIndex].padAssign, animSys.animations[controlIndex].name, 1, 0);
		}
	}
	
}

//-------------MIDI FUNCTIONS--------------------------
function onMIDISuccess(midiAccess)
{
	var midiDevCounter=0;
	var midiDeviceDetails = new Array();
	
	//Assign ONMIDI event listeners to all INPUTS
	for(var input of midiAccess.inputs.values())
	{
		input.onmidimessage = getMIDIMessage;
    }
	//Get list of midi devices
	midiAccess.outputs.forEach(output => midiDeviceDetails.push([output.manufacturer, output.name, output.id]));
	for(midiDevCounter=0; midiDevCounter<midiDeviceDetails.length; midiDevCounter++)
	{
		console.log("Manufacturer["+midiDeviceDetails[midiDevCounter][0]+"]\tName["+midiDeviceDetails[midiDevCounter][1]+"]\tID["+midiDeviceDetails[midiDevCounter][2]+"]");
		if(midiDeviceDetails[midiDevCounter][1].includes(primaryMidiControler[0]) && midiDeviceDetails[midiDevCounter][1].includes("OUT")==false)
		{
			primaryMidiControler[1] = midiDeviceDetails[midiDevCounter][2];
		}
	}
	//Set up output to Launch Control XL
	if(primaryMidiControler[1]!="")
	{
		outputMIDIDevice = midiAccess.outputs.get(primaryMidiControler[1]);
		outputMIDIDevice.open();
	}
	else
	{
		console.log("\tError Opening Primary Midi Controler.");
	}
}
function onMIDIFailure()
{
    console.log('Could not access your MIDI devices.');
}
function getMIDIMessage(midiMessage) 
{
	var currentControlName, testIndex=0;
	//Comment out to stop MIDI debug
	console.log(midiMessage.data[0]+" "+midiMessage.data[1]+" "+midiMessage.data[2]);
	//sysex
	/*
	var sysExMessage = [240,0,32,41,2,17,119,0,247]; 					//sysExMessage[7] is the PAGE NUMEBR
	*/
	animSys.midi().onMidiEvent(midiMessage)
	//filter out KEYboard note presses
	//Note ON events are  0[144+MIDI CHANEL-1] 1[KEY ID] 2[VELOCITY]
	//Note OFF events are 0[128+MIDI CHANEL-1] 1[KEY ID] 2[VELOCITY] 
	if(midiMessage.data[0]>=144 && midiMessage.data[0]<=159)
	{
		//Note ON
		testIndex = animSys.midi().findControlKeyIndex(midiMessage.data[1]);
		//testIndex = animSys.midi().findControlIndex(midiMessage.data[0],midiMessage.data[1]);
		if(testIndex!=-1)
		{
			currentControlName = animSys.midi().midiMapArray[ testIndex ][2];
			console.log("["+currentControlName+"]->["+animSys.midi().midiMapArray[ testIndex ][4]+"]");
		}
	}
	else if(midiMessage.data[0]>=128 && midiMessage.data[0]<=143)
	{
		//Note OFF
		testIndex = animSys.midi().findControlKeyIndex(midiMessage.data[1]);
		//testIndex = animSys.midi().findControlIndex(midiMessage.data[0],midiMessage.data[1]);
		if(testIndex!=-1)
		{
			currentControlName = animSys.midi().midiMapArray[ testIndex ][2];
			console.log("["+currentControlName+"]->["+animSys.midi().midiMapArray[ testIndex ][4]+"]");
		}
	}
	else
	{
		//Debug Actual value
		currentControlName = animSys.midi().getNameFromCCID(midiMessage.data[0], midiMessage.data[1]);
		if(currentControlName!=-1)
		{
			console.log("["+currentControlName+"]->["+animSys.midi().getValueFromCCID(midiMessage.data[0], midiMessage.data[1],1)+"]");
		}
	}
}
//-------------MIDI FUNCTIONS--------------------------
////------------	HUD Live Feedback system - WEB SOCKET Functions	------------
function initHUDWebSockets()
{
	var hudServer = document.baseURI.substring(8, document.baseURI.length-6);
	wsHUD = new WebSocket("wss://"+hudServer+":8001");
	
	wsHUD.onopen = function()
	{
		wsHUD.send("SENDER_READY.");
		animSys.midi().wsHUD = wsHUD;
		animSys.midi().webSocketConnected=1;
	};

	wsHUD.onclose = function()
	{
		animSys.midi().wsHUD = null;
		animSys.midi().webSocketConnected=0;
	};

	wsHUD.onmessage = function(event)
	{
		
	};
	
}

//------------	WEB SOCKET Functions not currently enabled------------
function initWebSockets()
{
	wsObject = new WebSocket("wss://localhost:8000");
	
	wsObject.onopen = function()
	{
		wsObject.send("HELLO_FROM_CLIENT");
	};

	wsObject.onclose = function()
	{
	};

	wsObject.onmessage = function(event)
	{
		handleOSCEvent(event.data);
	};
}
function handleOSCEvent(data)
{
	var currValue = 0, numberOfValues=0;
	var currControl = "";
	var valIndex=0, valCounter=0;
	var valueArray;
	
	//Uncomment to view raw OSC messages
	//console.log("["+data+"]");
	
	currControl = data.substr(0, findNeedle(',', data, 0));
	numberOfValues = data.substr(findNeedle(',', data, 0)+1, (findNeedle(',', data, 1))-(findNeedle(',', data, 0)+1) );
	valueArray = new Array(numberOfValues);
	for(valCounter=0; valCounter<numberOfValues; valCounter++)
	{
		valIndex = findNeedle(',', data, 1+valCounter)+1;
		if(valCounter+1<numberOfValues)
		{
			valueArray[valCounter] = data.substr(valIndex, findNeedle(',', data, 1+(valCounter+1))-valIndex);
			//console.log("more Value["+valCounter+"]["+valueArray[valCounter]+"]");
		}
		else
		{
			valueArray[valCounter] = data.substr(valIndex, data.length-valIndex);
			//console.log("last Value["+valCounter+"]["+valueArray[valCounter]+"]");
		}
	}
	currValue = valueArray[numberOfValues-1];
	//Uncomment to view raw OSC messages
	//console.log("Contol Name["+currControl+"]\tNumber Of Values["+numberOfValues+"]\tLastValue["+currValue+"]");
	//animSys.midi().setMidiValue(currControl, currValue*127);
	animSys.midi().setMidiValue(currControl, currValue);
	animSys.midi().setMultiValues(currControl, valueArray);
	//Custom handler for Ableton MIDI to OSC Note reception to intercept all notes and place them into the noteStack
	/*
	if(currControl=="N1")
	{
		animSys.midi().noteStack.push(valueArray);
	}
	*/
}
function findNeedle(needle, haystack, needleCount)
{
	var aIndex=0, nCount=0;
	
	for(aIndex=0; aIndex<haystack.length; aIndex++)
	{
		if(haystack[aIndex]==needle && nCount==needleCount)
		{
			return aIndex;
		}
		else if(haystack[aIndex]==needle && nCount<needleCount)
		{
			nCount++;
		}
	}
	return -1;
}
//------------	WEB SOCKET Functions	------------
