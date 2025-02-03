# ThreeVJ
Realtime multi-scene, interactive VJ Suite based on ThreeJS
# Prerequisite Hardware

-  A PC or MAC that can run NodeJS, has a Chrome-like browser (Edge works fine), High Perfomance CPU and mid range GPU. 
-  For MIDI Input you will need a MIDI controler or input device
-  For OSC Input you will need the machine to be network connected and some kind of OSC capable device, hardware or software eg.. [Touch OSC](https://hexler.net/touchosc) 

# Prerequisite Software

1. Chrome web browser prefered, Edge works. Firefox has really poor WEBGL support for ThreeJS in my testing so dont bother using it
2. Install [Node JS](https://nodejs.org/en) this is to host Vite so you can live code/make changes quickly
3. Install [ThreeJS](https://threejs.org/docs/index.html#manual/en/introduction/Installation)
```
mkdir ThreeVJ
cd ThreeVJ
npm install --save three
```
3. Insall Vite ( note it will be running over HTTPS, there is a directory with a Self Signed CERT for your browser which will be fallged as not valid, please ignore the error and accpet the cert )
```
cd ThreeVJ
npm install --save-dev vite
```
4. Extract the contents of this repo into the same folder

# OSC Input

OSC is delivered to this app via WebSockets using [OSCtoBrowserViaWS](https://github.com/leonyuhanov/OSCtoBrowserViaWS) at present its disabled

# MIDI Input

MIDI is handled by the browsers MIDI implenetation, and fed into a custom MIDI control class.

# How to run this

```
cd ThreeVJ
npx vite --host
```
1. Open your browser to https://localhost:8080
2. Accept the Self Signed Certificate
3. Accept MIDI Access of the app from your browser

# Setting up your MIDI controlers to interact with animations

All MIDI interaction is handled by a custom midi class called [MIDIMapper.js](https://github.com/leonyuhanov/ThreeVJ/blob/main/BoilerPlate/MIDIMapper.js) (which can be found in the BoilerPlate folder). 
This class is contained within each animation added into the que system. to add a custom mapping you can call

animSys.midi().addItem(MIDI_CHANEL_BYTE, MIDI_CC_ID, "a variable name you like", MAX_VALUE, DEFAULT_VALUE_ON_LOAD);

so for example if you wanted to add a control to you animation alled "colourIncrement" assigned to MIDICC 1 on MIDI CHAN 1 with a max value of 10 and a preset value of 3 you would call the below
```
animSys.midi().addItem(176, 1, "colourIncrement", 10, 3);
```
To Read this value:(Reading a control will expire its ONCHANGE flag)
```
animSys.midi().getValue("colourIncrement");
```
To check if the MIDI INPUT has sent any updates to this control, for example if you set the value and only want the animation to change AFTER a changed midi input
```
if(animSys.midi().hasChanged("colourIncrement"))
{
  console.log(animSys.midi().getValue("colourIncrement"));
}
```
For things like Pads where you just want to triger events you can do as follows:
```
animSys.midi().addItem(176, 2, "pad1", 1, 0);
if(animSys.midi().hasChanged("pad1"))
{
  if(animSys.midi().getValue("pad1")==1)
  {
    console.log("Pad 1 was pushed");
  }
}
```



