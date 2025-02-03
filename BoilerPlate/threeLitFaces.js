import * as THREE from 'three';
import envelopGenerator from './envelopGenerator.js';					//Envelop Generator
import CCGenerator from './CCGenerator.js';								//Colour System
import timerObject from './timerObject.js';								//Timers
import pixelMaper from './pixelMaper.js';								//Pixel Maper
import animationObject from './animationObject.js';						//Generic Object Tracking class

class threeLitFaces
{	
	constructor()
	{
		//Main object stores
		this.objectTape = new Array();
		this.groupName = "LF_";
		this.objectIDIndex = 0;
		
		//Global Three Objects form main System
		this.scene;
		
		//Main properties
		this.genObject = new animationObject();
		
		//Utility Objects
		this.pixelMap = new pixelMaper(2,2);
		this.timers = new timerObject();
		this.envelops = new envelopGenerator();
		this.screenRange = [600,800,50];
		this.randomDirectionArray = [1,1,1];
		
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
		this.genObject.dimensions = [1,1,0];
		this.genObject.motionIncrements = [ (Math.random()*2)+0.1, (Math.random()*2)+0.1, (Math.random()*2)+0.1 ];
	}
	seed = function(positionArray, dimensionArray, motionIncrementArray, colourIndex, lightingIntencity)
	{
		if(positionArray!=undefined)
		{
			this.genObject.position = [positionArray[0], positionArray[1],positionArray[2]];  
		}
		if(dimensionArray!=undefined)
		{
			this.genObject.dimensions = [dimensionArray[0], dimensionArray[1],dimensionArray[2]];  
		}
		if(motionIncrementArray!=undefined)
		{
			this.genObject.motionIncrements =  [motionIncrementArray[0], motionIncrementArray[1], motionIncrementArray[2]] ;
		}
		if(colourIndex!=undefined)
		{
			this.genObject.colourIndex =  colourIndex;
		}
		//genereate primary colour
		this.colourObject.getColour(this.genObject.colourIndex%this.colourObject._bandWidth);
		//create the face
		this.genObject.materials.push( new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.DoubleSide} ) );
		this.genObject.materials[0].transparent = true;
		this.genObject.materials[0].opacity = 1;
		this.genObject.materials[0].roughness = 0;
		this.genObject.materials[0].metalness = 0;
		this.genObject.materials[0].reflectivity = 1;
		this.genObject.geometry.push( new THREE.PlaneGeometry( this.genObject.dimensions[0], this.genObject.dimensions[1], 10,10 ) );
		this.genObject.objects.push( new THREE.Mesh( this.genObject.geometry[0], this.genObject.materials[0] ) );
		this.genObject.objects[0].position.set(this.genObject.position[0], this.genObject.position[1], this.genObject.position[2]);
		this.objectTape.push( this.genObject );
		this.scene.add( this.objectTape[0].objects[0] );
		//create back and front lighting
		/*
		this.lighting.push( new THREE.RectAreaLight( 0xffffff, lightingIntencity,  this.genObject.dimensions[0], this.genObject.dimensions[1] ) );
		this.lighting[this.lighting.length-1].color.r = this.colourObject._currentColour[0]/255;
		this.lighting[this.lighting.length-1].color.g = this.colourObject._currentColour[1]/255;
		this.lighting[this.lighting.length-1].color.b = this.colourObject._currentColour[2]/255;
		this.lighting[this.lighting.length-1].position.set( this.genObject.position[0], this.genObject.position[1], this.genObject.position[2]+this.lightZOffset );
		this.lighting[this.lighting.length-1].lookAt( this.genObject.position[0], this.genObject.position[1], this.genObject.position[2] );
		this.scene.add( this.lighting[this.lighting.length-1] );
		this.lighting.push( new THREE.RectAreaLight( 0xffffff, lightingIntencity,  this.genObject.dimensions[0], this.genObject.dimensions[1] ) );
		this.lighting[this.lighting.length-1].color.r = this.colourObject._currentColour[0]/255;
		this.lighting[this.lighting.length-1].color.g = this.colourObject._currentColour[1]/255;
		this.lighting[this.lighting.length-1].color.b = this.colourObject._currentColour[2]/255;
		this.lighting[this.lighting.length-1].position.set( this.genObject.position[0], this.genObject.position[1], this.genObject.position[2]-this.lightZOffset );
		this.lighting[this.lighting.length-1].lookAt( this.genObject.position[0], this.genObject.position[1], this.genObject.position[2] );
		this.scene.add( this.lighting[this.lighting.length-1] );		
		*/
	}
	animate = function(colourIndex, objectScale, objectSpeed)
	{
		
	}
	generateRandomDirections = function()
	{
		if( Math.round(Math.random()) == 1 ){this.randomDirectionArray[0]=1;}else{this.randomDirectionArray[0]=-1;}
		if( Math.round(Math.random()) == 1 ){this.randomDirectionArray[1]=1;}else{this.randomDirectionArray[1]=-1;}
		if( Math.round(Math.random()) == 1 ){this.randomDirectionArray[2]=1;}else{this.randomDirectionArray[2]=-1;}
	}
}
export default threeLitFaces;