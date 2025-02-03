import * as THREE from 'three';
import envelopGenerator from './envelopGenerator.js';					//Envelop Generator
import CCGenerator from './CCGenerator.js';								//Colour System
import timerObject from './timerObject.js';								//Timers
import pixelMaper from './pixelMaper.js';								//Pixel Maper
import animationObject from './animationObject.js';						//Generic Object Tracking class

class threeFacetoid
{	
	constructor()
	{
		//Main object stores
		this.objectTape = new Array();
		this.pivots = new Array();
		this.groupName = "F_";
		this.objectIDIndex = 0;
		this.groupID = 0;
		this.facetoidType = "implosion";								//implosion or explosion
		this.genObject = new animationObject();
		
		//Global Three Objects form main System
		this.scene;
		
		//Main properties
		this.sliceCount = 2;
		this.startDimentions = [1,1];
		this.endDimensions = 20;
		this.orbitOrigin = [0,0,0];
		this.rotationVectors = [1,1,1];
		this.createFacetoid = this.sliceCount; 
		this.defaultObjectInsertionDelay = 10;
		this.defaultFadeDelay = 2000000000;
		this.spacer = 1;
		
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
		this.timers.addTimer("orbitInsertionTimer");
		this.timers.startTimer("orbitInsertionTimer", this.defaultObjectInsertionDelay);
		this.scene = scene;
		this.colourIndex = colourIndex;
	}
	
	animate = function(colourIndex, colourIncrement, opacityEnvelopSpeed)
	{
		var objectCounter;
		
		var tempObjectTape = new Array();
		var tempGenObject;
		
		for(objectCounter=0; objectCounter<this.objectTape.length; objectCounter++)
		{
			//colour
			this.objectTape[objectCounter].colourIndex += colourIncrement;
			this.colourObject.getColour(this.objectTape[objectCounter].colourIndex%this.colourObject._bandWidth);
			this.objectTape[objectCounter].materials[0].color.r = this.colourObject._currentColour[0]/255;
			this.objectTape[objectCounter].materials[0].color.g = this.colourObject._currentColour[1]/255;
			this.objectTape[objectCounter].materials[0].color.b = this.colourObject._currentColour[2]/255;
			//opacity
			this.objectTape[objectCounter].materials[0].opacity = this.envelops.getEnvelopNonZeroStartAsRatio("opacity_"+this.objectTape[objectCounter].objectID, opacityEnvelopSpeed, 0, 100);
			if(this.objectTape[objectCounter].setUpStatus==0)
			{
				//Increment size untill endDimensions
				this.objectTape[objectCounter].dimensions[0] += this.objectTape[objectCounter].motionIncrements[0];
				this.objectTape[objectCounter].dimensions[1] += this.objectTape[objectCounter].motionIncrements[0];
				
				this.objectTape[objectCounter].objects[0].scale.x = this.objectTape[objectCounter].dimensions[0];
				this.objectTape[objectCounter].objects[0].scale.y = this.objectTape[objectCounter].dimensions[1];
				//complete object once it reaches its max radius
				if(this.objectTape[objectCounter].dimensions[0] > this.endDimensions || this.objectTape[objectCounter].dimensions[1] > this.endDimensions)
				{
					this.objectTape[objectCounter].setUpStatus = 1;
				}
			}
			
			else if(this.objectTape[objectCounter].setUpStatus==2)
			{
				if(this.objectTape[objectCounter].dimensions[0]-this.objectTape[objectCounter].motionIncrements[0]>0)
				{
					this.objectTape[objectCounter].dimensions[0]-=this.objectTape[objectCounter].motionIncrements[0];
					this.objectTape[objectCounter].dimensions[1]-=this.objectTape[objectCounter].motionIncrements[0];
					this.objectTape[objectCounter].objects[0].scale.x = this.objectTape[objectCounter].dimensions[0];
					this.objectTape[objectCounter].objects[0].scale.y = this.objectTape[objectCounter].dimensions[1];
				}
				else
				{
					this.objectTape[objectCounter].setUpStatus = 3;
				}
			}

			
		}
		
		
		//clean up if timer expires
		for(objectCounter=0; objectCounter<this.objectTape.length; objectCounter++)
		{
			if( this.timers.hasTimedOut("orbit_"+this.objectTape[objectCounter].objectID) && this.objectTape[objectCounter].setUpStatus==1)
			{
				this.objectTape[objectCounter].setUpStatus = 2;
				tempObjectTape.push(this.objectTape[objectCounter]);
			}
			else if(this.objectTape[objectCounter].setUpStatus==3)
			{
				//delete timer
				this.timers.deleteTimer("orbit_"+this.objectTape[objectCounter].objectID);
				//delete Envelop
				this.envelops.remove("opacity_"+this.objectTape[objectCounter].objectID);
				//remove from group
				this.removeFromPivotGroup(objectCounter);
				this.objectTape[objectCounter].geometry[0].dispose();
				this.objectTape[objectCounter].materials[0].dispose();
			}
			else
			{
				tempObjectTape.push(this.objectTape[objectCounter]);
			}
		}
		this.objectTape = new Array();
		for(objectCounter=0; objectCounter<tempObjectTape.length; objectCounter++)
		{
			this.objectTape.push(tempObjectTape[objectCounter]);
		}
	
		//rottaion via pivots
		for(objectCounter=0; objectCounter<this.pivots.length; objectCounter++)
		{
			
			tempGenObject = this.findObject( this.pivots[ objectCounter ].children[0].uuid );
			if(tempGenObject!=null)
			{
				this.pivots[objectCounter].rotation.x += tempGenObject.rotations[0];
				this.pivots[objectCounter].rotation.y += tempGenObject.rotations[1];
				this.pivots[objectCounter].rotation.z += tempGenObject.rotations[2];
			}
			
		}
		
		//creation loop
		this.orbitCreationLoop(colourIndex);
	}
	
	addSlice = function(objectID, colourIndex)
	{
		var pointCounter=0;
		this.genObject = new animationObject();
				
		this.genObject.objectID = objectID;
		this.genObject.position[0] = this.orbitOrigin[0];
		this.genObject.position[1] = this.orbitOrigin[1];
		this.genObject.position[2] = (this.orbitOrigin[2]+(this.sliceCount*2))-(this.createFacetoid*this.spacer);
		this.genObject.motionIncrements[0] = (Math.random()*0.5)+1;
		this.generateRotationVectors();
		this.genObject.rotations[0] = ((Math.random()*((Math.PI/180)*1) )+0.0001)*this.rotationVectors[0];
		this.genObject.rotations[1] = ((Math.random()*((Math.PI/180)*1) )+0.0001)*this.rotationVectors[1];
		this.genObject.rotations[2] = ((Math.random()*((Math.PI/180)*1) )+0.0001)*this.rotationVectors[2];
		this.genObject.colourIndex = colourIndex;
		this.genObject.texture = this.facetoidType;
		this.genObject.setUpStatus = 0;
		this.genObject.canvasObject = this.groupID;
	
	
		this.genObject.geometry.push( new THREE.PlaneGeometry( this.startDimentions[0], this.startDimentions[1]) );
		this.genObject.materials.push( new THREE.MeshPhysicalMaterial( { color: 0xffffff, side: THREE.DoubleSide} ) );
		this.genObject.materials[0].transparent = true;
		this.genObject.materials[0].opacity = 0.1;
		this.genObject.materials[0].roughness = 1;
		this.genObject.materials[0].metlaness = 0;
		//this.genObject.materials[0].emissive = "0x000000";
		
		this.genObject.objects.push( new THREE.Mesh( this.genObject.geometry[0], this.genObject.materials[0] ) );
		this.genObject.objects[0].position.x = this.genObject.position[0];
		this.genObject.objects[0].position.y = this.genObject.position[1];
		this.genObject.objects[0].position.z = this.genObject.position[2];
		this.scene.add( this.genObject.objects[0] );
		this.objectTape.push(this.genObject);
		this.timers.addTimer("orbit_"+this.genObject.objectID);
		this.timers.startTimer("orbit_"+this.genObject.objectID, this.defaultFadeDelay );
		this.envelops.addWithTimeCode("opacity_"+this.genObject.objectID, [100,0], [100,100], 0, (200/this.sliceCount)*this.createFacetoid );
	}
	generateRotationVectors = function()
	{
		if( Math.round(Math.random()) == 1 ){this.rotationVectors[0]=1;}else{this.rotationVectors[0]=-1;}
		if( Math.round(Math.random()) == 1 ){this.rotationVectors[1]=1;}else{this.rotationVectors[1]=-1;}
		if( Math.round(Math.random()) == 1 ){this.rotationVectors[2]=1;}else{this.rotationVectors[2]=-1;}
	}
	seedFacetoid = function(facetoidType)
	{
		this.orbitOrigin[0] = (-this.screenRange[0])+Math.round(Math.random()*(this.screenRange[0]*2));
		this.orbitOrigin[1] = (this.screenRange[1])-Math.round(Math.random()*(this.screenRange[1]*2));
		this.orbitOrigin[2] = (-this.screenRange[2])+Math.round(Math.random()*(this.screenRange[2]*2));
		this.facetoidType = facetoidType;
		this.createFacetoid = 0;
	}
	orbitCreationLoop = function(colourIncrement)
	{
		if(this.createFacetoid<this.sliceCount)
		{
			if(this.timers.hasTimedOut("orbitInsertionTimer"))
			{
				this.addSlice(this.groupName+this.objectIDIndex, colourIncrement);
				this.timers.startTimer("orbitInsertionTimer", this.defaultObjectInsertionDelay);
				this.objectIDIndex++;
				this.createFacetoid++;
				
				//create pivot Group
				if(this.createFacetoid==this.sliceCount)
				{
					this.addPivot();
					//Increment groupID
					this.groupID++;
				}
			}
		}
	}
	
	addPivot = function()
	{
		var objectCounter=0;
		var pivotIndex=0;
		var tempGenOobject;
		var posArray = new Array();
		var heightArray = new Array();
		var heightPos = [0,0], totalHeight=0;
		
		this.pivots.push( new THREE.Object3D() );
		for(objectCounter=0; objectCounter<this.objectTape.length; objectCounter++)
		{
			if(this.objectTape[objectCounter].canvasObject==this.groupID)
			{
				//remove from scene
				this.scene.remove(this.objectTape[objectCounter].objects[0]);
				//Add to temp object group
				this.pivots[this.pivots.length-1].add(this.objectTape[objectCounter].objects[0]);
				this.objectTape[objectCounter].objects[0].position.set(0,0,0);
				posArray.push( this.objectTape[objectCounter].position );
			}
		}
		pivotIndex = Math.round(this.pivots[this.pivots.length-1].children.length/2);
		tempGenOobject = this.findObject( this.pivots[ this.pivots.length-1 ].children[pivotIndex].uuid );
		this.pivots[this.pivots.length-1].position.set(tempGenOobject.position[0], tempGenOobject.position[1], tempGenOobject.position[2]); 
		this.scene.add( this.pivots[this.pivots.length-1] );	
		//create height displacement from centre line
		for(objectCounter=0; objectCounter<this.pivots[this.pivots.length-1].children.length+1; objectCounter++)
		{
			totalHeight = this.pivots[this.pivots.length-1].children.length*(this.spacer);
			heightArray.push(this.pixelMap.getCircularPointsRaw(0,0,totalHeight,(180/this.pivots[this.pivots.length-1].children.length)*objectCounter));
		}
		for(objectCounter=0; objectCounter<this.pivots[this.pivots.length-1].children.length; objectCounter++)
		{
			this.pivots[this.pivots.length-1].children[objectCounter].position.z  = totalHeight*(heightArray[objectCounter][1]/100);
		}

	}
	removeFromPivotGroup = function(objectIndex)
	{
		var objectID = this.objectTape[objectIndex].objects[0].uuid;
		var pIndex=0, pOIndex=0; 
		
		for(pIndex=0; pIndex<this.pivots.length; pIndex++)
		{
			for(pOIndex=0; pOIndex<this.pivots[pIndex].children.length; pOIndex++)
			{
				if(this.pivots[pIndex].children[pOIndex].uuid==objectID)
				{
					this.pivots[pIndex].children.splice(pOIndex, 1);
					if(this.pivots[pIndex].children.length==0)
					{
						this.scene.remove( this.pivots[pIndex] );
						this.pivots.splice(pIndex,1);
					}
					return;
				}
			}
		}
	}
	findObject = function(uuid)
	{
		var objectCounter=0;
		for(objectCounter=0; objectCounter<this.objectTape.length; objectCounter++)
		{
			if(this.objectTape[objectCounter].objects[0].uuid==uuid)
			{
				return this.objectTape[objectCounter];
			}
		}
		return null;
	}
}
export default threeFacetoid;