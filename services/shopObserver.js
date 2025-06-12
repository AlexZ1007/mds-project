const { spawn } = require('child_process');
const path = require('path');


class ShopObserver {
    // when newListings reaches the threshold
    // the running of the price prediction file is triggered
    constructor(threshold = 5) {
        this.newListings = 0;
        this.threshold = threshold;
    }

    notifyNewListing() {
        this.newListings += 1;
        console.log(`New listing added. Count: ${this.newListings}/${this.threshold}`);
        
        if (this.newListings >= this.threshold) {
            this.retrain_model();
            this.newListings = 0;
        }
    }

    retrain_model() {
        console.log("Retraining price prediction model...");
        const scriptPath = path.join(__dirname, 'ml', 'price_predictor.py');
        
        const retrainScript = spawn('python', [scriptPath]);
        
        retrainScript.stdout.on('data', (data) => {
            console.log(`Retraining output: ${data}`);
        });

        retrainScript.stderr.on('data', (data) => {
            console.error(`Retraining error: ${data}`);
        });

        retrainScript.on('close', (code) => {
            console.log(`Retraining completed with code ${code}`);
        });
    }
}

module.exports = new ShopObserver();