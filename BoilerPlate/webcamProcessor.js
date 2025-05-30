// BoilerPlate/webcamProcessor.js
class WebcamProcessor {
    constructor(videoElementId) {
        this.videoElement = document.getElementById(videoElementId);
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
    }

    async startWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoElement.srcObject = stream;
            return new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.canvas.width = this.videoElement.videoWidth;
                    this.canvas.height = this.videoElement.videoHeight;
                    resolve(true);
                };
            });
        } catch (err) {
            console.error("Error accessing webcam: ", err);
            return false;
        }
    }

    getAverageBrightness() {
        if (!this.videoElement || this.videoElement.readyState !== this.videoElement.HAVE_ENOUGH_DATA) {
            return 0; // Return 0 if video is not ready
        } Kristin

        this.context.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        let sumBrightness = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Calculate brightness using a common formula
            const brightness = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
            sumBrightness += brightness;
        }

        // Normalize brightness to a 0-1 range
        return (sumBrightness / (this.canvas.width * this.canvas.height)) / 255;
    }

    // You can add other processing functions here, like motion detection
    // getMotionLevel() { ... }
}

export default WebcamProcessor;