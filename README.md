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
3. Insall Vite
```
cd ThreeVJ
npm install --save-dev vite
```
4. Extract the contents of this repo into the same folder

# OSC Input

OSC is delivered to this app via WebSockets using [OSCtoBrowserViaWS](https://github.com/leonyuhanov/OSCtoBrowserViaWS) at present its disabled

# MIDI Input

MIDI is handled by the browsers MIDI implenetation, and fed into a custom MIDI control class.
