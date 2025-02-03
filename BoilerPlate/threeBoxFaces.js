import * as THREE from 'three';
import envelopGenerator from './envelopGenerator.js';					//Envelop Generator
import CCGenerator from './CCGenerator.js';								//Colour System
import timerObject from './timerObject.js';								//Timers
import pixelMaper from './pixelMaper.js';								//Pixel Maper
import animationObject from './animationObject.js';						//Generic Object Tracking class
import ElipticalEnvelopGenerator from './ElipticalEnvelopGenerator.js';

class threeBoxFaces
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
		this.radius = 50;
		this.facesPerLayer = 10;
		this.faceDimensions = [10,10];
		this.faceOffset = 0.01;
		this.layerCount = 10;
		this.pointsPerLayer = 4;
		this.layerOpacity = 1;
		this.setUpStatus = 0;
		this.multiObject = 0;
		this.bloomEnable = 1;
		this.startAngle = (1/360)*45;
		
		//Utility Objects
		this.pixelMap = new pixelMaper(2,2);
		this.screenRange = [300,200,300];
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
	animate = function(colourIncrement, subColourIncrement, radiusScaler, layerSpeed, faceSpeed, rotationalIncrements=[0,0,0])
	{
		//creation loop
		this.orbitCreationLoop();
		if(this.setUpStatus==0){return;}
		var localObjectCounter=0, faceCounter=0, vectorPoints, pointPos, verticiesCounter=0, verticies;
		
		for(localObjectCounter=0; localObjectCounter<this.objectTape.length; localObjectCounter++)
		{
			this.objectTape[localObjectCounter].motionIncrements[0] = (this.objectTape[localObjectCounter].motionIncrements[0]+faceSpeed)%1;
			this.objectTape[localObjectCounter].motionIncrements[2] = this.objectTape[localObjectCounter].motionIncrements[2]+layerSpeed;
			//recalculate shape paths
			pointPos = this.pixelMap.getElipticalPointsRaw(0,0,this.radius*radiusScaler, this.radius*radiusScaler, (((180/this.objectTape.length)*localObjectCounter)+this.objectTape[localObjectCounter].motionIncrements[2])%180 );
			this.objectTape[localObjectCounter].radius = pointPos[0];
			this.objectTape[localObjectCounter].position[2] = pointPos[1];
			this.objectTape[localObjectCounter].shape[0] = new THREE.Shape();
			this.objectTape[localObjectCounter].shape[1] = new THREE.Shape();
			this.objectTape[localObjectCounter].shape[0].ellipse( 0, 0, this.objectTape[localObjectCounter].radius, this.objectTape[localObjectCounter].radius, 0, 2*Math.PI, false, 0);
			verticies = new Array();
			for(verticiesCounter=0; verticiesCounter<this.pointsPerLayer; verticiesCounter++)
			{
				vectorPoints = this.objectTape[localObjectCounter].shape[0].getPoint(((verticiesCounter/this.pointsPerLayer)+this.startAngle)%1);
				verticies.push( new THREE.Vector3(vectorPoints.x, vectorPoints.y,  pointPos[1]) );
				if(verticiesCounter==0)
				{
					this.objectTape[localObjectCounter].shape[1].moveTo(vectorPoints.x, vectorPoints.y);
				}
				else
				{
					this.objectTape[localObjectCounter].shape[1].lineTo(vectorPoints.x, vectorPoints.y);
				}
				
			}
			//insert 1st point again
			vectorPoints = this.objectTape[localObjectCounter].shape[0].getPoint(this.startAngle);
			verticies.push( new THREE.Vector3(vectorPoints.x, vectorPoints.y, pointPos[1]) );
			this.objectTape[localObjectCounter].shape[1].lineTo(vectorPoints.x, vectorPoints.y);
			this.objectTape[localObjectCounter].geometry[0].setFromPoints( verticies );
			
			for(faceCounter=0; faceCounter<this.objectTape[localObjectCounter].pollyPoints; faceCounter++)
			{
				vectorPoints = this.objectTape[localObjectCounter].shape[1].getPoint((this.objectTape[localObjectCounter].motionIncrements[0]+(this.faceOffset*faceCounter))%1);
				this.objectTape[localObjectCounter].objects[faceCounter+1].position.set(vectorPoints.x, vectorPoints.y, this.objectTape[localObjectCounter].position[2]);
				this.objectTape[localObjectCounter].objects[faceCounter+1].rotateX( ((-faceSpeed/1)*360)*(Math.PI/180) )
				//face colour
				this.colourObject.getColour(this.subColourIndex%this.colourObject._bandWidth);
				this.objectTape[localObjectCounter].materials[faceCounter+1].color.r = this.colourObject._currentColour[0]/255;
				this.objectTape[localObjectCounter].materials[faceCounter+1].color.g = this.colourObject._currentColour[1]/255;
				this.objectTape[localObjectCounter].materials[faceCounter+1].color.b = this.colourObject._currentColour[2]/255;
				this.subColourIndex += subColourIncrement;
			}
		}
		this.colourIndex += colourIncrement;
		this.subColourIndex = this.colourIndex;
		
		this.globalObjectGroup.rotateX( (rotationalIncrements[0])*(Math.PI/180)*this.directionalVectors[0] );
		this.globalObjectGroup.rotateY( (rotationalIncrements[1])*(Math.PI/180)*this.directionalVectors[1] );
		this.globalObjectGroup.rotateZ( (rotationalIncrements[2])*(Math.PI/180)*this.directionalVectors[2] );
		
		/*
		var localObjectCounter=0, zIndex=0, vectorPoints, pointPos, trailIndex, trailCounter;
		var localDepth = this.screenRange[2]*(dimensionScalers[2]+0.01);
		var localZstart  = -(localDepth/2);
		var localTrailSpacing = this.trailSpacing;
		
		this.dimensionScalers = [dimensionScalers[0], dimensionScalers[1], rotationalIncrementScaler];
		for(localObjectCounter=0; localObjectCounter<this.objectTape.length; localObjectCounter++)
		{
			this.objectTape[localObjectCounter].shape = new Array();
			this.objectTape[localObjectCounter].motionIncrements[0] += lineRotationSpeed;
			for(zIndex=0; zIndex<localDepth; zIndex++)
			{
				pointPos = this.pixelMap.getElipticalPointsRaw(0, 0, this.objectTape[localObjectCounter].dimensions[0]+(this.dimensionScalers[0]*zIndex), this.objectTape[localObjectCounter].dimensions[1]+(this.dimensionScalers[1]*zIndex), (zIndex*this.dimensionScalers[2])-this.objectTape[localObjectCounter].motionIncrements[0]);
				vectorPoints = new THREE.Vector3(this.objectTape[localObjectCounter].position[0]+pointPos[1], pointPos[0], (localZstart)+zIndex);
				this.objectTape[localObjectCounter].shape.push(vectorPoints);
			}
			this.objectTape[localObjectCounter].geometry[0].setFromPoints( this.objectTape[localObjectCounter].shape );
			//colour
			this.colourObject.getColour(this.subColourIndex%this.colourObject._bandWidth);
			this.objectTape[localObjectCounter].materials[0].color.r = this.colourObject._currentColour[0]/255;
			this.objectTape[localObjectCounter].materials[0].color.g = this.colourObject._currentColour[1]/255;
			this.objectTape[localObjectCounter].materials[0].color.b = this.colourObject._currentColour[2]/255;
			this.subColourIndex += subColourIncrement;
			//trail position
			this.objectTape[localObjectCounter].motionIncrements[1] = Math.round((this.objectTape[localObjectCounter].motionIncrements[1]+(this.objectTape[localObjectCounter].motionIncrements[2]*trailSpeed)))%this.objectTape[localObjectCounter].shape.length;
			trailIndex = this.objectTape[localObjectCounter].motionIncrements[1];
			this.subColourIndex = this.objectTape[localObjectCounter].colourIndex;
			if(this.trailSpacingLFOEnable==1)
			{
				localTrailSpacing = this.trailSpacing*this.lfo.read(localObjectCounter, trailSpacingLFO, 0)/100;
			}
			for(trailCounter=0; trailCounter<this.objectTape[localObjectCounter].pollyPoints; trailCounter++)
			{
				trailIndex = Math.round(((this.objectTape[localObjectCounter].motionIncrements[1]+(trailCounter*localTrailSpacing)))) %this.objectTape[localObjectCounter].shape.length;
				this.objectTape[localObjectCounter].objects[trailCounter+1].position.set(this.objectTape[localObjectCounter].shape[trailIndex].x, this.objectTape[localObjectCounter].shape[trailIndex].y, this.objectTape[localObjectCounter].shape[trailIndex].z);
				//colour
				this.colourObject.getColour(this.objectTape[localObjectCounter].colourIndex%this.colourObject._bandWidth);
				this.objectTape[localObjectCounter].materials[trailCounter+1].color.r = this.colourObject._currentColour[0]/255;
				this.objectTape[localObjectCounter].materials[trailCounter+1].color.g = this.colourObject._currentColour[1]/255;
				this.objectTape[localObjectCounter].materials[trailCounter+1].color.b = this.colourObject._currentColour[2]/255;
				this.objectTape[localObjectCounter].colourIndex += subColourIncrement;
			}
			
			this.subColourIndex += subColourIncrement;
			this.objectTape[localObjectCounter].colourIndex = this.subColourIndex;
		}
		this.colourIndex += colourIncrement;
		this.subColourIndex = this.colourIndex;
		
	
		this.globalObjectGroup.rotateX( (rotationalIncrements[0])*(Math.PI/180) );
		this.globalObjectGroup.rotateY( (rotationalIncrements[1])*(Math.PI/180) );
		this.globalObjectGroup.rotateZ( (rotationalIncrements[2])*(Math.PI/180) );
		*/
		
	}
	updatePath = function()
	{
		if(this.setUpStatus==0){return;}
	}
	insertObject = function()
	{
		var layerCounter=0, faceCounter=0, verticiesCounter=0, zStart = 0-(this.radius);
		var vectorPoints, verticies, pointPos;
		var localGroup;
		
		for(layerCounter=0; layerCounter<this.layerCount; layerCounter++)
		{
			localGroup = new THREE.Object3D();
			this.objectTape.push( new animationObject() );
			this.objectTape[layerCounter].position = [0,0,0];
			this.objectTape[layerCounter].radius = this.radius;
			this.objectTape[layerCounter].dimensions = [this.faceDimensions[0], this.faceDimensions[1], 0];
			this.objectTape[layerCounter].pollyPoints = this.facesPerLayer;
			this.objectTape[layerCounter].colourIndex = this.colourIndex+(layerCounter*50);
			this.objectTape[layerCounter].motionIncrements[0] = Math.random();
			this.generatedirectionalVectors();
			//this.objectTape[layerCounter].rotations = [this.directionalVectors[0], this.directionalVectors[1], this.directionalVectors[2]];
			//create layers shape object to opain points
			pointPos = this.pixelMap.getElipticalPointsRaw(0,0,this.radius, this.radius, (180/this.layerCount)*layerCounter);
			this.objectTape[layerCounter].radius = pointPos[0];
			this.objectTape[layerCounter].position[2] = pointPos[1];
			verticies = new Array();
			this.objectTape[layerCounter].shape.push( new THREE.Shape() );
			this.objectTape[layerCounter].shape.push( new THREE.Shape() );
			this.objectTape[layerCounter].shape[0].ellipse( 0, 0, this.objectTape[layerCounter].radius, this.objectTape[layerCounter].radius, 0, 2*Math.PI, false, 0);
			for(verticiesCounter=0; verticiesCounter<this.pointsPerLayer; verticiesCounter++)
			{
				vectorPoints = this.objectTape[layerCounter].shape[0].getPoint(((verticiesCounter/this.pointsPerLayer)+this.startAngle)%1);
				verticies.push( new THREE.Vector3(vectorPoints.x, vectorPoints.y,  pointPos[1]) );
				if(verticiesCounter==0)
				{
					this.objectTape[layerCounter].shape[1].moveTo(vectorPoints.x, vectorPoints.y);
				}
				else
				{
					this.objectTape[layerCounter].shape[1].lineTo(vectorPoints.x, vectorPoints.y);
				}
				
			}
			//insert 1st point again
			vectorPoints = this.objectTape[layerCounter].shape[0].getPoint(this.startAngle);
			verticies.push( new THREE.Vector3(vectorPoints.x, vectorPoints.y, pointPos[1]) );
			this.objectTape[layerCounter].shape[1].lineTo(vectorPoints.x, vectorPoints.y);
			
			this.objectTape[layerCounter].geometry.push(new THREE.BufferGeometry());
			this.objectTape[layerCounter].materials.push( new THREE.LineBasicMaterial({color: 0xffffff}) );
			this.objectTape[layerCounter].materials[0].transparent = true;
			this.objectTape[layerCounter].materials[0].opacity = this.layerOpacity;
			this.objectTape[layerCounter].geometry[0].setFromPoints( verticies );
			this.objectTape[layerCounter].objects.push( new THREE.Line(this.objectTape[layerCounter].geometry[0], this.objectTape[layerCounter].materials[0]) );
			/*
			if(this.bloomEnable==1)
			{
				this.objectTape[layerCounter].objects[0].layers.enable( 1 );
			}
			*/
			localGroup.add( this.objectTape[layerCounter].objects[0] );
			
			this.globalGroupArray.push( localGroup );
			this.globalObjectGroup.add( localGroup );
			
			//insert faces that follow lines path
			for(faceCounter=0; faceCounter<this.objectTape[layerCounter].pollyPoints; faceCounter++)
			{
				//this.objectTape[layerCounter].geometry.push(new THREE.PlaneGeometry(this.objectTape[layerCounter].dimensions[0]*(faceCounter/this.objectTape[layerCounter].pollyPoints), this.objectTape[layerCounter].dimensions[1]*(faceCounter/this.objectTape[layerCounter].pollyPoints), 20, 20));
				this.objectTape[layerCounter].geometry.push(new THREE.CircleGeometry(this.objectTape[layerCounter].dimensions[0]*(faceCounter/this.objectTape[layerCounter].pollyPoints), 20));
				this.objectTape[layerCounter].materials.push( new THREE.MeshLambertMaterial({color: 0x0000ff, side: THREE.DoubleSide}) );
				this.objectTape[layerCounter].materials[faceCounter+1].transparent = true;
				this.objectTape[layerCounter].materials[faceCounter+1].opacity = 1;
				this.objectTape[layerCounter].objects.push( new THREE.Mesh(this.objectTape[layerCounter].geometry[faceCounter+1], this.objectTape[layerCounter].materials[faceCounter+1]) );
				vectorPoints = this.objectTape[layerCounter].shape[1].getPoint(this.faceOffset*faceCounter);
				this.objectTape[layerCounter].objects[faceCounter+1].position.set(vectorPoints.x-(this.objectTape[layerCounter].dimensions[0]/2), vectorPoints.y, this.objectTape[layerCounter].position[2]);
				this.objectTape[layerCounter].objects[faceCounter+1].rotateY(90*(Math.PI/180));
				if(this.bloomEnable==1)
				{
					this.objectTape[layerCounter].objects[faceCounter+1].layers.enable( 1 );
				}
				localGroup.add( this.objectTape[layerCounter].objects[faceCounter+1] );
				
				this.globalGroupArray.push( localGroup );
				this.globalObjectGroup.add( localGroup );
			}
		}
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
export default threeBoxFaces;