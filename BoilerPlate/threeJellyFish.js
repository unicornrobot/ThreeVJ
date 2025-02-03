import * as THREE from 'three';
import envelopGenerator from './envelopGenerator.js';					//Envelop Generator
import CCGenerator from './CCGenerator.js';								//Colour System
import timerObject from './timerObject.js';								//Timers
import pixelMaper from './pixelMaper.js';								//Pixel Maper
import animationObject from './animationObject.js';						//Generic Object Tracking class
import ElipticalEnvelopGenerator from './ElipticalEnvelopGenerator.js';

class threeJellyFish
{	
	constructor()
	{
		//Main object stores
		this.objectTape = new Array();
		this.globalGroupArray = new Array();
		this.globalObjectGroup = new THREE.Object3D();
		this.groupName = "BF_";
		this.objectIDIndex = 0;
		this.genObject = new animationObject();
		
		//Global Three Objects form main System
		this.scene;
		
		//Main properties
		this.origin = [0,0,0];
		this.latheLength = 5;
		this.segmentCount = 10;
		this.radius = 50;
		this.LFO1Increment = 0;
		this.LFO2Increment = 0;
		this.setUpStatus = 0;
		this.multiObject = 0;
		this.bloomEnable = 1;
		this.bloomModulus = 3;
		
		//Utility Objects
		this.pixelMap = new pixelMaper(2,2);
		this.screenRange = [300,200,400];
		this.timers = new timerObject();
		this.envelops = new envelopGenerator();
		this.lfo = new ElipticalEnvelopGenerator();
		this.directionalVectors = [1,1,1];
		
		//Colour System
		this.colourIndex = 0;
		this.subColourIndex = 0;
		this.maxValue = 255;
		this.maxColourDitherSteps = 128;
		this.colourList_1 = [this.maxValue,0,0,this.maxValue,this.maxValue,0, 0,this.maxValue,0, 0,this.maxValue,this.maxValue, 0,0,this.maxValue, this.maxValue,0,this.maxValue, this.maxValue,this.maxValue,this.maxValue];
		this.colourObject = new CCGenerator(this.maxColourDitherSteps, this.colourList_1.length/3, this.colourList_1);
	}
	
	init = function(scene, colourIndex)
	{
		this.scene = scene;
		this.colourIndex = colourIndex;
	}
	animate = function(colourIncrement, subColourIncrement, dimensionScalers, radiusScaler, layerSpeed, faceSpeed, rotationalIncrements=[0,0,0])
	{
		//creation loop
		this.orbitCreationLoop();
		if(this.setUpStatus==0){return;}
		
		
		var localObjectCounter=0, verticies, pointPos, verticiesCounter, radiusPos, tempRadius=this.radius*radiusScaler, segmentCounter=0, segmentAngle=0, segmentSpace = (360-(this.segmentCount*this.latheLength))/this.segmentCount;
		var localMostionIncrement;
		
		for(localObjectCounter=0; localObjectCounter<this.objectTape.length; localObjectCounter++)
		{
			verticies = new Array();
			this.objectTape[localObjectCounter].motionIncrements[0]+=layerSpeed+this.LFO1Increment;
			this.lfo.setTimeCode("radius", this.objectTape[localObjectCounter].motionIncrements[0]);
			for(verticiesCounter=0; verticiesCounter<180; verticiesCounter++)
			{
				radiusPos = this.lfo.read("radius", faceSpeed+this.LFO2Increment, 0)/100;
				pointPos = this.pixelMap.getElipticalPointsRaw(0,0,tempRadius+((10*dimensionScalers[0])*radiusPos), tempRadius+((10*dimensionScalers[1])*radiusPos), verticiesCounter);
				verticies.push( new THREE.Vector2(pointPos[0], pointPos[1]) );
			}
			for(segmentCounter=0; segmentCounter<this.objectTape[localObjectCounter].objects.length; segmentCounter++)
			{
				this.globalGroupArray[0].remove(this.objectTape[localObjectCounter].objects[segmentCounter]);
			}
			this.objectTape[localObjectCounter].geometry[0].dispose();
			this.objectTape[localObjectCounter].geometry[0] = new THREE.LatheGeometry(verticies, 20, 0, this.latheLength*(Math.PI/180));
			segmentAngle=0;
			for(segmentCounter=0; segmentCounter<this.segmentCount; segmentCounter++)
			{
				this.objectTape[localObjectCounter].objects[segmentCounter] = new THREE.Mesh(this.objectTape[localObjectCounter].geometry[0], this.objectTape[localObjectCounter].materials[segmentCounter]);
				if(segmentCounter%this.bloomModulus==this.bloomModulus-1)
				{
					this.objectTape[localObjectCounter].objects[segmentCounter].layers.enable( 1 );
				}
				this.objectTape[localObjectCounter].objects[segmentCounter].rotateY(segmentAngle*(Math.PI/180));
				this.colourObject.getColour(this.subColourIndex%this.colourObject._bandWidth);
				this.objectTape[localObjectCounter].materials[segmentCounter].color.r = this.colourObject._currentColour[0]/255;
				this.objectTape[localObjectCounter].materials[segmentCounter].color.g = this.colourObject._currentColour[1]/255;
				this.objectTape[localObjectCounter].materials[segmentCounter].color.b = this.colourObject._currentColour[2]/255;
				this.subColourIndex += subColourIncrement;
				segmentAngle+=segmentSpace+this.latheLength;
				this.globalGroupArray[0].add(this.objectTape[localObjectCounter].objects[segmentCounter]);
			}
			//position and motion
			/*
			localMostionIncrement = (this.objectTape[localObjectCounter].motionIncrements[1]*dimensionScalers[2])
			if(this.objectTape[localObjectCounter].position[2]+localMostionIncrement<this.screenRange[2])
			{
				this.objectTape[localObjectCounter].position[2] += localMostionIncrement;
			}
			else
			{
				this.objectTape[localObjectCounter].position[2] = -this.screenRange[2];
			}
			*/
			this.globalObjectGroup.position.set(this.objectTape[localObjectCounter].position[0],this.objectTape[localObjectCounter].position[1],this.objectTape[localObjectCounter].position[2]);		
			
		}
		
		this.colourIndex += colourIncrement;
		this.subColourIndex = this.colourIndex;
		
		this.globalObjectGroup.rotateX( (rotationalIncrements[0])*(Math.PI/180)*this.directionalVectors[0] );
		this.globalObjectGroup.rotateY( (rotationalIncrements[1])*(Math.PI/180)*this.directionalVectors[1] );
		this.globalObjectGroup.rotateZ( (rotationalIncrements[2])*(Math.PI/180)*this.directionalVectors[2] );	
		
	}
	updatePath = function()
	{
		if(this.setUpStatus==0){return;}
	}
	insertObject = function()
	{
		var verticies, pointPos, verticiesCounter, layerCounter=0, radiusPos, segmentCounter=0, segmentAngle=0, segmentSpace = (360-(this.segmentCount*this.latheLength))/this.segmentCount;
		var localGroup;
		
		localGroup = new THREE.Object3D();
		this.lfo.addWithTimeCode("radius", [100], [50], 0, 45/2);
		this.objectTape.push( new animationObject() );
		this.objectTape[layerCounter].position = [this.origin[0],this.origin[1],this.origin[2]];
		this.objectTape[layerCounter].radius = this.radius;
		this.objectTape[layerCounter].colourIndex = this.colourIndex+(layerCounter*50);
		this.objectTape[layerCounter].motionIncrements[0] = Math.random();
		this.objectTape[layerCounter].motionIncrements[1] = (Math.random()*2)+0.2;
		this.generatedirectionalVectors();
		//create layers shape object to opain points
		verticies = new Array();
		for(verticiesCounter=0; verticiesCounter<90; verticiesCounter++)
		{
			radiusPos = this.lfo.read("radius", 2, 0)/100;
			pointPos = this.pixelMap.getElipticalPointsRaw(0,0,this.radius+(10*radiusPos), this.radius+(10*radiusPos), verticiesCounter);
			verticies.push( new THREE.Vector2(pointPos[0], pointPos[1]) );
		}
		this.objectTape[layerCounter].geometry.push(new THREE.LatheGeometry(verticies, 32, 0, this.latheLength*(Math.PI/180)));
		segmentAngle=0;
		for(segmentCounter=0; segmentCounter<this.segmentCount; segmentCounter++)
		{			
			this.objectTape[layerCounter].materials.push( new THREE.MeshLambertMaterial({color: 0xffffff, side: THREE.DoubleSide}) );
			this.objectTape[layerCounter].materials[segmentCounter].transparent = true;
			this.objectTape[layerCounter].materials[segmentCounter].opacity = 1;
			this.objectTape[layerCounter].objects.push( new THREE.Mesh(this.objectTape[layerCounter].geometry[0], this.objectTape[layerCounter].materials[segmentCounter]) );
			if(segmentCounter%this.bloomModulus==this.bloomModulus-1)
			{
				this.objectTape[layerCounter].objects[segmentCounter].layers.enable( 1 );
			}
			this.objectTape[layerCounter].objects[segmentCounter].rotateY(segmentAngle*(Math.PI/180));
			segmentAngle+=segmentSpace+this.latheLength;
			localGroup.add( this.objectTape[layerCounter].objects[segmentCounter] );
		}
		
		this.globalGroupArray.push( localGroup );
		this.globalObjectGroup.add( localGroup );
		
		//complete set up
		this.globalObjectGroup.position.x =  this.origin[0];
		this.globalObjectGroup.position.y =  this.origin[1];
		this.globalObjectGroup.position.z =  this.origin[2];

		if(this.multiObject==0)
		{
			this.scene.add( this.globalObjectGroup );
		}
		this.setUpStatus = 1;
	}
	generatedirectionalVectors = function()
	{
		if( Math.round(Math.random()) == 1 ){this.directionalVectors[0]=1;}else{this.directionalVectors[0]=-1;}
		if( Math.round(Math.random()) == 1 ){this.directionalVectors[1]=1;}else{this.directionalVectors[1]=-1;}
		if( Math.round(Math.random()) == 1 ){this.directionalVectors[2]=1;}else{this.directionalVectors[2]=-1;}
	}
	seed = function(originPoint)
	{
		if(originPoint==undefined)
		{
			this.origin[0] = (-this.screenRange[0])+Math.round(Math.random()*(this.screenRange[0]*2));
			this.origin[1] = (this.screenRange[1])-Math.round(Math.random()*(this.screenRange[1]*2));
			this.origin[2] = (-this.screenRange[2])+Math.round(Math.random()*(this.screenRange[2]*2));
		}
		else
		{
			this.origin[0] = originPoint[0];
			this.origin[1] = originPoint[1];
			this.origin[2] = originPoint[2];
		}
		this.create = 0;
	}
	orbitCreationLoop = function()
	{
		if(this.setUpStatus==0)
		{
			this.insertObject();
		}
	}
}
export default threeJellyFish;