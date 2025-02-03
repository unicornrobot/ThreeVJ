import * as THREE from 'three';
import envelopGenerator from './envelopGenerator.js';					//Envelop Generator
import CCGenerator from './CCGenerator.js';								//Colour System
import timerObject from './timerObject.js';								//Timers
import pixelMaper from './pixelMaper.js';								//Pixel Maper
import animationObject from './animationObject.js';						//Generic Object Tracking class

class threeOrbitalBeams
{	
	constructor()
	{
		//Main object stores
		this.objectTape = new Array();
		this.beamArray = new Array();
		this.orbitArray = new Array();
		this.globalObject = new THREE.Object3D();
		this.groupName = "OB_";
		this.objectIDIndex = 0;
		this.genObject = new animationObject();
		
		//Global Three Objects form main System
		this.scene;
		
		//Main properties for Beams
		this.numberOfBeams = 50;
		this.beamDimensions = [1,1,10];
		this.beamPosition = [0,0,0];
		this.beamRadiusRange = 2;
		this.beamLiveTime = 2000;
		this.beamColourRange = 100;
		this.maxBeamSpeed = 50;
		this.beamStatus = -1;
		//Main properties for orbital points around beams
		this.numberOfOrbits = 0;
		this.totalOrbits = 20;
		this.pointsPerOrbit = 50;										
		this.maxOrbitRadius = 20;
		this.maxOrbitWoble = 5;
		this.maxOrbitSpeed = 2;
		this.orbitOrigin = [0,0,0];
		this.orbitInsertionDelay = 100;
		//General properties
		this.beamLength = 200;
		this.randomDirectionArray = [1,1,1];
		this.create = -1;
		this.objectActionTimes = [5000, 2000];
		this.defaultFadeDelay = -1;
		this.disposing = 0;
		//Utility Objects
		this.pixelMap = new pixelMaper(2,2);
		this.screenRange = [100,100,200];
		this.timers = new timerObject();
		this.envelops = new envelopGenerator();
		this.objectCounter=0;
		//Colour System
		this.colourIndex = 0;
		this.maxValue = 255;
		this.maxColourDitherSteps = 128;
		this.colourList_1 = [this.maxValue,0,0,this.maxValue,this.maxValue,0, 0,this.maxValue,0, 0,this.maxValue,this.maxValue, 0,0,this.maxValue, this.maxValue,0,this.maxValue, this.maxValue,this.maxValue,this.maxValue];
		this.colourObject = new CCGenerator(this.maxColourDitherSteps, this.colourList_1.length/3, this.colourList_1);
	}
	
	init = function(scene, colourIndex)
	{
		this.scene = scene;
		this.colourIndex = colourIndex;
		this.beamColourRange  = this.maxColourDitherSteps;
		this.timers.addTimer("disposeTimer");
	}
	
	animate = function(animationVars)
	{
		if(this.disposing>=2){return;}
		var objectIndex;
		var beamSpeed;
		var beamPos = [0,0];
		var pointCounter=0;
		var vertices = new Array();
		var pointLocation;
		var orbitFlux=0, tempColourIndex=0;
		
		//Beam colour based on animationVars[5] as increment
		this.colourIndex += animationVars[5];
		
		if(this.create>=1)
		{
			//animate the beams
			for(this.objectCounter=0; this.objectCounter<this.beamArray.length; this.objectCounter++)
			{
				if(this.disposing==0)
				{
					objectIndex = this.beamArray[this.objectCounter];
					beamSpeed = this.objectTape[objectIndex].motionIncrements[2]*animationVars[0];
					if(this.objectTape[objectIndex].position[2]+beamSpeed<this.beamLength)
					{
						this.objectTape[objectIndex].position[2] += beamSpeed;
						this.objectTape[objectIndex].objects[0].position.z = this.objectTape[objectIndex].position[2];
					}
					else
					{
						beamPos = this.pixelMap.getCircularPointsRaw(this.beamPosition[0], this.beamPosition[1], this.beamRadiusRange*Math.random(), Math.random()*360);
						this.objectTape[objectIndex].position[0] = beamPos[0];
						this.objectTape[objectIndex].position[1] = beamPos[1];
						this.objectTape[objectIndex].position[2] = -this.beamLength + (Math.random()*beamSpeed);
						this.objectTape[objectIndex].objects[0].position.set(this.objectTape[objectIndex].position[0], this.objectTape[objectIndex].position[1], this.objectTape[objectIndex].position[2]);
					}
					//lineScale of XY
					this.objectTape[objectIndex].objects[0].scale.x = animationVars[2];
					this.objectTape[objectIndex].objects[0].scale.y = animationVars[2];
					//Beam colour
					tempColourIndex = Math.round((this.beamColourRange*Math.random()))+this.colourIndex;
					this.colourObject.getColour(tempColourIndex%this.colourObject._bandWidth);
					this.objectTape[objectIndex].materials[0].color.r = this.colourObject._currentColour[0]/255;
					this.objectTape[objectIndex].materials[0].color.g = this.colourObject._currentColour[1]/255;
					this.objectTape[objectIndex].materials[0].color.b = this.colourObject._currentColour[2]/255;
				}
				else if(this.disposing==1)
				{
					objectIndex = this.beamArray[this.objectCounter];
					beamSpeed = this.objectTape[objectIndex].motionIncrements[2]*animationVars[0];
					if(this.objectTape[objectIndex].position[2]+beamSpeed<this.beamLength)
					{
						this.objectTape[objectIndex].position[2] += beamSpeed;
						this.objectTape[objectIndex].objects[0].position.z = this.objectTape[objectIndex].position[2];
					}
					else
					{
						this.globalObject.remove( this.objectTape[objectIndex].objects[0] );
						this.objectTape[objectIndex].geometry[0].dispose();
						this.objectTape[objectIndex].materials[0].dispose();
					}
				}
			}
			//beam rotation
			this.globalObject.rotateZ( (Math.PI/180)*animationVars[6] );
		}
		if(this.create==2)
		{
			for(this.objectCounter=0; this.objectCounter<this.orbitArray.length; this.objectCounter++)
			{
				if(this.disposing==0)
				{
					objectIndex = this.orbitArray[this.objectCounter];
					//grow each orbits
					if(this.objectTape[objectIndex].radius+this.objectTape[objectIndex].motionIncrements[0]<1 && this.objectTape[objectIndex].setUpStatus==0)
					{
						this.objectTape[objectIndex].radius += this.objectTape[objectIndex].motionIncrements[0];
						this.objectTape[objectIndex].objects[0].scale.x = this.objectTape[objectIndex].radius;
						this.objectTape[objectIndex].objects[0].scale.y = this.objectTape[objectIndex].radius;
						this.objectTape[objectIndex].objects[0].scale.z = this.objectTape[objectIndex].radius;
					}
					else
					{
						this.objectTape[objectIndex].setUpStatus=1;
					}
					//rotate each orbit
					this.objectTape[objectIndex].objects[0].rotateZ(this.objectTape[objectIndex].rotations[2])
					//shift each orbit
					beamSpeed = this.objectTape[objectIndex].motionIncrements[2]*animationVars[0];
					if(this.objectTape[objectIndex].position[2]+beamSpeed<this.beamLength)
					{
						this.objectTape[objectIndex].position[2] += beamSpeed;
					}
					else
					{
						this.objectTape[objectIndex].position[2] = -this.beamLength;
					}
					this.objectTape[objectIndex].objects[0].position.z = this.objectTape[objectIndex].position[2];
					//pointScale
					this.objectTape[objectIndex].materials[0].size = animationVars[3];
					//orbitsScale based on Envelop incremented by animationVars[4]
					if(this.objectTape[objectIndex].setUpStatus==1)
					{
						orbitFlux = this.envelops.getEnvelopNonZeroStartAsRatio(this.objectTape[objectIndex].objectID, animationVars[4]+0.001, 0, 100);
						this.objectTape[objectIndex].objects[0].scale.x = orbitFlux;
						this.objectTape[objectIndex].objects[0].scale.y = orbitFlux;
						this.objectTape[objectIndex].objects[0].scale.z = orbitFlux;
					}
					//colour Change
					tempColourIndex = Math.round((this.beamColourRange*Math.random()))+this.colourIndex;
					this.colourObject.getColour(tempColourIndex%this.colourObject._bandWidth);
					this.objectTape[objectIndex].materials[0].color.r = this.colourObject._currentColour[0]/255;
					this.objectTape[objectIndex].materials[0].color.g = this.colourObject._currentColour[1]/255;
					this.objectTape[objectIndex].materials[0].color.b = this.colourObject._currentColour[2]/255;
				}
				else if(this.disposing==1)
				{
					objectIndex = this.orbitArray[this.objectCounter];
					//shift each orbit
					beamSpeed = this.objectTape[objectIndex].motionIncrements[2]*animationVars[0];
					if(this.objectTape[objectIndex].position[2]+beamSpeed<this.beamLength)
					{
						this.objectTape[objectIndex].position[2] += beamSpeed;
						this.objectTape[objectIndex].objects[0].position.z = this.objectTape[objectIndex].position[2];
					}
					else
					{
						this.globalObject.remove( this.objectTape[objectIndex].objects[0] );
						this.objectTape[objectIndex].geometry[0].dispose();
						this.objectTape[objectIndex].materials[0].dispose();
					}
				}
			}			
		}
		//creation loop
		this.orbitCreationLoop(animationVars[1]);
		//disposal timer
		if(this.defaultFadeDelay!=-1)
		{
			if(this.timers.hasTimedOut("disposeTimer"))
			{
				this.disposing=1;
			}
		}
		//check if all objects have been disposed off
		if(this.disposing==1)
		{
			if(this.globalObject.children.length==0)
			{
				this.dispose();
			}
		}
	}
	createBeams = function()
	{
		var beamCounter=0;
		var beamPos = [0,0];
		var beamZPos = 0, tempColourIndex;
		
		//set orbitOrigin based on th ebeasm positions
		this.orbitOrigin[0] = this.beamPosition[0];
		this.orbitOrigin[1] = this.beamPosition[1];
		this.orbitOrigin[2] = this.beamPosition[2];

		//Create beams
		for(beamCounter=0; beamCounter<this.numberOfBeams; beamCounter++)
		{
			this.genObject = new animationObject();
			this.genObject.objectID = this.groupName+"BEAM_"+this.objectIDIndex;
			this.beamArray.push(beamCounter);
			beamPos = this.pixelMap.getCircularPointsRaw(this.beamPosition[0], this.beamPosition[1], this.beamRadiusRange*Math.random(), Math.random()*360);
			this.generateRandomDirections();
			beamZPos = this.randomDirectionArray[2]*(this.beamLength*Math.random());
			this.genObject.position[0] = beamPos[0];
			this.genObject.position[1] = beamPos[1];
			this.genObject.position[2] = beamZPos;
			this.genObject.motionIncrements[2] = (Math.random()*this.maxBeamSpeed)+1;
			this.genObject.geometry.push( new THREE.BoxGeometry(this.beamDimensions[0], this.beamDimensions[1], this.beamDimensions[2] ) );
			this.genObject.materials.push( new THREE.MeshLambertMaterial( { color: 0xffffff, side: THREE.DoubleSide } ) );
			//colour
			tempColourIndex = Math.round((this.beamColourRange*Math.random()))+this.colourIndex;
			this.colourObject.getColour(tempColourIndex%this.colourObject._bandWidth);
			this.genObject.materials[0].color.r = this.colourObject._currentColour[0]/255;
			this.genObject.materials[0].color.g = this.colourObject._currentColour[1]/255;
			this.genObject.materials[0].color.b = this.colourObject._currentColour[2]/255;
			this.genObject.materials[0].transparent = true;
			this.genObject.materials[0].opacity = 1;
			this.genObject.objects.push( new THREE.Mesh( this.genObject.geometry[0], this.genObject.materials[0] ) );
			this.genObject.objects[0].position.set(this.beamPosition[0], this.beamPosition[1], this.beamPosition[2]);
			this.globalObject.add( this.genObject.objects[0] );
			this.objectTape.push( this.genObject );
			this.objectTape[beamCounter].objects[0].layers.enable( 1 );
			this.objectIDIndex++;
		}
		this.scene.add( this.globalObject );
		this.timers.addTimer("beamTimer");
		this.timers.startTimer("beamTimer", this.beamLiveTime);
		this.timers.addTimer("orbitTimer");
		this.timers.startTimer("orbitTimer", this.orbitInsertionDelay);
		this.beamStatus=1;
	}
	createOrbit = function()
	{
		if(!this.timers.hasTimedOut("orbitTimer") || this.numberOfOrbits==this.totalOrbits)
		{
			return;
		}
		var pointCounter=0;
		var vertices = new Array();
		var pointLocation, tempColourIndex;
		
		this.genObject = new animationObject();
		this.genObject.objectID = this.groupName+"ORBIT_"+this.objectIDIndex;
		this.generateRandomDirections();
		this.genObject.position[0] = this.orbitOrigin[0];
		this.genObject.position[1] = this.orbitOrigin[1];
		this.genObject.position[2] = (this.beamLength*Math.random())*this.randomDirectionArray[2];
		this.generateRandomDirections();
		this.genObject.radius = 0;
		this.genObject.subRadius = this.maxOrbitRadius + ((Math.random()*this.maxOrbitWoble)*this.randomDirectionArray[2]);
		this.genObject.pollyPoints = this.pointsPerOrbit;
		this.genObject.motionIncrements[0] = 0.05;
		this.genObject.motionIncrements[2] = (Math.random()*this.maxOrbitSpeed)+1;
		this.generateRandomDirections();
		this.genObject.rotations = [ this.randomDirectionArray[0]*((Math.PI/180)*((Math.random()*2)+1)), this.randomDirectionArray[1]*((Math.PI/180)*((Math.random()*2)+1)), this.randomDirectionArray[2]*((Math.PI/180)*((Math.random()*2)+1))];
		this.orbitArray.push(this.objectTape.length);
		for(pointCounter=0; pointCounter<this.genObject.pollyPoints; pointCounter++)
		{
			pointLocation = this.pixelMap.getCircularPointsRaw(0, 0, this.genObject.subRadius, Math.random()*360);
			vertices.push(pointLocation[0], pointLocation[1], 0);
		}
		this.genObject.geometry.push( new THREE.BufferGeometry() );
		this.genObject.geometry[0].setAttribute( 'position', new THREE.Float32BufferAttribute( vertices , 3 ) );
		this.genObject.materials.push( new THREE.PointsMaterial( { color: 0xffffff, size:1} ) );
		this.genObject.materials[0].transparent = true;
		this.genObject.materials[0].opacity = 1;
		//colour
		tempColourIndex = Math.round((this.beamColourRange*Math.random()))+this.colourIndex;
		this.colourObject.getColour(tempColourIndex%this.colourObject._bandWidth);
		this.genObject.materials[0].color.r = this.colourObject._currentColour[0]/255;
		this.genObject.materials[0].color.g = this.colourObject._currentColour[1]/255;
		this.genObject.materials[0].color.b = this.colourObject._currentColour[2]/255;
		this.genObject.objects.push( new THREE.Points( this.genObject.geometry[0], this.genObject.materials[0] ) );
		this.genObject.objects[0].position.x = this.genObject.position[0];
		this.genObject.objects[0].position.y = this.genObject.position[1];
		this.genObject.objects[0].position.z = this.genObject.position[2];
		//Reduce Scale
		this.genObject.objects[0].scale.x = this.genObject.radius;
		this.genObject.objects[0].scale.y = this.genObject.radius;
		this.genObject.objects[0].scale.z = this.genObject.radius;
		this.globalObject.add( this.genObject.objects[0] );
		this.objectTape.push(this.genObject);
		this.generateRandomDirections();
		if(this.randomDirectionArray[0]==1)
		{
			this.genObject.objects[0].layers.enable( 1 );
		}
		this.numberOfOrbits++;
		this.timers.startTimer("orbitTimer", this.orbitInsertionDelay);
		this.envelops.addWithTimeCode(this.genObject.objectID, [100,0], [100,50], 1, Math.round((Math.random()*150)));
		this.objectIDIndex++;
	}
	generateRandomDirections = function()
	{
		if( Math.round(Math.random()) == 1 ){this.randomDirectionArray[0]=1;}else{this.randomDirectionArray[0]=-1;}
		if( Math.round(Math.random()) == 1 ){this.randomDirectionArray[1]=1;}else{this.randomDirectionArray[1]=-1;}
		if( Math.round(Math.random()) == 1 ){this.randomDirectionArray[2]=1;}else{this.randomDirectionArray[2]=-1;}
	}
	seed = function(beamOrigin)
	{
		if(beamOrigin==undefined)
		{
			this.beamPosition[0] = (-this.screenRange[0])+Math.round(Math.random()*(this.screenRange[0]*2));
			this.beamPosition[1] = (this.screenRange[1])-Math.round(Math.random()*(this.screenRange[1]*2));
			this.beamPosition[2] = (-this.screenRange[2])+Math.round(Math.random()*(this.screenRange[2]*2));
		}
		else
		{
			this.beamPosition[0] = beamOrigin[0];
			this.beamPosition[1] = beamOrigin[1];
			this.beamPosition[2] = beamOrigin[2];
		}
		this.create = 0;
		if(this.defaultFadeDelay!=-1)
		{
			this.timers.startTimer("disposeTimer", this.defaultFadeDelay);
		}
	}
	orbitCreationLoop = function(colourIncrement)
	{
		switch(this.create)
		{
			case	-1:		break;
			case	 0:		this.createBeams();
							this.create++;
							break;
			case	 2:		this.createOrbit();
							break;
							
			default:		break;
		}
		//If beam timer has epired start firing off orbits
		if(this.beamStatus==1 && this.timers.hasTimedOut("beamTimer"))
		{
			//fire off orbits
			this.create++;		//=2
			this.beamStatus=0;
			
		}
	}
	dispose = function()
	{
		this.disposing = 2;
		//Dispose of all Timers
		this.timers = new timerObject();
		//Dispose of all envelops
		this.envelops = new envelopGenerator();
		//remove all objects from the scene
		this.scene.remove( this.globalObject );
		//Dispose of all objects
		for(this.objectCounter=0; this.objectCounter<this.objectTape.length; this.objectCounter++)
		{
			this.objectTape[this.objectCounter].materials[0].dispose();
			this.objectTape[this.objectCounter].geometry[0].dispose();
		}
		//clear our the gloabal object group
		this.globalObject = new THREE.Object3D();
		for(this.objectCounter=0; this.objectCounter<this.objectTape.length; this.objectCounter++)
		{
			this.objectTape[this.objectCounter].objects[0] = new THREE.Object3D();
		}
	}
}
export default threeOrbitalBeams;