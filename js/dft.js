
var N = 512; //number of points, even
let XX = []; //length N - time domain signal

let REX = []; //length N/2 - real part of frequency domain
let IMX = []; //length N/2 - imaginary part of frequency domain

//the time domain signal held in XX is calculated from the frequency domain signals held in REX and IMX
function discreteFourierTransform_inverse () {
    
    //find the cosine and sine wave amplitudes
    
    for (var K = 0; K < N/2; K++) {
        REX[K] = REX[K] / (N/2);
        IMX[K] = IMX[K] / (N/2);
    }

    REX[0] = REX[0]/2;
    REX[N/2] = REX[N/2]/2;

    //zero XX so it can be used as an accumulator
    for (var I = 0; I < 512; I++) XX[I] = 0;

    //loop through each frequency generating the entire length of the sine and cosine waves, and add them to the accumulator signal, XX
    for (var K = 0; K < N/2; K++) {
        for (var I = 0; I < N; I++) {
            XX[I] += REX[K] * Math.cos(2*Math.PI*K*I*N);
            XX[I] += IMX[K] * Math.sin(2*Math.PI*K*I*N);
        }
    }
}