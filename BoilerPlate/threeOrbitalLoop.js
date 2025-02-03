import * as THREE from 'three';
import envelopGenerator from './envelopGenerator.js';					//Envelop Generator
import CCGenerator from './CCGenerator.js';								//Colour System
import timerObject from './timerObject.js';								//Timers
import pixelMaper from './pixelMaper.js';								//Pixel Maper
import animationObject from './animationObject.js';						//Generic Object Tracking class

class threeOrbitalLoop
{	
	constructor()
	{
		//Main object stores
		this.objectTape = new Array();
		this.groupArray = new Array();
		this.groupName = "OL_";
		this.objectIDIndex = 0;
		this.groupID = 0;
		this.genObject = new animationObject();
		
		//Global Three Objects form main System
		this.scene;
		
		//Main properties
		this.orbiters = 0;
		this.maxOrbiters = 2;										
		this.centreRadius = 1;
		this.maxCentreRadius = 10;
		this.orbiterRadius = 1;
		this.maxOrbiterRadius = this.maxCentreRadius*0.25;
		this.orbitDistance = this.maxCentreRadius;
		this.orbitOrigin = [0,0,0];
		this.randomDirectionArray = [1,1,1];
		this.customMotionIncrement = 0;
		this.customRotationIncrement = 0;
		this.create = -1;
		this.insertOrbiter = 0;
		this.objectActionTimes = [500, 2000, 2000, 2000];
		this.defaultFadeDelay = -1;
		
		//Utility Objects
		this.pixelMap = new pixelMaper(2,2);
		this.screenRange = [100,100,100];
		this.timers = new timerObject();
		this.envelops = new envelopGenerator();
		
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
		this.timers.addTimer("orbiter");
	}
	
	animate = function(colourIndex, subColourIndex, pointSize)
	{
		var pointCounter;
		var pointVectors = [0,0,0];
		var vertexArray = new Array();
		var tempRadius;
		var lineStartVectors = new THREE.Vector3(this.orbitOrigin[0], this.orbitOrigin[1], this.orbitOrigin[2]);
		var endVector = [0,0,0];
		var lineEndVectors = new THREE.Vector3();
		var pointArray = new Array();
		var orbiterStartIndex = 2, orbiterCounter=0, totalOrbiters=0, insertNew=0, maxOrbit=0;
		
		if(this.create==1)
		{
			//expand the centre orbit point sphere to its max radius
			if(this.objectTape[0].radius+this.objectTape[0].motionIncrements[0]<this.objectTape[0].subRadius)
			{
				this.objectTape[0].radius += this.objectTape[0].motionIncrements[0];
				this.objectTape[0].pollyPoints = Math.round( this.objectTape[0].pollyPoints+this.objectTape[0].extrudeDepth);
				this.objectTape[0].position[0] = this.orbitOrigin[0];
				this.objectTape[0].position[1] = this.orbitOrigin[1];
				this.objectTape[0].position[2] = this.orbitOrigin[2];
				this.objectTape[1].position[0] = this.orbitOrigin[0];
				this.objectTape[1].position[1] = this.orbitOrigin[1];
				this.objectTape[1].position[2] = this.orbitOrigin[2];
				for(pointCounter=0; pointCounter<this.objectTape[0].pollyPoints; pointCounter++)
				{
					tempRadius = Math.random()*this.objectTape[0].radius;
					pointVectors = this.pixelMap.get3DPointsCentered(tempRadius, Math.random()*360, Math.random()*360, this.objectTape[0].position[0], this.objectTape[0].position[1], this.objectTape[0].position[2]);
					vertexArray.push(pointVectors[0], pointVectors[1], pointVectors[2]);
				}
				this.objectTape[0].geometry[0].setAttribute( 'position', new THREE.Float32BufferAttribute( vertexArray , 3 ) );
			}
			else
			{
				this.objectTape[0].radius = this.objectTape[0].subRadius;
				//create is set to 2
				this.create++;	
			}
		}
		else if(this.create==2)
		{
			//expand the centre orbit SPHERE to max radius, set its opacity to 1
			//set opacity of points to 0
			if(this.objectTape[1].radius+this.objectTape[1].motionIncrements[0]<this.objectTape[1].subRadius)
			{
				this.objectTape[1].radius += this.objectTape[1].motionIncrements[0];
				this.objectTape[0].position[0] = this.orbitOrigin[0];
				this.objectTape[0].position[1] = this.orbitOrigin[1];
				this.objectTape[0].position[2] = this.orbitOrigin[2];
				this.objectTape[1].position[0] = this.orbitOrigin[0];
				this.objectTape[1].position[1] = this.orbitOrigin[1];
				this.objectTape[1].position[2] = this.orbitOrigin[2];
				for(pointCounter=0; pointCounter<this.objectTape[0].pollyPoints; pointCounter++)
				{
					tempRadius = Math.random()*this.objectTape[0].radius;
					pointVectors = this.pixelMap.get3DPointsCentered(tempRadius, Math.random()*360, Math.random()*360, this.objectTape[0].position[0], this.objectTape[0].position[1], this.objectTape[0].position[2]);
					vertexArray.push(pointVectors[0], pointVectors[1], pointVectors[2]);
				}
				this.objectTape[0].geometry[0].setAttribute( 'position', new THREE.Float32BufferAttribute( vertexArray , 3 ) );
				this.objectTape[0].materials[0].opacity = 1-(this.objectTape[1].radius/this.objectTape[1].subRadius);
				this.objectTape[1].objects[0].scale.x = this.objectTape[1].radius;
				this.objectTape[1].objects[0].scale.y = this.objectTape[1].radius;
				this.objectTape[1].objects[0].scale.z = this.objectTape[1].radius;
				this.objectTape[1].objects[0].position.set(this.objectTape[1].position[0], this.objectTape[1].position[1], this.objectTape[1].position[2]);
				this.objectTape[1].materials[0].opacity = (this.objectTape[1].radius/this.objectTape[1].subRadius);
			}
			else
			{
				//Hide point cloud
				this.objectTape[0].materials[0].opacity = 0;
				this.objectTape[0].objects[0].scale.x = 0.01;
				this.objectTape[0].objects[0].scale.y = 0.01;
				this.objectTape[0].objects[0].scale.z = 0.01;
				this.objectTape[1].radius = this.objectTape[1].subRadius;
				//create is set to 3
				this.create++;	
			}
		}
		else if(this.create==4)
		{
			this.objectTape[1].position[0] = this.orbitOrigin[0];
			this.objectTape[1].position[1] = this.orbitOrigin[1];
			this.objectTape[1].position[2] = this.orbitOrigin[2];
			this.objectTape[1].objects[0].position.set(this.objectTape[1].position[0], this.objectTape[1].position[1], this.objectTape[1].position[2]);
			totalOrbiters = (this.objectTape.length-2)/2;
			for(orbiterCounter=orbiterStartIndex; orbiterCounter<this.objectTape.length; orbiterCounter+=2)
			{
				//rotate each orbiter
				if( (this.objectTape[orbiterCounter].axisOffset += this.objectTape[orbiterCounter].rotations[0])%360==359) 
				{
					this.objectTape[orbiterCounter].pointAngleOffset += this.objectTape[orbiterCounter].rotations[1];
				}
				this.objectTape[orbiterCounter].axisOffset += this.objectTape[orbiterCounter].rotations[0];
				endVector = this.pixelMap.get3DPointsCentered(this.objectTape[orbiterCounter].axis, this.objectTape[orbiterCounter].pointAngleOffset, this.objectTape[orbiterCounter].axisOffset, lineStartVectors.x, lineStartVectors.y, lineStartVectors.z);
				lineEndVectors.x = endVector[0];
				lineEndVectors.y = endVector[1];
				lineEndVectors.z = endVector[2];
				pointArray.push(lineStartVectors);
				pointArray.push(lineEndVectors);
				this.scene.remove(this.objectTape[orbiterCounter].objects[0]);
				this.objectTape[orbiterCounter].geometry[0].dispose();
				this.objectTape[orbiterCounter].geometry[0] = new THREE.BufferGeometry().setFromPoints( pointArray );
				this.objectTape[orbiterCounter].objects[0] = new THREE.Line( this.objectTape[orbiterCounter].geometry[0], this.objectTape[orbiterCounter].materials[0] );
				this.scene.add(this.objectTape[orbiterCounter].objects[0]);
				//move orbiter
				this.objectTape[orbiterCounter+1].objects[0].position.x = lineEndVectors.x;
				this.objectTape[orbiterCounter+1].objects[0].position.y = lineEndVectors.y;
				this.objectTape[orbiterCounter+1].objects[0].position.z = lineEndVectors.z;
				//grow orbiter
				if(this.objectTape[orbiterCounter+1].radius+this.objectTape[orbiterCounter+1].motionIncrements[0]<this.objectTape[orbiterCounter+1].subRadius && this.objectTape[orbiterCounter].setUpStatus==0)
				{
					this.objectTape[orbiterCounter+1].radius += this.objectTape[orbiterCounter+1].motionIncrements[0];
					this.objectTape[orbiterCounter+1].objects[0].scale.x = this.objectTape[orbiterCounter+1].radius;
					this.objectTape[orbiterCounter+1].objects[0].scale.y = this.objectTape[orbiterCounter+1].radius;
					this.objectTape[orbiterCounter+1].objects[0].scale.z = this.objectTape[orbiterCounter+1].radius;
				}
				else
				{
					//Orbiter has completed set up
					this.objectTape[orbiterCounter].setUpStatus = 1;
					this.objectTape[orbiterCounter].materials[0].opacity = 0;
					this.objectTape[orbiterCounter+1].radius = this.objectTape[orbiterCounter+1].subRadius;
					this.colourObject.getColour(this.colourIndex%this.colourObject._bandWidth);
					this.objectTape[orbiterCounter+1].materials[0].color.r = this.colourObject._currentColour[0]/255;
					this.objectTape[orbiterCounter+1].materials[0].color.g = this.colourObject._currentColour[1]/255;
					this.objectTape[orbiterCounter+1].materials[0].color.b = this.colourObject._currentColour[2]/255;
				}
				if(this.objectTape[orbiterCounter].setUpStatus==1)
				{
					insertNew++;
					if(this.objectTape[orbiterCounter].axis > maxOrbit)
					{
						maxOrbit = this.objectTape[orbiterCounter].axis;
					}
				}
				
			}
			//insert new orbiters untill maxOrbits
			if(insertNew>0 && this.orbiters<this.maxOrbiters && this.timers.hasTimedOut("orbiter"))
			{
				this.insertOrbiter = 1;
				this.createC();
			}
			if(insertNew==this.maxOrbiters)
			{
				if((this.objectTape[1].radius+this.objectTape[0].motionIncrements[1])<maxOrbit)
				{
					//grow centrepoint above highest orbit
					this.objectTape[1].radius += this.objectTape[0].motionIncrements[1];
					this.objectTape[1].objects[0].scale.x = this.objectTape[1].radius;
					this.objectTape[1].objects[0].scale.y = this.objectTape[1].radius;
					this.objectTape[1].objects[0].scale.z = this.objectTape[1].radius;
				}
				else
				{
					//dispose of all orbiters
					if(totalOrbiters>0)
					{
						for(orbiterCounter=orbiterStartIndex; orbiterCounter<this.objectTape.length; orbiterCounter+=2)
						{
							this.scene.remove(this.objectTape[orbiterCounter].objects[0]);
							this.objectTape[orbiterCounter].materials[0].dispose();
							this.objectTape[orbiterCounter].geometry[0].dispose();
							this.scene.remove(this.objectTape[orbiterCounter+1].objects[0]);
							this.objectTape[orbiterCounter+1].materials[0].dispose();
							this.objectTape[orbiterCounter+1].geometry[0].dispose();
						}
						this.objectTape.splice(2, this.objectTape.length);
						//remove point cloud
						this.scene.remove(this.objectTape[0].objects[0]);
						this.objectTape[0].materials[0].dispose();
						this.objectTape[0].geometry[0].dispose();
					}
				}
			}
			if(totalOrbiters==0)
			{
				if((this.objectTape[1].radius-this.objectTape[0].motionIncrements[1])>0)
				{
					//shrink the centre object
					this.objectTape[1].radius -= this.objectTape[0].motionIncrements[1];
					this.objectTape[1].objects[0].scale.x = this.objectTape[1].radius;
					this.objectTape[1].objects[0].scale.y = this.objectTape[1].radius;
					this.objectTape[1].objects[0].scale.z = this.objectTape[1].radius;
				}
				else
				{
					//Dispose of all objectes
					this.scene.remove(this.objectTape[1].objects[0]);
					this.objectTape[1].materials[0].dispose();
					this.objectTape[1].geometry[0].dispose();
					this.objectTape = new Array();
					this.orbiters=0;
					this.create=-1;
				}
			}
		}
		//creation loop
		this.orbitCreationLoop(colourIndex);
	}
	createA = function()
	{
		var vertexArray = new Array();
		var pointCounter;
		var pointVectors = [0,0,0];
		var vertexArray;
		
		//Create central point sphere cloud
		this.genObject = new animationObject();
		this.genObject.objectID = this.objectIDIndex;
		this.genObject.position[0] = this.orbitOrigin[0];
		this.genObject.position[1] = this.orbitOrigin[1];
		this.genObject.position[2] = this.orbitOrigin[2];
		this.genObject.motionIncrements[0] = (Math.random()*0.25)+0.01;	
		this.genObject.motionIncrements[1] = this.genObject.motionIncrements[0]*5;	
		this.genObject.radius = this.centreRadius;
		this.genObject.subRadius = this.maxCentreRadius;
		this.genObject.pollyPoints = 1;
		this.genObject.subPollyPoints = 500;
		this.genObject.extrudeDepth = (this.genObject.motionIncrements[0]/this.genObject.subRadius)*this.genObject.subPollyPoints;
		//create initial point cloud
		vertexArray = new Array();
		for(pointCounter=0; pointCounter<this.genObject.pollyPoints; pointCounter++)
		{
			pointVectors = this.pixelMap.get3DPointsCentered(this.genObject.radius, Math.random()*360, Math.random()*360, this.genObject.position[0], this.genObject.position[0], this.genObject.position[0]);
			vertexArray.push(pointVectors[0], pointVectors[1], pointVectors[2]);
		}
		this.genObject.geometry.push( new THREE.BufferGeometry() );
		this.genObject.geometry[0].setAttribute( 'position', new THREE.Float32BufferAttribute( vertexArray , 3 ) );
		this.genObject.materials.push( new THREE.PointsMaterial( { color: 0xffffff, size:1} ) );
		//colour
		this.colourObject.getColour(this.colourIndex%this.colourObject._bandWidth);
		this.genObject.materials[0].color.r = this.colourObject._currentColour[0]/255;
		this.genObject.materials[0].color.g = this.colourObject._currentColour[1]/255;
		this.genObject.materials[0].color.b = this.colourObject._currentColour[2]/255;
		this.genObject.materials[0].transparent = true;
		this.genObject.materials[0].opacity = 1;
		this.genObject.objects.push( new THREE.Points( this.genObject.geometry[0], this.genObject.materials[0] ) );
		this.scene.add( this.genObject.objects[0] );
		this.objectTape.push(this.genObject);
		this.objectIDIndex++;
		//create central point SPHERE set to 0 opacity
		this.genObject = new animationObject();
		this.genObject.objectID = this.objectIDIndex;
		this.genObject.position[0] = this.orbitOrigin[0];
		this.genObject.position[1] = this.orbitOrigin[1];
		this.genObject.position[2] = this.orbitOrigin[2];
		this.genObject.motionIncrements[0] = (Math.random()*0.25)+0.01;	
		this.genObject.radius = this.centreRadius;
		this.genObject.subRadius = this.maxCentreRadius; 
		this.genObject.geometry.push( new THREE.SphereGeometry( this.genObject.radius, 64, 64 ) );
		this.genObject.materials.push( new THREE.MeshLambertMaterial( { color: 0xffffff} ) );
		//colour
		this.colourObject.getColour(this.colourIndex%this.colourObject._bandWidth);
		this.genObject.materials[0].color.r = this.colourObject._currentColour[0]/255;
		this.genObject.materials[0].color.g = this.colourObject._currentColour[1]/255;
		this.genObject.materials[0].color.b = this.colourObject._currentColour[2]/255;
		this.genObject.materials[0].transparent = true;
		this.genObject.materials[0].opacity = 0;
		this.genObject.objects.push( new THREE.Mesh( this.genObject.geometry[0], this.genObject.materials[0] ) );
		this.genObject.objects[0].position.x = this.genObject.position[0];
		this.genObject.objects[0].position.y = this.genObject.position[1];
		this.genObject.objects[0].position.z = this.genObject.position[2];
		this.scene.add( this.genObject.objects[0] );
		this.objectTape.push(this.genObject);
		this.objectIDIndex++;
	}
	createC = function()
	{
		if(this.insertOrbiter==0)
		{
			return;
		}
		var lineStartVectors = new THREE.Vector3(this.orbitOrigin[0], this.orbitOrigin[1], this.orbitOrigin[2])
		var endVector = [0,0,0];
		var lineEndVectors = new THREE.Vector3();
		var angleFromAxis = Math.random()*360;
		var pointAngle = Math.random()*360;
		var distanceFromCentre = (Math.random()*this.orbitDistance)+30;
		var pointArray = new Array();
		
		//Create line from centre to random 3d point in outer radius
		this.genObject = new animationObject();
		endVector = this.pixelMap.get3DPointsCentered(distanceFromCentre, angleFromAxis, pointAngle, lineStartVectors.x, lineStartVectors.y, lineStartVectors.z);
		lineEndVectors.x = endVector[0];
		lineEndVectors.y = endVector[1];
		lineEndVectors.z = endVector[2];
		pointArray.push(lineStartVectors);
		pointArray.push(lineEndVectors);
		this.genObject.objectID = this.objectIDIndex;
		this.genObject.position[0] = endVector[0];
		this.genObject.position[1] = endVector[1];
		this.genObject.position[2] = endVector[2];
		this.genObject.radius = this.orbiterRadius;
		this.genObject.subRadius = this.maxOrbiterRadius; 
		this.genObject.motionIncrements[0] = (Math.random()*0.25)+0.01;
		this.genObject.axisOffset = pointAngle;
		this.genObject.pointAngleOffset = angleFromAxis;
		this.genObject.axis = distanceFromCentre;
		this.genObject.rotations[0] = (Math.random()*1)+1;
		this.genObject.rotations[1] = (Math.random()*1)+1;
		this.genObject.materials.push( new THREE.LineBasicMaterial( { color: 0xffffff} ) );
		this.genObject.materials[0].transparent = true;
		this.genObject.materials[0].opacity = 1;
		this.genObject.geometry.push( new THREE.BufferGeometry().setFromPoints( pointArray ) );
		this.genObject.objects.push( new THREE.Line( this.genObject.geometry[0], this.genObject.materials[0] ) );
		this.scene.add( this.genObject.objects[0] );
		this.objectTape.push(this.genObject);
		this.objectIDIndex++;
		
		//create orbiter object
		this.genObject = new animationObject();
		this.genObject.objectID = this.objectIDIndex;
		this.genObject.position[0] = endVector[0];
		this.genObject.position[1] = endVector[1];
		this.genObject.position[2] = endVector[2];
		this.genObject.radius = this.orbiterRadius;
		this.genObject.subRadius = (Math.random()*this.maxOrbiterRadius)+2;
		this.genObject.motionIncrements[0] = (Math.random()*0.25)+0.01;
		this.genObject.geometry.push( new THREE.SphereGeometry( this.genObject.radius, 64, 64 ) );
		this.genObject.materials.push( new THREE.MeshLambertMaterial( { color: 0xffffff} ) );
		this.genObject.materials[0].transparent = true;
		this.genObject.materials[0].opacity = 1;
		this.genObject.objects.push( new THREE.Mesh( this.genObject.geometry[0], this.genObject.materials[0] ) );
		this.genObject.objects[0].position.x = this.genObject.position[0];
		this.genObject.objects[0].position.y = this.genObject.position[1];
		this.genObject.objects[0].position.z = this.genObject.position[2];
		this.scene.add( this.genObject.objects[0] );
		this.objectTape.push(this.genObject);
		this.objectIDIndex++;
		this.orbiters++;
		this.insertOrbiter=0;
		this.timers.startTimer("orbiter", this.objectActionTimes[0]);
	}
	generateRandomDirections = function()
	{
		if( Math.round(Math.random()) == 1 ){this.randomDirectionArray[0]=1;}else{this.randomDirectionArray[0]=-1;}
		if( Math.round(Math.random()) == 1 ){this.randomDirectionArray[1]=1;}else{this.randomDirectionArray[1]=-1;}
		if( Math.round(Math.random()) == 1 ){this.randomDirectionArray[2]=1;}else{this.randomDirectionArray[2]=-1;}
	}
	seed = function(orbitOrigin)
	{
		if(orbitOrigin==undefined)
		{
			this.orbitOrigin[0] = (-this.screenRange[0])+Math.round(Math.random()*(this.screenRange[0]*2));
			this.orbitOrigin[1] = (this.screenRange[1])-Math.round(Math.random()*(this.screenRange[1]*2));
			this.orbitOrigin[2] = (-this.screenRange[2])+Math.round(Math.random()*(this.screenRange[2]*2));
		}
		else
		{
			this.orbitOrigin[0] = orbitOrigin[0];
			this.orbitOrigin[1] = orbitOrigin[1];
			this.orbitOrigin[2] = orbitOrigin[2];
		}
		this.create = 0;
	}
	orbitCreationLoop = function(colourIncrement)
	{
		switch(this.create)
		{
			case	-1:		break;
			case	 0:		this.createA();
							this.create++;
							break;
			case	 3:		this.insertOrbiter = 1;
							this.createC();
							this.create++;
							break;
							
			default:		break;
		}
	}
	groupIndex = function(groupID)
	{
		var gIndex=0;
		for(gIndex=0; gIndex<this.groupArray.length; gIndex++)
		{
			if(this.groupArray[gIndex][0]==groupID)
			{
				return gIndex;
			}
		}
	}
}
export default threeOrbitalLoop;